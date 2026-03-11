import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format, parseISO } from 'date-fns';
import { 
  Search, Filter, Calendar, MoreVertical, Check, X, 
  Clock, RefreshCw, Eye, Phone, Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

function AppointmentsContent({ institution }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState('');

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', institution?.id, format(dateFilter, 'yyyy-MM-dd')],
    queryFn: () => api.entities.Appointment.filter({ 
      institution_id: institution?.id,
      appointment_date: format(dateFilter, 'yyyy-MM-dd')
    }),
    enabled: !!institution?.id
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const updateAppointment = useMutation({
    mutationFn: ({ id, data }) => api.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      setSelectedAppointment(null);
      setRescheduleOpen(false);
    }
  });

  const getServiceName = (serviceId) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      waiting: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !search || 
      apt.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      apt.customer_phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (apt) => {
    updateAppointment.mutate({ id: apt.id, data: { status: 'confirmed' } });
  };

  const handleCancel = (apt) => {
    updateAppointment.mutate({ id: apt.id, data: { status: 'cancelled' } });
  };

  const handleReschedule = () => {
    if (selectedAppointment && newDate && newTime) {
      updateAppointment.mutate({
        id: selectedAppointment.id,
        data: {
          appointment_date: format(newDate, 'yyyy-MM-dd'),
          appointment_time: newTime
        }
      });
    }
  };

  const handleSendReminder = async (apt) => {
    if (!apt.customer_email) {
      toast.error('No email address on record for this appointment.');
      return;
    }
    const serviceName = getServiceName(apt.service_id);
    const baseUrl = window.location.origin;
    const confirmLink = `${baseUrl}/AppointmentAction?id=${apt.id}&action=confirm`;
    const cancelLink = `${baseUrl}/AppointmentAction?id=${apt.id}&action=cancel`;
    await api.integrations.Core.SendEmail({
      to: apt.customer_email,
      subject: `Reminder: Your appointment at ${institution?.name || 'RDV.bi'}`,
      body: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1e3a5f;margin-bottom:8px">Appointment Reminder 🔔</h2>
        <p style="color:#555">You have an upcoming appointment scheduled.</p>
        <div style="background:#f0f5ff;padding:16px;border-radius:12px;margin:16px 0">
          <p style="margin:6px 0"><strong>Institution:</strong> ${institution?.name || ''}</p>
          <p style="margin:6px 0"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin:6px 0"><strong>Date:</strong> ${apt.appointment_date}</p>
          <p style="margin:6px 0"><strong>Time:</strong> ${apt.appointment_time}</p>
          <p style="margin:6px 0"><strong>Ticket:</strong> ${apt.ticket_number}</p>
        </div>
        <p style="color:#555">Please confirm or cancel your appointment:</p>
        <div style="margin:20px 0;display:flex;gap:12px">
          <a href="${confirmLink}" style="background:#1e3a5f;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">✅ Confirm</a>
          <a href="${cancelLink}" style="background:#ef4444;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">❌ Cancel</a>
        </div>
        <p style="color:#aaa;font-size:12px;margin-top:24px">RDV.bi – Smart Appointment Management</p>
      </div>`
    });
    toast.success('Reminder sent successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage all bookings</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by ticket or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(dateFilter, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter}
                  onSelect={(d) => d && setDateFilter(d)}
                />
              </PopoverContent>
            </Popover>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Ticket</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Service</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Time</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-semibold text-[#1e3a5f] text-lg">{apt.ticket_number}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{getServiceName(apt.service_id)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      {apt.customer_phone}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {apt.appointment_time}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={getStatusBadge(apt.status)}>
                      {apt.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {apt.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleApprove(apt)}>
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => {
                          setSelectedAppointment(apt);
                          setRescheduleOpen(true);
                        }}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendReminder(apt)}>
                          <Mail className="w-4 h-4 mr-2 text-blue-600" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleCancel(apt)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filteredAppointments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Select a new date and time for ticket {selectedAppointment?.ticket_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">New Date</label>
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                className="rounded-md border"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">New Time</label>
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!newDate || !newTime || updateAppointment.isPending}
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            >
              Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Appointments() {
  return (
    <AdminLayout>
      <AppointmentsContent />
    </AdminLayout>
  );
}

