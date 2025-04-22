
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  created_at: string;
}

type FormData = {
  word: string;
  definition: string;
  example: string;
  category: string;
};

const VocabularyTab = () => {
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWord, setEditingWord] = useState<VocabularyWord | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      word: '',
      definition: '',
      example: '',
      category: 'general',
    },
  });

  useEffect(() => {
    fetchVocabularyWords();
  }, []);

  useEffect(() => {
    if (editingWord) {
      form.reset({
        word: editingWord.word,
        definition: editingWord.definition,
        example: editingWord.example,
        category: editingWord.category,
      });
    } else {
      form.reset({
        word: '',
        definition: '',
        example: '',
        category: 'general',
      });
    }
  }, [editingWord, form]);

  const fetchVocabularyWords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vocabulary_words')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vocabulary words:', error);
        toast({
          title: "Failed to load vocabulary words",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setVocabularyWords(data || []);
      }
    } catch (error) {
      console.error('Error in fetchVocabularyWords:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load vocabulary data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingWord(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (word: VocabularyWord) => {
    setEditingWord(word);
    setOpenDialog(true);
  };

  const handleSubmit = async (data: FormData) => {
    try {
      if (editingWord) {
        // Update existing word
        const { error } = await supabase
          .from('vocabulary_words')
          .update({
            word: data.word,
            definition: data.definition,
            example: data.example,
            category: data.category,
          })
          .eq('id', editingWord.id);

        if (error) throw error;
        toast({
          title: "Word updated",
          description: `"${data.word}" has been successfully updated.`,
        });
      } else {
        // Add new word
        const { error } = await supabase
          .from('vocabulary_words')
          .insert({
            word: data.word,
            definition: data.definition,
            example: data.example,
            category: data.category,
          });

        if (error) throw error;
        toast({
          title: "Word added",
          description: `"${data.word}" has been added to the vocabulary database.`,
        });
      }
      
      setOpenDialog(false);
      fetchVocabularyWords();
    } catch (error) {
      console.error('Error saving vocabulary word:', error);
      toast({
        title: "Error",
        description: "Failed to save vocabulary word",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, word: string) => {
    if (confirm(`Are you sure you want to delete "${word}"?`)) {
      try {
        const { error } = await supabase
          .from('vocabulary_words')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        toast({
          title: "Word deleted",
          description: `"${word}" has been removed from the vocabulary database.`,
        });
        
        fetchVocabularyWords();
      } catch (error) {
        console.error('Error deleting vocabulary word:', error);
        toast({
          title: "Error",
          description: "Failed to delete vocabulary word",
          variant: "destructive"
        });
      }
    }
  };

  const filteredWords = vocabularyWords.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    word.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vocabulary Management</h2>
        <p className="text-muted-foreground">
          Manage vocabulary words, categories, and related content.
        </p>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Vocabulary Database</CardTitle>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Word
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingWord ? 'Edit Word' : 'Add New Word'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="word"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Word</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter vocabulary word" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="definition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Definition</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter the definition"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="example"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Example</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter an example usage"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., business, academic, slang" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingWord ? 'Update' : 'Add'} Word
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by word, definition, or category..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading vocabulary data...</p>
            </div>
          ) : filteredWords.length === 0 ? (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-4">No vocabulary words found</p>
              <Button variant="outline" onClick={handleOpenAddDialog}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Word
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Definition</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWords.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{word.definition}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{word.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(word)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(word.id, word.word)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VocabularyTab;
