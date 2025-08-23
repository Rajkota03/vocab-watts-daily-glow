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
import OpenAIBalanceCard from '../OpenAIBalanceCard';

interface CategoryStats {
  category: string;
  total_words: number;
  duplicates: number;
  levels: {
    beginner?: number;
    intermediate?: number;
    advanced?: number;
    gre?: number;
    gmat?: number;
    ielts?: number;
    sat?: number;
    toefl?: number;
  };
}

// Regular categories with difficulty levels
const REGULAR_CATEGORIES = [
  { name: 'daily', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'business', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'interview', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'slang', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'rare', levels: ['beginner', 'intermediate', 'advanced'] },
  { name: 'expression', levels: ['beginner', 'intermediate', 'advanced'] },
];

// Exam categories with specific exam types (not difficulty levels)
const EXAM_TYPES = ['gre', 'gmat', 'ielts', 'sat', 'toefl'];

const BulkOperationsTab = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [clearLoading, setClearLoading] = useState(false);
  const [topUpProgress, setTopUpProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [wordsPerCategory, setWordsPerCategory] = useState(50);

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

      // Initialize category map with proper structure
      const categoryMap = new Map<string, CategoryStats>();
      
      // Initialize regular categories
      REGULAR_CATEGORIES.forEach(category => {
        categoryMap.set(category.name, {
          category: category.name,
          total_words: 0,
          duplicates: 0,
          levels: {}
        });
      });
      
      // Initialize exam category
      categoryMap.set('exam', {
        category: 'exam',
        total_words: 0,
        duplicates: 0,
        levels: {}
      });

      words?.forEach(word => {
        if (word.category.startsWith('exam-')) {
          // Handle exam categories
          const examType = word.category.replace('exam-', '');
          const examStats = categoryMap.get('exam')!;
          examStats.total_words++;
          examStats.levels[examType as keyof typeof examStats.levels] = 
            (examStats.levels[examType as keyof typeof examStats.levels] || 0) + 1;
        } else if (word.category.includes('-')) {
          // Handle regular categories with levels
          const [categoryName, level] = word.category.split('-');
          if (categoryMap.has(categoryName)) {
            const categoryStats = categoryMap.get(categoryName)!;
            categoryStats.total_words++;
            categoryStats.levels[level as keyof typeof categoryStats.levels] = 
              (categoryStats.levels[level as keyof typeof categoryStats.levels] || 0) + 1;
          }
        }
      });

      // Check for duplicates within each category
      const duplicatePromises = Array.from(categoryMap.keys()).map(async (category) => {
        let pattern = category;
        if (category === 'exam') {
          pattern = 'exam-%';
        } else {
          pattern = `${category}-%`;
        }
        
        const { data: categoryWords, error } = await supabase
          .from('vocabulary_words')
          .select('word')
          .like('category', pattern);
        
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
      
      console.log('Starting vocabulary word deletion...');

      // Call the database function to delete all words
      const { data: result, error } = await supabase
        .rpc('delete_all_vocabulary_words' as any);

      if (error) {
        throw new Error(`Database function error: ${error.message}`);
      }

      console.log('Deletion result:', result);

      toast({
        title: "Words Cleared",
        description: result?.message || "All vocabulary words have been deleted successfully.",
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
    const regularTotal = REGULAR_CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0);
    const examTotal = EXAM_TYPES.length;
    const totalWords = (regularTotal + examTotal) * wordsPerCategory;
    
    if (!window.confirm(`This will generate ${wordsPerCategory} NEW words for each category and level combination (approximately ${totalWords.toLocaleString()} total words), avoiding duplicates. Continue?`)) {
      return;
    }

    try {
      setLoading(true);
      setTopUpProgress(0);
      
      const totalOperations = regularTotal + examTotal;
      let completed = 0;

      // Handle regular categories
      for (const category of REGULAR_CATEGORIES) {
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

      // Handle exam types
      for (const examType of EXAM_TYPES) {
        const categoryLevel = `exam-${examType}`;
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold">{REGULAR_CATEGORIES.length + 1}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
        <div className="md:col-span-1">
          <OpenAIBalanceCard />
        </div>
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
                Total words to generate: {((REGULAR_CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0) + EXAM_TYPES.length) * wordsPerCategory).toLocaleString()}
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
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Category</th>
                        <th className="text-center p-2 font-medium">Beginner</th>
                        <th className="text-center p-2 font-medium">Intermediate</th>
                        <th className="text-center p-2 font-medium">Advanced</th>
                        <th className="text-center p-2 font-medium">GRE</th>
                        <th className="text-center p-2 font-medium">GMAT</th>
                        <th className="text-center p-2 font-medium">IELTS</th>
                        <th className="text-center p-2 font-medium">SAT</th>
                        <th className="text-center p-2 font-medium">TOEFL</th>
                        <th className="text-center p-2 font-medium">Total</th>
                        <th className="text-center p-2 font-medium">Duplicates</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat) => (
                        <tr key={stat.category} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium capitalize">
                            {stat.category === 'exam' ? 'Exam (All Types)' : stat.category}
                          </td>
                          {stat.category === 'exam' ? (
                            <>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.gre ? "default" : "secondary"}>
                                  {stat.levels.gre || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.gmat ? "default" : "secondary"}>
                                  {stat.levels.gmat || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.ielts ? "default" : "secondary"}>
                                  {stat.levels.ielts || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.sat ? "default" : "secondary"}>
                                  {stat.levels.sat || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.toefl ? "default" : "secondary"}>
                                  {stat.levels.toefl || 0}
                                </Badge>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.beginner ? "default" : "secondary"}>
                                  {stat.levels.beginner || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.intermediate ? "default" : "secondary"}>
                                  {stat.levels.intermediate || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">
                                <Badge variant={stat.levels.advanced ? "default" : "secondary"}>
                                  {stat.levels.advanced || 0}
                                </Badge>
                              </td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                              <td className="text-center p-2">-</td>
                            </>
                          )}
                          <td className="text-center p-2">
                            <Badge variant="outline" className="font-bold">
                              {stat.total_words}
                            </Badge>
                          </td>
                          <td className="text-center p-2">
                            <Badge 
                              variant={stat.duplicates > 0 ? "destructive" : "secondary"}
                              className={stat.duplicates > 0 ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" : ""}
                            >
                              {stat.duplicates}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperationsTab;