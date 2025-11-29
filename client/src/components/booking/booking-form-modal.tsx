import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { BookingWithRelations, Room, Customer, Project, Editor } from "@shared/schema";

const bookingFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  bookingFromTime: z.string().min(1, "Start time is required"),
  bookingToTime: z.string().min(1, "End time is required"),
  actualFromTime: z.string().optional(),
  actualToTime: z.string().optional(),
  breakMinutes: z.coerce.number().min(0).default(0),
  customerId: z.coerce.number().optional(),
  projectId: z.coerce.number().optional(),
  roomId: z.coerce.number().min(1, "Room is required"),
  editorId: z.coerce.number().optional(),
  contactPerson: z.string().optional(),
  status: z.string().default("Tentative"),
  remarks: z.string().optional(),
  isCancelled: z.boolean().default(false),
  cancelReason: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData, ignoreConflict: boolean) => void;
  booking?: BookingWithRelations | null;
  selectedDate: Date;
  isSubmitting: boolean;
  conflictDetected?: boolean;
}

export function BookingFormModal({
  open,
  onClose,
  onSubmit,
  booking,
  selectedDate,
  isSubmitting,
  conflictDetected = false,
}: BookingFormModalProps) {
  const [ignoreConflict, setIgnoreConflict] = useState(false);
  const [showCancelFields, setShowCancelFields] = useState(false);

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: editors = [] } = useQuery<Editor[]>({
    queryKey: ["/api/editors"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: format(selectedDate, "yyyy-MM-dd"),
      bookingFromTime: "09:00",
      bookingToTime: "18:00",
      actualFromTime: "",
      actualToTime: "",
      breakMinutes: 0,
      customerId: undefined,
      projectId: undefined,
      roomId: undefined,
      editorId: undefined,
      contactPerson: "",
      status: "Tentative",
      remarks: "",
      isCancelled: false,
      cancelReason: "",
    },
  });

  useEffect(() => {
    if (booking) {
      const bookingDate = typeof booking.date === 'string' ? booking.date : format(new Date(booking.date), "yyyy-MM-dd");
      form.reset({
        date: bookingDate,
        bookingFromTime: booking.bookingFromTime?.substring(0, 5) || "09:00",
        bookingToTime: booking.bookingToTime?.substring(0, 5) || "18:00",
        actualFromTime: booking.actualFromTime?.substring(0, 5) || "",
        actualToTime: booking.actualToTime?.substring(0, 5) || "",
        breakMinutes: booking.breakMinutes || 0,
        customerId: booking.customerId || undefined,
        projectId: booking.projectId || undefined,
        roomId: booking.roomId,
        editorId: booking.editorId || undefined,
        contactPerson: booking.contactPerson || "",
        status: booking.status || "Tentative",
        remarks: booking.remarks || "",
        isCancelled: booking.isCancelled || false,
        cancelReason: booking.cancelReason || "",
      });
      setShowCancelFields(booking.isCancelled || false);
    } else {
      form.reset({
        date: format(selectedDate, "yyyy-MM-dd"),
        bookingFromTime: "09:00",
        bookingToTime: "18:00",
        actualFromTime: "",
        actualToTime: "",
        breakMinutes: 0,
        customerId: undefined,
        projectId: undefined,
        roomId: undefined,
        editorId: undefined,
        contactPerson: "",
        status: "Tentative",
        remarks: "",
        isCancelled: false,
        cancelReason: "",
      });
      setShowCancelFields(false);
    }
    setIgnoreConflict(false);
  }, [booking, selectedDate, form, open]);

  const handleSubmit = (data: BookingFormData) => {
    onSubmit(data, ignoreConflict);
  };

  const calculateTotalTime = (from: string, to: string, breakMins: number) => {
    if (!from || !to) return "00:00";
    const [fromH, fromM] = from.split(":").map(Number);
    const [toH, toM] = to.split(":").map(Number);
    let total = (toH * 60 + toM) - (fromH * 60 + fromM) - breakMins;
    if (total < 0) total += 24 * 60;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const bookingFrom = form.watch("bookingFromTime");
  const bookingTo = form.watch("bookingToTime");
  const breakMins = form.watch("breakMinutes");
  const actualFrom = form.watch("actualFromTime");
  const actualTo = form.watch("actualToTime");

  const totalBookingTime = calculateTotalTime(bookingFrom, bookingTo, breakMins);
  const totalActualTime = actualFrom && actualTo ? calculateTotalTime(actualFrom, actualTo, breakMins) : "-";

  const activeRooms = rooms.filter((r) => r.active);
  const activeCustomers = customers.filter((c) => c.active);
  const activeProjects = projects.filter((p) => p.active);
  const activeEditors = editors.filter((e) => e.active);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="booking-form-modal">
        <DialogHeader>
          <DialogTitle>{booking ? "Modify Booking" : "Add New Booking"}</DialogTitle>
          <DialogDescription className="sr-only">
            {booking ? "Edit an existing booking" : "Create a new booking for a room"}
          </DialogDescription>
        </DialogHeader>

        {conflictDetected && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>A booking conflict was detected for this room and time.</span>
              <div className="flex items-center gap-2 ml-4">
                <Checkbox
                  id="ignoreConflict"
                  checked={ignoreConflict}
                  onCheckedChange={(checked) => setIgnoreConflict(checked === true)}
                  data-testid="checkbox-ignore-conflict"
                />
                <label htmlFor="ignoreConflict" className="text-sm cursor-pointer">
                  Ignore Conflict
                </label>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Date and Time Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-booking-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="bookingFromTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-booking-from-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookingToTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-booking-to-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actual Time Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="actualFromTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual From</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-actual-from-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualToTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual To</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} data-testid="input-actual-to-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="breakMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break (mins)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} data-testid="input-break-minutes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Time</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                      {totalBookingTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer and Project */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeCustomers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-project">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Room and Editor */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room *</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(parseInt(val))}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-room">
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id.toString()}>
                            {room.name} ({room.type})
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
                name="editorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Editor</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={(val) => field.onChange(val ? parseInt(val) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-editor">
                          <SelectValue placeholder="Select editor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeEditors.map((editor) => (
                          <SelectItem key={editor.id} value={editor.id.toString()}>
                            {editor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact and Status */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Contact name" data-testid="input-contact-person" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tentative">Tentative</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes or remarks..."
                      rows={3}
                      data-testid="textarea-remarks"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cancel Section */}
            {booking && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="showCancel"
                    checked={showCancelFields}
                    onCheckedChange={(checked) => {
                      setShowCancelFields(checked === true);
                      if (!checked) {
                        form.setValue("isCancelled", false);
                        form.setValue("cancelReason", "");
                      }
                    }}
                    data-testid="checkbox-show-cancel"
                  />
                  <label htmlFor="showCancel" className="text-sm font-medium cursor-pointer text-destructive">
                    Cancel this booking
                  </label>
                </div>
                
                {showCancelFields && (
                  <FormField
                    control={form.control}
                    name="cancelReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cancellation Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Reason for cancellation..."
                            rows={2}
                            data-testid="textarea-cancel-reason"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-save-booking">
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {booking ? "Update Booking" : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
