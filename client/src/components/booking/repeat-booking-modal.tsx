import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Calendar, Repeat } from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import type { BookingWithRelations } from "@shared/schema";

const repeatFormSchema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  repeatPattern: z.string().default("daily"),
});

type RepeatFormData = z.infer<typeof repeatFormSchema>;

interface RepeatBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RepeatFormData) => void;
  booking: BookingWithRelations | null;
  isSubmitting: boolean;
}

export function RepeatBookingModal({
  open,
  onClose,
  onSubmit,
  booking,
  isSubmitting,
}: RepeatBookingModalProps) {
  const bookingDate = booking?.date
    ? typeof booking.date === "string"
      ? booking.date
      : format(new Date(booking.date), "yyyy-MM-dd")
    : format(new Date(), "yyyy-MM-dd");

  const form = useForm<RepeatFormData>({
    resolver: zodResolver(repeatFormSchema),
    defaultValues: {
      fromDate: bookingDate,
      toDate: format(addDays(new Date(bookingDate), 7), "yyyy-MM-dd"),
      repeatPattern: "daily",
    },
  });

  const fromDate = form.watch("fromDate");
  const toDate = form.watch("toDate");
  const repeatPattern = form.watch("repeatPattern");

  const calculateRepetitions = () => {
    if (!fromDate || !toDate) return 0;
    const days = differenceInDays(new Date(toDate), new Date(fromDate));
    if (days < 0) return 0;
    
    switch (repeatPattern) {
      case "daily":
        return days + 1;
      case "weekdays":
        let weekdayCount = 0;
        for (let i = 0; i <= days; i++) {
          const day = addDays(new Date(fromDate), i).getDay();
          if (day !== 0 && day !== 6) weekdayCount++;
        }
        return weekdayCount;
      case "weekly":
        return Math.floor(days / 7) + 1;
      default:
        return days + 1;
    }
  };

  const handleSubmit = (data: RepeatFormData) => {
    onSubmit(data);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="repeat-booking-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat className="w-5 h-5" />
            Repeat Booking
          </DialogTitle>
          <DialogDescription>
            Create multiple bookings based on the selected booking pattern.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-2">Original Booking</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Room:</span>{" "}
              <span className="font-medium">{booking.room?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>{" "}
              <span className="font-medium">
                {booking.bookingFromTime?.substring(0, 5)} - {booking.bookingToTime?.substring(0, 5)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Customer:</span>{" "}
              <span className="font-medium">{booking.customer?.name || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Project:</span>{" "}
              <span className="font-medium">{booking.project?.name || "-"}</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-repeat-from-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="toDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-repeat-to-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="repeatPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Pattern</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger data-testid="select-repeat-pattern">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekdays">Weekdays Only</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-primary/10 rounded-lg p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {calculateRepetitions()} bookings will be created
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on the selected date range and pattern
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-repeat">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || calculateRepetitions() === 0}
                data-testid="button-create-repeat"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Bookings
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
