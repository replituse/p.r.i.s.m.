import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Pencil, Trash2, UserCog, Loader2 } from "lucide-react";
import type { Editor } from "@shared/schema";

const specializations = [
  "Video Editor",
  "Sound Editor",
  "VFX Artist",
  "Colorist",
  "Motion Graphics",
  "Audio Engineer",
  "Client Technician",
  "Other",
] as const;

const editorFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  active: z.boolean().default(true),
});

type EditorFormData = z.infer<typeof editorFormSchema>;

export default function EditorsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);

  const { data: editors = [], isLoading } = useQuery<Editor[]>({
    queryKey: ["/api/editors"],
  });

  const form = useForm<EditorFormData>({
    resolver: zodResolver(editorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: EditorFormData) => apiRequest("POST", "/api/editors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editors"] });
      setShowModal(false);
      form.reset();
      toast({ title: "Success", description: "Editor created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditorFormData & { id: number }) =>
      apiRequest("PUT", `/api/editors/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editors"] });
      setShowModal(false);
      setSelectedEditor(null);
      form.reset();
      toast({ title: "Success", description: "Editor updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/editors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editors"] });
      toast({ title: "Success", description: "Editor deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setSelectedEditor(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      specialization: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (editor: Editor) => {
    setSelectedEditor(editor);
    form.reset({
      name: editor.name,
      email: editor.email || "",
      phone: editor.phone || "",
      specialization: editor.specialization || "",
      active: editor.active ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = (data: EditorFormData) => {
    if (selectedEditor) {
      updateMutation.mutate({ ...data, id: selectedEditor.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredEditors = editors.filter((editor) =>
    editor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    editor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    editor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const specializationColors: Record<string, string> = {
    "Video Editor": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    "Sound Editor": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    "VFX Artist": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    "Colorist": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    "Motion Graphics": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    "Audio Engineer": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    "Client Technician": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "Other": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <AppLayout>
      <div className="p-6" data-testid="editors-page">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Editor Management
              </CardTitle>
              <Button onClick={handleAdd} data-testid="button-add-editor">
                <Plus className="w-4 h-4 mr-2" />
                Add Editor
              </Button>
            </div>
            <div className="relative max-w-sm mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search editors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-editors"
              />
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredEditors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <UserCog className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No editors found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by adding your first editor"}
                </p>
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Editor
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEditors.map((editor) => (
                      <TableRow key={editor.id} data-testid={`editor-row-${editor.id}`}>
                        <TableCell className="font-medium">{editor.name}</TableCell>
                        <TableCell>{editor.email || "-"}</TableCell>
                        <TableCell>{editor.phone || "-"}</TableCell>
                        <TableCell>
                          {editor.specialization ? (
                            <Badge className={specializationColors[editor.specialization] || specializationColors.Other}>
                              {editor.specialization}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={editor.active ? "default" : "secondary"}>
                            {editor.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(editor)}
                              data-testid={`button-edit-editor-${editor.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(editor.id)}
                              data-testid={`button-delete-editor-${editor.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
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

        {/* Editor Form Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent data-testid="editor-form-modal">
            <DialogHeader>
              <DialogTitle>{selectedEditor ? "Edit Editor" : "Add New Editor"}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Editor name" data-testid="input-editor-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Email" data-testid="input-editor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Phone" data-testid="input-editor-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-editor-specialization">
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-editor-active"
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer !mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-editor"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {selectedEditor ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
