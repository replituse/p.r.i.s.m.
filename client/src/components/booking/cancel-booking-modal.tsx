import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import type { BookingWithRelations } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface CancelBookingModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  booking: BookingWithRelations | null;
  isSubmitting: boolean;
}

export function CancelBookingModal({
  open,
  onClose,
  onConfirm,
  booking,
  isSubmitting,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  if (!booking) return null;

  const bookingDate = typeof booking.date === 'string' 
    ? parseISO(booking.date) 
    : new Date(booking.date);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="cancel-booking-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            This action will mark the booking as cancelled. You can still view it in the booking history.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium mb-2">Booking Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              <span className="font-medium">{format(bookingDate, "MMM d, yyyy")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Time:</span>{" "}
              <span className="font-medium">
                {booking.bookingFromTime?.substring(0, 5)} - {booking.bookingToTime?.substring(0, 5)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Room:</span>{" "}
              <span className="font-medium">{booking.room?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Customer:</span>{" "}
              <span className="font-medium">{booking.customer?.name || "-"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancelReason">Reason for Cancellation</Label>
          <Textarea
            id="cancelReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter the reason for cancellation..."
            rows={3}
            data-testid="textarea-cancel-reason"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} data-testid="button-keep-booking">
            Keep Booking
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
            data-testid="button-confirm-cancel"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Cancel Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
