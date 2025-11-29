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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Pencil, Trash2, Building2, Loader2 } from "lucide-react";
import type { Room } from "@shared/schema";

const roomTypes = ["Sound", "Video", "Outdoor", "Editing", "VFX", "Meeting", "Other"] as const;

const roomFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  shortName: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  ignoreConflict: z.boolean().default(false),
  active: z.boolean().default(true),
  notes: z.string().optional(),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

export default function RoomsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      name: "",
      shortName: "",
      type: "",
      ignoreConflict: false,
      active: true,
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: RoomFormData) => apiRequest("POST", "/api/rooms", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setShowModal(false);
      form.reset();
      toast({ title: "Success", description: "Room created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: RoomFormData & { id: number }) =>
      apiRequest("PUT", `/api/rooms/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setShowModal(false);
      setSelectedRoom(null);
      form.reset();
      toast({ title: "Success", description: "Room updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/rooms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      toast({ title: "Success", description: "Room deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = () => {
    setSelectedRoom(null);
    form.reset({
      name: "",
      shortName: "",
      type: "",
      ignoreConflict: false,
      active: true,
      notes: "",
    });
    setShowModal(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    form.reset({
      name: room.name,
      shortName: room.shortName || "",
      type: room.type,
      ignoreConflict: room.ignoreConflict || false,
      active: room.active ?? true,
      notes: room.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = (data: RoomFormData) => {
    if (selectedRoom) {
      updateMutation.mutate({ ...data, id: selectedRoom.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.shortName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const typeColors: Record<string, string> = {
    Sound: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Video: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Outdoor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Editing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    VFX: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Meeting: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  return (
    <AppLayout>
      <div className="p-6" data-testid="rooms-page">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Room Management
              </CardTitle>
              <Button onClick={handleAdd} data-testid="button-add-room">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
            <div className="relative max-w-sm mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-rooms"
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
            ) : filteredRooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No rooms found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {searchQuery ? "Try adjusting your search" : "Get started by adding your first room"}
                </p>
                <Button onClick={handleAdd} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Short Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-center">Ignore Conflict</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id} data-testid={`room-row-${room.id}`}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.shortName || "-"}</TableCell>
                        <TableCell>
                          <Badge className={typeColors[room.type] || typeColors.Other}>
                            {room.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {room.ignoreConflict ? (
                            <Badge variant="outline">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={room.active ? "default" : "secondary"}>
                            {room.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(room)}
                              data-testid={`button-edit-room-${room.id}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(room.id)}
                              data-testid={`button-delete-room-${room.id}`}
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

        {/* Room Form Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent data-testid="room-form-modal">
            <DialogHeader>
              <DialogTitle>{selectedRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Room name" data-testid="input-room-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="shortName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Short name" data-testid="input-room-short-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-room-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Additional notes" rows={3} data-testid="textarea-room-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-6">
                  <FormField
                    control={form.control}
                    name="ignoreConflict"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-ignore-conflict"
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer !mt-0">Ignore Conflict</FormLabel>
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
                            data-testid="checkbox-room-active"
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer !mt-0">Active</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-room"
                  >
                    {(createMutation.isPending || updateMutation.isPending) && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {selectedRoom ? "Update" : "Create"}
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
