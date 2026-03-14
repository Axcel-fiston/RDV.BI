import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format } from 'date-fns';
import { 
  Users, Play, SkipForward, CheckCircle, Monitor,
  Clock, Phone, ArrowRight, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function QueueManagementContent({ institution }) {
  const queryClient = useQueryClient();
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [callingCounter, setCallingCounter] = useState(null);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: appointments = [], error: appointmentsError } = useQuery({
    queryKey: ['queueAppointments', institution?.id, today],
    queryFn: () => api.entities.Appointment.filter({ 
      institution_id: institution?.id,
      appointment_date: today
    }),
    enabled: !!institution?.id,
    refetchInterval: 5000
  });

  const { data: counters = [], error: countersError } = useQuery({
    queryKey: ['counters', institution?.id],
    queryFn: () => api.entities.Counter.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const { data: services = [], error: servicesError } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const updateAppointment = useMutation({
    mutationFn: ({ id, data }) => api.entities.Appointment.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['queueAppointments'])
  });

  const updateCounter = useMutation({
    mutationFn: ({ id, data }) => api.entities.Counter.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['counters'])
  });

  const waitingQueue = appointments
    .filter(a => a.status === 'waiting' || a.status === 'confirmed')
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const inProgress = appointments.filter(a => a.status === 'in_progress');
  const completed = appointments.filter(a => a.status === 'completed');

  const getServiceName = (serviceId) => {
    return services.find(s => s.id === serviceId)?.name || 'Unknown';
  };

  const handleCallNext = async (counter) => {
    const nextTicket = waitingQueue[0];
    if (!nextTicket) {
      toast.error('No ticket in queue');
      return;
    }

    setCallingCounter(counter.id);

    try {
      await updateAppointment.mutateAsync({
        id: nextTicket.id,
        data: {
          status: 'in_progress',
          counter_number: counter.number,
          called_time: new Date().toISOString()
        }
      });
      await updateCounter.mutateAsync({
        id: counter.id,
        data: {
          status: 'busy',
          current_ticket: nextTicket.ticket_number
        }
      });
      toast.success(`Calling ${nextTicket.ticket_number}`);
      queryClient.invalidateQueries(['queueAppointments', institution?.id, today]);
      queryClient.invalidateQueries(['counters', institution?.id]);
    } catch (error) {
      toast.error(error?.message || 'Failed to call next ticket');
    } finally {
      setCallingCounter(null);
    }
  };

  const handleSkipTicket = (apt) => {
    updateAppointment.mutate({
      id: apt.id,
      data: { status: 'no_show' }
    });
  };

  const handleCompleteTicket = (apt, counter) => {
    updateAppointment.mutate({
      id: apt.id,
      data: {
        status: 'completed',
        completed_time: new Date().toISOString()
      }
    });

    updateCounter.mutate({
      id: counter.id,
      data: {
        status: 'available',
        current_ticket: null
      }
    });
  };

  if (appointmentsError || countersError || servicesError) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700">
        Unable to load queue data. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <p className="text-gray-500 mt-1">Manage the waiting queue and call customers</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">Waiting</p>
                <p className="text-2xl font-bold text-purple-900">{waitingQueue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-900">{inProgress.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{completed.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Counters */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Service Counters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {counters.map((counter) => {
              const currentApt = inProgress.find(a => a.counter_number === counter.number);
              
              return (
                <div 
                  key={counter.id}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all",
                    counter.status === 'busy' 
                      ? "border-orange-200 bg-orange-50" 
                      : "border-gray-100 bg-white hover:border-[#1e3a5f]/30"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                        counter.status === 'busy' 
                          ? "bg-orange-200 text-orange-800"
                          : "bg-[#1e3a5f] text-white"
                      )}>
                        {counter.number}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Counter {counter.number}</p>
                        <p className="text-sm text-gray-500">{counter.staff_name || 'Unassigned'}</p>
                      </div>
                    </div>
                    <Badge className={
                      counter.status === 'available' ? 'bg-green-100 text-green-800' :
                      counter.status === 'busy' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {counter.status}
                    </Badge>
                  </div>

                  {currentApt ? (
                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#1e3a5f]">
                            {currentApt.ticket_number}
                          </p>
                          <p className="text-sm text-gray-500">{getServiceName(currentApt.service_id)}</p>
                        </div>
                        <Button
                          onClick={() => handleCompleteTicket(currentApt, counter)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updateAppointment.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleCallNext(counter)}
                      disabled={waitingQueue.length === 0 || updateAppointment.isPending || callingCounter === counter.id}
                      className="w-full bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                    >
                      {callingCounter === counter.id || updateAppointment.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {callingCounter === counter.id ? 'Calling...' : 'Call Next'}
                    </Button>
                  )}
                </div>
              );
            })}

            {counters.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No counters configured. Add counters in Settings.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Waiting Queue */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Waiting Queue ({waitingQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {waitingQueue.map((apt, index) => (
                <div 
                  key={apt.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all",
                    index === 0 
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5" 
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold",
                        index === 0 
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {apt.ticket_number}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getServiceName(apt.service_id)}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {apt.appointment_time}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSkipTicket(apt)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {waitingQueue.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No customers waiting</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QueueManagement() {
  return (
    <AdminLayout>
      <QueueManagementContent />
    </AdminLayout>
  );
}

