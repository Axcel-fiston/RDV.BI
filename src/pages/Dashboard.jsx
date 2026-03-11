import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format } from 'date-fns';
import {
  Calendar, Users, Clock, Monitor, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import DashboardCharts from '@/components/admin/DashboardCharts';
import { useLanguage } from '@/components/LanguageContext';

function DashboardContent({ institution }) {
  const { t } = useLanguage();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayAppointments = [] } = useQuery({
    queryKey: ['todayAppointments', institution?.id, today],
    queryFn: () => api.entities.Appointment.filter({
      institution_id: institution?.id,
      appointment_date: today
    }),
    enabled: !!institution?.id
  });

  const { data: counters = [] } = useQuery({
    queryKey: ['counters', institution?.id],
    queryFn: () => api.entities.Counter.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const waiting = todayAppointments.filter(a => a.status === 'waiting').length;
  const completed = todayAppointments.filter(a => a.status === 'completed').length;
  const activeCounters = counters.filter(c => c.is_active && c.status !== 'closed').length;

  // Calculate average waiting time (mock for now)
  const avgWaitTime = waiting > 0 ? Math.round((waiting * 15) / activeCounters || 15) : 0;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
        <p className="text-gray-500 mt-1">{t('welcomeBack') || "Welcome back! Here's what's happening today."}</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t('todayAppointments') || "Today's Appointments"} value={todayAppointments.length} icon={Calendar} />
        <StatCard title={t('customersWaiting') || "Customers Waiting"} value={waiting} icon={Users} />
        <StatCard title={t('avgWaitTime') || "Avg. Wait Time"} value={`${avgWaitTime} min`} icon={Clock} />
        <StatCard title={t('activeCounters') || "Active Counters"} value={activeCounters} icon={Monitor} />
      </div>

      {/* Charts */}
      <DashboardCharts institution={institution} />

      {/* Recent Appointments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Appointments</CardTitle>
          <Link to={createPageUrl('Appointments')}>
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ticket</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Service</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Time</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1e3a5f]">{apt.ticket_number}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{getServiceName(apt.service_id)}</td>
                    <td className="py-3 px-4 text-gray-600">{apt.customer_phone}</td>
                    <td className="py-3 px-4 text-gray-600">{apt.appointment_time}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(apt.status)}>
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {todayAppointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No appointments today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Counter Status */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Counter Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {counters.map((counter) => (
              <div
                key={counter.id}
                className="p-4 rounded-xl border border-gray-100 bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">Counter {counter.number}</span>
                  <Badge className={
                    counter.status === 'available' ? 'bg-green-100 text-green-800' :
                      counter.status === 'busy' ? 'bg-orange-100 text-orange-800' :
                        counter.status === 'break' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                  }>
                    {counter.status}
                  </Badge>
                </div>
                {counter.staff_name && (
                  <p className="text-sm text-gray-500">{counter.staff_name}</p>
                )}
                {counter.current_ticket && (
                  <p className="text-sm text-[#1e3a5f] font-medium mt-1">
                    Serving: {counter.current_ticket}
                  </p>
                )}
              </div>
            ))}
            {counters.length === 0 && (
              <p className="text-gray-500 col-span-full text-center py-4">
                No counters configured
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  return (
    <AdminLayout>
      <DashboardContent />
    </AdminLayout>
  );
}

