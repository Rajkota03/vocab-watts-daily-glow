
import React, { useEffect, useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, PlusCircle } from "lucide-react";

type PromptForm = {
  category: string;
  subcategory: string;
  prompt: string;
  difficulty_level: string;
};

interface VocabPrompt extends PromptForm {
  id: string;
  created_at: string;
  updated_at: string;
}

const PromptManagerTab: React.FC = () => {
  const [prompts, setPrompts] = useState<VocabPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<VocabPrompt | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<PromptForm>({
    defaultValues: {
      category: "",
      subcategory: "",
      prompt: "",
      difficulty_level: "intermediate",
    },
  });

  // Fetch prompts from vocab_prompts table
  const fetchPrompts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vocab_prompts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load prompts", description: error.message, variant: "destructive" });
    } else {
      setPrompts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  // Reset form when editing prompt changes
  useEffect(() => {
    if (editingPrompt) {
      form.reset({
        category: editingPrompt.category,
        subcategory: editingPrompt.subcategory || "",
        prompt: editingPrompt.prompt,
        difficulty_level: editingPrompt.difficulty_level || "intermediate",
      });
    } else {
      form.reset({
        category: "",
        subcategory: "",
        prompt: "",
        difficulty_level: "intermediate",
      });
    }
    // eslint-disable-next-line
  }, [editingPrompt]);

  // Save new or edited prompt
  const handleSubmit = async (data: PromptForm) => {
    try {
      if (editingPrompt) {
        // Update
        const { error } = await supabase
          .from("vocab_prompts")
          .update({
            category: data.category,
            subcategory: data.subcategory,
            prompt: data.prompt,
            difficulty_level: data.difficulty_level,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPrompt.id);
        if (error) throw error;
        toast({ title: "Prompt updated", description: "The prompt was updated successfully!" });
      } else {
        // Create
        const { error } = await supabase
          .from("vocab_prompts")
          .insert({
            category: data.category,
            subcategory: data.subcategory,
            prompt: data.prompt,
            difficulty_level: data.difficulty_level,
          });
        if (error) throw error;
        toast({ title: "Prompt added", description: "A new prompt has been added." });
      }
      setOpenDialog(false);
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>OpenAI Prompt Management</CardTitle>
          <CardDescription>
            Manage and edit the exact OpenAI prompt and difficulty used for each vocabulary category/subcategory. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium">Prompts</h3>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingPrompt(null)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Prompt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>{editingPrompt ? "Edit Prompt" : "Add New Prompt"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <label className="font-medium mb-1">Category</label>
                    <Input {...form.register("category", { required: true })} placeholder="business, exam, slang, etc." />
                  </div>
                  <div>
                    <label className="font-medium mb-1">Subcategory</label>
                    <Input {...form.register("subcategory")} placeholder="intermediate, gre, cat, etc. (leave blank if none)" />
                  </div>
                  <div>
                    <label className="font-medium mb-1">Prompt</label>
                    <Textarea {...form.register("prompt", { required: true })} placeholder="OpenAI system/user prompt for this category/subcategory" />
                  </div>
                  <div>
                    <label className="font-medium mb-1">Difficulty Level</label>
                    <Input {...form.register("difficulty_level", { required: true })} placeholder="e.g. beginner, intermediate, professional, gre, etc." />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button type="submit">{editingPrompt ? "Update Prompt" : "Add Prompt"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? (
            <div>Loading prompts...</div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    <TableHead className="w-72">Prompt</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.subcategory ?? ""}</TableCell>
                      <TableCell className="text-xs">{p.prompt}</TableCell>
                      <TableCell>{p.difficulty_level}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => { setEditingPrompt(p); setOpenDialog(true); }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {prompts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground text-center">
                        No prompts yet. Click "Add Prompt".
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptManagerTab;
