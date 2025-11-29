import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/app-layout";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { BookingGrid } from "@/components/booking/booking-grid";
import { BookingFormModal } from "@/components/booking/booking-form-modal";
import { RepeatBookingModal } from "@/components/booking/repeat-booking-modal";
import { CancelBookingModal } from "@/components/booking/cancel-booking-modal";
import { format, parseISO, isSameDay, addDays } from "date-fns";
import type { BookingWithRelations, Booking } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);
  const [conflictDetected, setConflictDetected] = useState(false);

  const { data: allBookings = [], isLoading: isLoadingAll } = useQuery<BookingWithRelations[]>({
    queryKey: ["/api/bookings"],
  });

  const dateBookings = allBookings.filter((booking) => {
    const bookingDate = typeof booking.date === 'string' ? parseISO(booking.date) : new Date(booking.date);
    return isSameDay(bookingDate, selectedDate);
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: { booking: any; ignoreConflict: boolean }) => {
      return await apiRequest("POST", "/api/bookings", {
        ...data.booking,
        ignoreConflict: data.ignoreConflict,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowBookingModal(false);
      setSelectedBooking(null);
      setConflictDetected(false);
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("conflict")) {
        setConflictDetected(true);
        toast({
          title: "Booking Conflict",
          description: "A booking already exists for this room and time. Check 'Ignore Conflict' to proceed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create booking",
          variant: "destructive",
        });
      }
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async (data: { id: number; booking: any; ignoreConflict: boolean }) => {
      return await apiRequest("PUT", `/api/bookings/${data.id}`, {
        ...data.booking,
        ignoreConflict: data.ignoreConflict,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowBookingModal(false);
      setSelectedBooking(null);
      setConflictDetected(false);
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
    },
    onError: (error: any) => {
      if (error.message?.includes("conflict")) {
        setConflictDetected(true);
        toast({
          title: "Booking Conflict",
          description: "A booking already exists for this room and time. Check 'Ignore Conflict' to proceed.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update booking",
          variant: "destructive",
        });
      }
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (data: { id: number; reason: string }) => {
      return await apiRequest("PUT", `/api/bookings/${data.id}/cancel`, {
        cancelReason: data.reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowCancelModal(false);
      setSelectedBooking(null);
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const repeatBookingMutation = useMutation({
    mutationFn: async (data: { bookingId: number; fromDate: string; toDate: string; repeatPattern: string }) => {
      return await apiRequest("POST", `/api/bookings/${data.bookingId}/repeat`, data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowRepeatModal(false);
      setSelectedBooking(null);
      toast({
        title: "Success",
        description: `Created ${data.count || "multiple"} repeat bookings`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create repeat bookings",
        variant: "destructive",
      });
    },
  });

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setConflictDetected(false);
    setShowBookingModal(true);
  };

  const handleEditBooking = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setConflictDetected(false);
    setShowBookingModal(true);
  };

  const handleDeleteBooking = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const handleRepeatBooking = (booking: BookingWithRelations) => {
    setSelectedBooking(booking);
    setShowRepeatModal(true);
  };

  const handleBookingSubmit = (data: any, ignoreConflict: boolean) => {
    if (selectedBooking) {
      updateBookingMutation.mutate({
        id: selectedBooking.id,
        booking: data,
        ignoreConflict,
      });
    } else {
      createBookingMutation.mutate({
        booking: data,
        ignoreConflict,
      });
    }
  };

  const handleCancelConfirm = (reason: string) => {
    if (selectedBooking) {
      cancelBookingMutation.mutate({
        id: selectedBooking.id,
        reason,
      });
    }
  };

  const handleRepeatSubmit = (data: { fromDate: string; toDate: string; repeatPattern: string }) => {
    if (selectedBooking) {
      repeatBookingMutation.mutate({
        bookingId: selectedBooking.id,
        ...data,
      });
    }
  };

  return (
    <AppLayout>
      <div className="h-full p-6" data-testid="dashboard-page">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Calendar Panel */}
          <div className="lg:col-span-4 xl:col-span-3">
            <BookingCalendar
              bookings={allBookings}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Booking Grid Panel */}
          <div className="lg:col-span-8 xl:col-span-9">
            <BookingGrid
              bookings={dateBookings}
              isLoading={isLoadingAll}
              selectedDate={selectedDate}
              onAddBooking={handleAddBooking}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
              onRepeatBooking={handleRepeatBooking}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <BookingFormModal
        open={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBooking(null);
          setConflictDetected(false);
        }}
        onSubmit={handleBookingSubmit}
        booking={selectedBooking}
        selectedDate={selectedDate}
        isSubmitting={createBookingMutation.isPending || updateBookingMutation.isPending}
        conflictDetected={conflictDetected}
      />

      <RepeatBookingModal
        open={showRepeatModal}
        onClose={() => {
          setShowRepeatModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleRepeatSubmit}
        booking={selectedBooking}
        isSubmitting={repeatBookingMutation.isPending}
      />

      <CancelBookingModal
        open={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCancelConfirm}
        booking={selectedBooking}
        isSubmitting={cancelBookingMutation.isPending}
      />
    </AppLayout>
  );
}
