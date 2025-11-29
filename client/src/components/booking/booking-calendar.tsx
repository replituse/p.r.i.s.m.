import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@shared/schema";
import { format, isSameDay, parseISO } from "date-fns";

interface BookingCalendarProps {
  bookings: Booking[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function BookingCalendar({ bookings, selectedDate, onDateSelect }: BookingCalendarProps) {
  const [month, setMonth] = useState<Date>(selectedDate);

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = typeof booking.date === 'string' ? parseISO(booking.date) : new Date(booking.date);
      return isSameDay(bookingDate, date);
    });
  };

  const getDayContent = (day: Date) => {
    const dayBookings = getBookingsForDate(day);
    if (dayBookings.length === 0) return null;

    const statusColors: Record<string, string> = {
      Tentative: "bg-yellow-500",
      Confirmed: "bg-green-500",
      Planning: "bg-blue-500",
      Completed: "bg-gray-500",
      Cancelled: "bg-red-500",
    };

    const statusCounts = dayBookings.reduce((acc, booking) => {
      const status = booking.status || "Tentative";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex gap-0.5 mt-1 justify-center">
        {Object.entries(statusCounts).slice(0, 3).map(([status, count]) => (
          <div
            key={status}
            className={`w-1.5 h-1.5 rounded-full ${statusColors[status] || "bg-gray-400"}`}
            title={`${count} ${status}`}
          />
        ))}
        {Object.keys(statusCounts).length > 3 && (
          <span className="text-[8px] text-muted-foreground">+</span>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full" data-testid="booking-calendar">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Calendar</span>
          <Badge variant="secondary" className="font-normal">
            {format(selectedDate, "MMM d, yyyy")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md"
          modifiers={{
            hasBookings: (date) => getBookingsForDate(date).length > 0,
          }}
          modifiersStyles={{
            hasBookings: {
              fontWeight: "bold",
            },
          }}
          components={{
            DayContent: ({ date }) => (
              <div className="relative flex flex-col items-center">
                <span>{date.getDate()}</span>
                {getDayContent(date)}
              </div>
            ),
          }}
          data-testid="calendar-widget"
        />

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Status Legend</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs">Tentative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs">Planning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-xs">Completed</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
