import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, Calendar, FileSpreadsheet, FileText, Filter, List, ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import type { BookingWithRelations, Room } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("daily");
  const [fromDate, setFromDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Cancelled":
        return "bg-red-500 text-white";
      case "Planning":
        return "bg-blue-500 text-white";
      case "Tentative":
        return "bg-yellow-500 text-white";
      case "Confirmed":
        return "bg-green-500 text-white";
      case "Completed":
        return "bg-gray-500 text-white";
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

  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const exportToPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 20px; }
          .header { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f4f4f4; font-weight: bold; }
          .summary { margin-bottom: 20px; display: flex; gap: 20px; }
          .summary-item { padding: 10px; background: #f9f9f9; border-radius: 4px; }
          .status-cancelled { color: #dc2626; }
          .status-planning { color: #2563eb; }
          .status-tentative { color: #ca8a04; }
          .status-confirmed { color: #16a34a; }
          .status-completed { color: #6b7280; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <h1>PRISM - Booking Report</h1>
        <div class="header">
          <p><strong>Report Period:</strong> ${fromDate} to ${toDate}</p>
          <p><strong>Room:</strong> ${roomFilter === "all" ? "All Rooms" : rooms.find(r => r.id.toString() === roomFilter)?.name || roomFilter}</p>
          <p><strong>Status:</strong> ${statusFilter === "all" ? "All Statuses" : statusFilter}</p>
        </div>
        <div class="summary">
          <div class="summary-item"><strong>Total Bookings:</strong> ${filteredBookings.length}</div>
          <div class="summary-item"><strong>Total Hours:</strong> ${calculateTotalHours()}</div>
          <div class="summary-item"><strong>Confirmed:</strong> ${statusCounts.Confirmed || 0}</div>
          <div class="summary-item"><strong>Cancelled:</strong> ${statusCounts.Cancelled || 0}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Room</th>
              <th>Customer</th>
              <th>Project</th>
              <th>Editor</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBookings.map(booking => {
              const bookingDate = typeof booking.date === "string" 
                ? parseISO(booking.date) 
                : new Date(booking.date);
              const statusClass = `status-${(booking.status || "Tentative").toLowerCase()}`;
              return `
                <tr>
                  <td>${format(bookingDate, "MMM d, yyyy")}</td>
                  <td>${booking.room?.name || "-"}</td>
                  <td>${booking.customer?.name || "-"}</td>
                  <td>${booking.project?.name || "-"}</td>
                  <td>${booking.editor?.name || "-"}</td>
                  <td>${formatTime(booking.bookingFromTime)} - ${formatTime(booking.bookingToTime)}</td>
                  <td class="${statusClass}">${booking.status || "Tentative"}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
        <p style="margin-top: 20px; text-align: center; color: #888; font-size: 11px;">
          Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </body>
      </html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast({
      title: "Export Started",
      description: "PDF export dialog opened",
    });
  };

  const exportToExcel = () => {
    const headers = ["Date", "Room", "Customer", "Project", "Editor", "From", "To", "Break (min)", "Status"];
    const rows = filteredBookings.map(booking => {
      const bookingDate = typeof booking.date === "string" 
        ? parseISO(booking.date) 
        : new Date(booking.date);
      return [
        format(bookingDate, "yyyy-MM-dd"),
        booking.room?.name || "",
        booking.customer?.name || "",
        booking.project?.name || "",
        booking.editor?.name || "",
        formatTime(booking.bookingFromTime),
        formatTime(booking.bookingToTime),
        booking.breakMinutes?.toString() || "0",
        booking.status || "Tentative",
      ];
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `booking_report_${fromDate}_to_${toDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Excel file downloaded successfully",
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6" data-testid="reports-page">
        {/* Header with Title and View All Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">Booking Reports</h1>
              <p className="text-sm text-muted-foreground">
                Generate and view reports for bookings, rooms, and projects.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAllRecords(true)}
            data-testid="button-view-all-reports"
          >
            <List className="w-4 h-4 mr-2" />
            View All History
          </Button>
        </div>

        {/* Summary Cards - MOVED UP */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
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
              <div className="flex items-center justify-between gap-4">
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.Confirmed || 0}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.Cancelled || 0}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Filters - MOVED DOWN */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Filter Options</CardTitle>
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
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Booking Details</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportToPDF} data-testid="button-export-pdf">
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" size="sm" onClick={exportToExcel} data-testid="button-export-excel">
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
              <div className="space-y-4">
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
                      {paginatedBookings.map((booking) => {
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} records
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View All Records Dialog */}
        <Dialog open={showAllRecords} onOpenChange={setShowAllRecords}>
          <DialogContent className="max-w-6xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>All Booking History</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
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
                  {bookings.map((booking) => {
                    const bookingDate = typeof booking.date === "string" 
                      ? parseISO(booking.date) 
                      : new Date(booking.date);
                    return (
                      <TableRow key={booking.id} data-testid={`all-record-row-${booking.id}`}>
                        <TableCell>{format(bookingDate, "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{booking.room?.name || "-"}</TableCell>
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
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
