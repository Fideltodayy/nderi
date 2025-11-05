import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, Settings as SettingsIcon } from "lucide-react";
import { useCategories, useSubjects, useAddTaxonomy, useDeleteTaxonomy, useTaxonomy } from "@/hooks/useTaxonomy";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [newCategory, setNewCategory] = useState("");
  const [newSubject, setNewSubject] = useState("");
  
  const { data: categories = [] } = useCategories();
  const { data: subjects = [] } = useSubjects();
  const { data: allTaxonomy = [] } = useTaxonomy();
  const addTaxonomy = useAddTaxonomy();
  const deleteTaxonomy = useDeleteTaxonomy();
  const { toast } = useToast();

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) {
      toast({
        title: "Invalid category",
        description: "Category name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (categories.includes(trimmed)) {
      toast({
        title: "Category exists",
        description: "This category already exists",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTaxonomy.mutateAsync({
        type: 'category',
        name: trimmed
      });
      setNewCategory("");
      toast({
        title: "Category added",
        description: `${trimmed} has been added to categories`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive"
      });
    }
  };

  const handleAddSubject = async () => {
    const trimmed = newSubject.trim();
    if (!trimmed) {
      toast({
        title: "Invalid subject",
        description: "Subject name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    if (subjects.includes(trimmed)) {
      toast({
        title: "Subject exists",
        description: "This subject already exists",
        variant: "destructive"
      });
      return;
    }

    try {
      await addTaxonomy.mutateAsync({
        type: 'subject',
        name: trimmed
      });
      setNewSubject("");
      toast({
        title: "Subject added",
        description: `${trimmed} has been added to subjects`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (category: string) => {
    // Find the taxonomy entry
    const taxonomyEntry = allTaxonomy.find(t => t.type === 'category' && t.name === category);
    if (!taxonomyEntry || !taxonomyEntry.id) return;
    
    try {
      await deleteTaxonomy.mutateAsync(taxonomyEntry.id);
      toast({
        title: "Category deleted",
        description: `${category} has been removed`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = async (subject: string) => {
    // Find the taxonomy entry
    const taxonomyEntry = allTaxonomy.find(t => t.type === 'subject' && t.name === subject);
    if (!taxonomyEntry || !taxonomyEntry.id) return;
    
    try {
      await deleteTaxonomy.mutateAsync(taxonomyEntry.id);
      toast({
        title: "Subject deleted",
        description: `${subject} has been removed`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground mt-1">Manage book categories and subjects</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new category (e.g., Story Books, Text Books)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  data-testid="input-new-category"
                />
                <Button onClick={handleAddCategory} data-testid="button-add-category">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Existing Categories ({categories.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-sm px-3 py-1">
                        {cat}
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="ml-2 hover:text-destructive"
                          data-testid={`button-delete-category-${cat}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No categories yet. Add your first category above.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book Subjects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new subject (e.g., English, Kiswahili, Mathematics)"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                  data-testid="input-new-subject"
                />
                <Button onClick={handleAddSubject} data-testid="button-add-subject">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Existing Subjects ({subjects.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.length > 0 ? (
                    subjects.map((subj) => (
                      <Badge key={subj} variant="secondary" className="text-sm px-3 py-1">
                        {subj}
                        <button
                          onClick={() => handleDeleteSubject(subj)}
                          className="ml-2 hover:text-destructive"
                          data-testid={`button-delete-subject-${subj}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects yet. Add your first subject above.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

