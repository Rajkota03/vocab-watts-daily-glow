import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Upload, BarChart3, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CategoryStats {
  category: string;
  total_words: number;
  duplicates: number;
  levels: {
    beginner?: number;
    intermediate?: number;
    advanced?: number;
    professional?: number;
  };
}

const CATEGORIES = [
  { name: 'daily', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'business', levels: ['beginner', 'intermediate', 'professional'] },
  { name: 'academic', levels: ['intermediate', 'advanced'] },
  { name: 'creative', levels: ['intermediate', 'advanced'] },
  { name: 'exam', levels: ['intermediate', 'advanced'] },
  { name: 'interview', levels: ['beginner', 'intermediate'] },
  { name: 'slang', levels: ['intermediate', 'advanced'] },
];

const BulkOperationsTab = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [topUpProgress, setTopUpProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [wordsPerCategory, setWordsPerCategory] = useState(500);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Get all vocabulary words
      const { data: words, error } = await supabase
        .from('vocabulary_words')
        .select('category, word')
        .order('category');

      if (error) throw error;

      // Process stats by category
      const categoryMap = new Map<string, CategoryStats>();
      
      words?.forEach(word => {
        const mainCategory = word.category.split('-')[0];
        const level = word.category.includes('-') ? word.category.split('-')[1] : 'intermediate';
        
        if (!categoryMap.has(mainCategory)) {
          categoryMap.set(mainCategory, {
            category: mainCategory,
            total_words: 0,
            duplicates: 0,
            levels: {}
          });
        }
        
        const categoryStats = categoryMap.get(mainCategory)!;
        categoryStats.total_words++;
        categoryStats.levels[level as keyof typeof categoryStats.levels] = 
          (categoryStats.levels[level as keyof typeof categoryStats.levels] || 0) + 1;
      });

      // Check for duplicates within each category
      const duplicatePromises = Array.from(categoryMap.keys()).map(async (category) => {
        const { data: categoryWords, error } = await supabase
          .from('vocabulary_words')
          .select('word')
          .like('category', `${category}%`);
        
        if (error) return { category, duplicates: 0 };
        
        const wordCounts = new Map<string, number>();
        categoryWords?.forEach(w => {
          const count = wordCounts.get(w.word.toLowerCase()) || 0;
          wordCounts.set(w.word.toLowerCase(), count + 1);
        });
        
        let duplicates = 0;
        wordCounts.forEach(count => {
          if (count > 1) duplicates += count - 1;
        });
        
        return { category, duplicates };
      });

      const duplicateResults = await Promise.all(duplicatePromises);
      duplicateResults.forEach(({ category, duplicates }) => {
        const stats = categoryMap.get(category);
        if (stats) stats.duplicates = duplicates;
      });

      setStats(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vocabulary statistics",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const clearAllWords = async () => {
    if (!window.confirm('Are you sure you want to delete ALL vocabulary words? This action cannot be undone!')) {
      return;
    }

    try {
      setClearLoading(true);
      
      // First check admin status
      const { data: adminCheck, error: adminError } = await supabase.rpc('has_role', {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
        _role: 'admin'
      });

      if (adminError) {
        throw new Error(`Admin check failed: ${adminError.message}`);
      }

      if (!adminCheck) {
        throw new Error('Insufficient permissions: Admin role required');
      }

      // Get count before deletion for verification
      const { count: beforeCount, error: countError } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw new Error(`Count check failed: ${countError.message}`);
      }

      console.log(`About to delete ${beforeCount} vocabulary words`);

      // Use service role approach through RPC if direct deletion fails
      const { data: deleteResult, error: deleteError } = await supabase
        .rpc('delete_all_vocabulary_words');

      if (deleteError) {
        // Fallback to direct deletion
        console.log('RPC failed, trying direct deletion:', deleteError.message);
        
        const { error: directDeleteError } = await supabase
          .from('vocabulary_words')
          .delete()
          .not('id', 'is', null);

        if (directDeleteError) {
          throw new Error(`Direct deletion failed: ${directDeleteError.message}`);
        }
      }

      // Verify deletion
      const { count: afterCount, error: verifyError } = await supabase
        .from('vocabulary_words')
        .select('*', { count: 'exact', head: true });

      if (verifyError) {
        throw new Error(`Verification failed: ${verifyError.message}`);
      }

      console.log(`Deleted words. Before: ${beforeCount}, After: ${afterCount}`);

      toast({
        title: "Words Cleared",
        description: `Successfully deleted ${beforeCount - (afterCount || 0)} vocabulary words.`,
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error clearing words:', error);
      toast({
        title: "Error", 
        description: `Failed to clear vocabulary words: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setClearLoading(false);
    }
  };

  const topUpWords = async () => {
    const totalWords = CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0) * wordsPerCategory;
    if (!window.confirm(`This will generate ${wordsPerCategory} NEW words for each category and level combination (approximately ${totalWords.toLocaleString()} total words), avoiding duplicates. Continue?`)) {
      return;
    }

    try {
      setLoading(true);
      setTopUpProgress(0);
      
      // Generate new words without clearing
      const totalOperations = CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0);
      let completed = 0;

      for (const category of CATEGORIES) {
        for (const level of category.levels) {
          const categoryLevel = `${category.name}-${level}`;
          setCurrentOperation(`Generating words for ${categoryLevel}...`);

          try {
            const { data: result, error: funcError } = await supabase.functions.invoke('generate-vocab-words', {
              body: {
                category: categoryLevel,
                count: wordsPerCategory
              }
            });

            if (funcError) {
              throw new Error(`Function error: ${funcError.message}`);
            }
            
            if (result?.error) {
              console.warn(`Failed to generate words for ${categoryLevel}:`, result.error);
              toast({
                title: "Partial Failure",
                description: `Failed to generate words for ${categoryLevel}`,
                variant: "destructive"
              });
            } else {
              // Insert the generated words directly into the database
              if (result?.words && result.words.length > 0) {
                const { error: insertError } = await supabase
                  .from('vocabulary_words')
                  .insert(
                    result.words.map((word: any) => ({
                      word: word.word,
                      definition: word.definition,
                      example: word.example,
                      category: categoryLevel,
                      part_of_speech: word.partOfSpeech || word.part_of_speech,
                      memory_hook: word.memoryHook || word.memory_hook,
                      pronunciation: word.pronunciation
                    }))
                  );

                if (insertError) {
                  console.error(`Error inserting words for ${categoryLevel}:`, insertError);
                }
              }
            }
          } catch (err) {
            console.error(`Error processing ${categoryLevel}:`, err);
          }

          completed++;
          setTopUpProgress((completed / totalOperations) * 100);
          
          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setCurrentOperation('');
      toast({
        title: "Top-up Complete",
        description: "Vocabulary words have been generated and stored successfully.",
      });

      // Refresh stats
      await fetchStats();
    } catch (error) {
      console.error('Error during top-up:', error);
      toast({
        title: "Error",
        description: "Failed to complete vocabulary top-up",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setTopUpProgress(0);
      setCurrentOperation('');
    }
  };

  const getTotalWords = () => {
    return stats.reduce((sum, stat) => sum + stat.total_words, 0);
  };

  const getTotalDuplicates = () => {
    return stats.reduce((sum, stat) => sum + stat.duplicates, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bulk Operations</h2>
        <p className="text-muted-foreground">
          Manage vocabulary database operations, generate words in bulk, and view statistics.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalWords().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All vocabulary words</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Duplicates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getTotalDuplicates()}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CATEGORIES.length}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear All Words
            </CardTitle>
            <CardDescription>
              Remove all vocabulary words. This cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={clearAllWords}
              disabled={clearLoading}
              variant="destructive"
              className="w-full"
            >
              {clearLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Words
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Top Up Words
            </CardTitle>
            <CardDescription>
              Generate new words for each category and level combination using AI, avoiding duplicates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="words-count">Words per category/level combination</Label>
              <Input
                id="words-count"
                type="number"
                min="1"
                max="1000"
                value={wordsPerCategory}
                onChange={(e) => setWordsPerCategory(Number(e.target.value))}
                disabled={loading}
                placeholder="Enter number of words"
              />
              <p className="text-xs text-muted-foreground">
                Total words to generate: {(CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0) * wordsPerCategory).toLocaleString()}
              </p>
            </div>
            <Button 
              onClick={topUpWords}
              disabled={loading || wordsPerCategory < 1}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Add {wordsPerCategory} Words Each
                </>
              )}
            </Button>
            {loading && (
              <div className="mt-4 space-y-2">
                <Progress value={topUpProgress} className="w-full" />
                <p className="text-sm text-muted-foreground">{currentOperation}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.round(topUpProgress)}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Category Statistics
          </CardTitle>
          <CardDescription>
            Word count and duplicates by category and level.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading statistics...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No vocabulary words found
                </div>
              ) : (
                stats.map((stat) => (
                  <div key={stat.category} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{stat.category}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {stat.total_words} words
                        </Badge>
                        {stat.duplicates > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {stat.duplicates} duplicates
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(stat.levels).map(([level, count]) => (
                        <div key={level} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{level}:</span>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperationsTab;