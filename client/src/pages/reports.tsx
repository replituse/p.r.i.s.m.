import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Calendar, Download, FileSpreadsheet, FileText, Filter } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import type { BookingWithRelations, Room } from "@shared/schema";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: bookings = [], isLoading } = useQuery<BookingWithRelations[]>({
    queryKey: ["/api/bookings"],
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = typeof booking.date === "string" ? booking.date : format(new Date(booking.date), "yyyy-MM-dd");
    
    if (bookingDate < fromDate || bookingDate > toDate) return false;
    if (roomFilter !== "all" && booking.roomId?.toString() !== roomFilter) return false;
    if (statusFilter !== "all" && booking.status !== statusFilter) return false;
    
    return true;
  });

  const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    Tentative: "outline",
    Confirmed: "default",
    Planning: "secondary",
    Completed: "secondary",
    Cancelled: "destructive",
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return time.substring(0, 5);
  };

  const calculateTotalHours = () => {
    let totalMinutes = 0;
    filteredBookings.forEach((booking) => {
      if (booking.bookingFromTime && booking.bookingToTime && !booking.isCancelled) {
        const [fromH, fromM] = booking.bookingFromTime.split(":").map(Number);
        const [toH, toM] = booking.bookingToTime.split(":").map(Number);
        let mins = (toH * 60 + toM) - (fromH * 60 + fromM) - (booking.breakMinutes || 0);
        if (mins < 0) mins += 24 * 60;
        totalMinutes += mins;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {};
    filteredBookings.forEach((booking) => {
      const status = booking.status || "Tentative";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getRoomStats = () => {
    const stats: Record<string, { count: number; hours: number }> = {};
    filteredBookings.forEach((booking) => {
      if (booking.isCancelled) return;
      const roomName = booking.room?.name || "Unknown";
      if (!stats[roomName]) {
        stats[roomName] = { count: 0, hours: 0 };
      }
      stats[roomName].count++;
      
      if (booking.bookingFromTime && booking.bookingToTime) {
        const [fromH, fromM] = booking.bookingFromTime.split(":").map(Number);
        const [toH, toM] = booking.bookingToTime.split(":").map(Number);
        let mins = (toH * 60 + toM) - (fromH * 60 + fromM) - (booking.breakMinutes || 0);
        if (mins < 0) mins += 24 * 60;
        stats[roomName].hours += mins / 60;
      }
    });
    return Object.entries(stats).sort((a, b) => b[1].count - a[1].count);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6" data-testid="reports-page">
        {/* Report Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Booking Reports
            </CardTitle>
            <CardDescription>
              Generate and view reports for bookings, rooms, and projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Report</SelectItem>
                    <SelectItem value="room">Room-wise Report</SelectItem>
                    <SelectItem value="summary">Summary Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  data-testid="input-from-date"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  data-testid="input-to-date"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Select value={roomFilter} onValueChange={setRoomFilter}>
                  <SelectTrigger data-testid="select-room-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id.toString()}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Tentative">Tentative</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-3xl font-bold">{filteredBookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-3xl font-bold">{calculateTotalHours()}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.Confirmed || 0}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.Cancelled || 0}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Room Statistics */}
        {reportType === "room" && (
          <Card>
            <CardHeader>
              <CardTitle>Room-wise Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getRoomStats().map(([roomName, stats]) => (
                  <Card key={roomName} className="bg-muted/30">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">{roomName}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Bookings:</span>{" "}
                          <span className="font-medium">{stats.count}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hours:</span>{" "}
                          <span className="font-medium">{stats.hours.toFixed(1)}h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Report Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking Details</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-export-pdf">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" data-testid="button-export-excel">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Filter className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No bookings found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your filters or date range
                </p>
              </div>
            ) : (
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
                    {filteredBookings.map((booking) => {
                      const bookingDate = typeof booking.date === "string" 
                        ? parseISO(booking.date) 
                        : new Date(booking.date);
                      return (
                        <TableRow key={booking.id} data-testid={`report-row-${booking.id}`}>
                          <TableCell>{format(bookingDate, "MMM d, yyyy")}</TableCell>
                          <TableCell className="font-medium">{booking.room?.name || "-"}</TableCell>
                          <TableCell>{booking.customer?.name || "-"}</TableCell>
                          <TableCell>{booking.project?.name || "-"}</TableCell>
                          <TableCell>{booking.editor?.name || "-"}</TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {formatTime(booking.bookingFromTime)} - {formatTime(booking.bookingToTime)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={statusVariants[booking.status || "Tentative"]}>
                              {booking.status || "Tentative"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
