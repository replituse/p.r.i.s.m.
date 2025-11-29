import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Copy, Calendar, List, ChevronLeft, ChevronRight } from "lucide-react";
import type { BookingWithRelations } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface BookingGridProps {
  bookings: BookingWithRelations[];
  allBookings?: BookingWithRelations[];
  isLoading: boolean;
  selectedDate: Date;
  onAddBooking: () => void;
  onEditBooking: (booking: BookingWithRelations) => void;
  onDeleteBooking: (booking: BookingWithRelations) => void;
  onRepeatBooking: (booking: BookingWithRelations) => void;
  onHardDeleteBooking?: (booking: BookingWithRelations) => void;
}

export function BookingGrid({
  bookings,
  allBookings = [],
  isLoading,
  selectedDate,
  onAddBooking,
  onEditBooking,
  onDeleteBooking,
  onRepeatBooking,
  onHardDeleteBooking,
}: BookingGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hideCancelled, setHideCancelled] = useState(false);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Cancelled":
        return "bg-red-500 text-white hover:bg-red-600";
      case "Planning":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "Tentative":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "Confirmed":
        return "bg-green-500 text-white hover:bg-green-600";
      case "Completed":
        return "bg-gray-500 text-white hover:bg-gray-600";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Tentative: "outline",
    Confirmed: "default",
    Planning: "secondary",
    Completed: "secondary",
    Cancelled: "destructive",
  };

  const filteredBookings = bookings.filter((booking) => {
    if (hideCancelled && (booking.isCancelled || booking.status === "Cancelled")) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        booking.customer?.name?.toLowerCase().includes(searchLower) ||
        booking.project?.name?.toLowerCase().includes(searchLower) ||
        booking.room?.name?.toLowerCase().includes(searchLower) ||
        booking.editor?.name?.toLowerCase().includes(searchLower) ||
        booking.contactPerson?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const calculateTotalTime = (fromTime: string | null, toTime: string | null, breakMinutes: number = 0) => {
    if (!fromTime || !toTime) return "-";
    
    const [fromHours, fromMins] = fromTime.split(":").map(Number);
    const [toHours, toMins] = toTime.split(":").map(Number);
    
    let totalMinutes = (toHours * 60 + toMins) - (fromHours * 60 + fromMins) - breakMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const paginatedAllBookings = allBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(allBookings.length / itemsPerPage);

  return (
    <>
    <Card className="h-full flex flex-col" data-testid="booking-grid">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Bookings for {format(selectedDate, "MMMM d, yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowAllRecords(true)} 
              data-testid="button-view-all"
            >
              <List className="w-4 h-4 mr-2" />
              View All Records
            </Button>
            <Button onClick={onAddBooking} data-testid="button-add-booking">
              <Plus className="w-4 h-4 mr-2" />
              Add Booking
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-bookings"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="hideCancelled"
              checked={hideCancelled}
              onCheckedChange={(checked) => setHideCancelled(checked === true)}
              data-testid="checkbox-hide-cancelled"
            />
            <label htmlFor="hideCancelled" className="text-sm text-muted-foreground cursor-pointer">
              Hide Cancelled Bookings
            </label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No bookings found</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery
                ? "Try adjusting your search query"
                : "There are no bookings for this date"}
            </p>
            <Button onClick={onAddBooking} variant="outline" data-testid="button-add-first-booking">
              <Plus className="w-4 h-4 mr-2" />
              Create First Booking
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[100px]">Room</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead className="text-center">From</TableHead>
                  <TableHead className="text-center">To</TableHead>
                  <TableHead className="text-center">Break</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow 
                    key={booking.id}
                    className={booking.isCancelled ? "opacity-50" : ""}
                    data-testid={`booking-row-${booking.id}`}
                  >
                    <TableCell className="font-medium">
                      {booking.room?.shortName || booking.room?.name || "-"}
                    </TableCell>
                    <TableCell>{booking.customer?.name || "-"}</TableCell>
                    <TableCell>{booking.project?.name || "-"}</TableCell>
                    <TableCell>{booking.contactPerson || "-"}</TableCell>
                    <TableCell>{booking.editor?.name || "-"}</TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {formatTime(booking.bookingFromTime)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {formatTime(booking.bookingToTime)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {booking.breakMinutes ? `${booking.breakMinutes}m` : "-"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {calculateTotalTime(booking.bookingFromTime, booking.bookingToTime, booking.breakMinutes || 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusStyle(booking.status || "Tentative")}>
                        {booking.status || "Tentative"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" data-testid={`button-actions-${booking.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditBooking(booking)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRepeatBooking(booking)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Repeat Booking
                          </DropdownMenuItem>
                          {booking.status === "Cancelled" || booking.isCancelled ? (
                            onHardDeleteBooking && (
                              <DropdownMenuItem
                                onClick={() => onHardDeleteBooking(booking)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Permanently
                              </DropdownMenuItem>
                            )
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onDeleteBooking(booking)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>

    {/* View All Records Dialog */}
    <Dialog open={showAllRecords} onOpenChange={setShowAllRecords}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            All Booking Records
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Editor</TableHead>
                  <TableHead className="text-center">Time</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAllBookings.map((booking) => {
                  const bookingDate = typeof booking.date === 'string' 
                    ? parseISO(booking.date) 
                    : new Date(booking.date);
                  return (
                    <TableRow key={booking.id} data-testid={`all-booking-row-${booking.id}`}>
                      <TableCell>{format(bookingDate, "MMM d, yyyy")}</TableCell>
                      <TableCell className="font-medium">
                        {booking.room?.shortName || booking.room?.name || "-"}
                      </TableCell>
                      <TableCell>{booking.customer?.name || "-"}</TableCell>
                      <TableCell>{booking.project?.name || "-"}</TableCell>
                      <TableCell>{booking.editor?.name || "-"}</TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {formatTime(booking.bookingFromTime)} - {formatTime(booking.bookingToTime)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={getStatusStyle(booking.status || "Tentative")}>
                          {booking.status || "Tentative"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({allBookings.length} total records)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
