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
import { useAuth } from '@/lib/AuthContext';

function DashboardContent({ institution }) {
  const { t } = useLanguage();
  const { user } = useAuth();
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
    return `inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`;
  };

  const mobileAppointments = todayAppointments.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero stats */}
      <div className="rounded-[2rem] border border-white/60 bg-gradient-to-br from-white via-[#fff8f2] to-[#f5f0eb] p-6 shadow-[0_35px_100px_rgba(30,58,95,0.18)] backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-semibold text-[#1e3a5f]">
            {user?.role === 'STAFF' ? 'Staff Dashboard' : t('dashboard')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('welcomeBack') || "Welcome back! Here's what's happening today."}
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={t('todayAppointments') || "Today's Appointments"}
            value={todayAppointments.length}
            icon={Calendar}
          />
          <StatCard title={t('customersWaiting') || 'Customers Waiting'} value={waiting} icon={Users} />
          <StatCard title={t('avgWaitTime') || 'Avg. Wait Time'} value={`${avgWaitTime} min`} icon={Clock} />
          <StatCard title={t('activeCounters') || 'Active Counters'} value={activeCounters} icon={Monitor} />
        </div>
      </div>

      {/* Charts */}
      <div className="rounded-[2rem] border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(30,58,95,0.15)] p-5 backdrop-blur-xl">
        <DashboardCharts institution={institution} />
      </div>

      {/* Recent Appointments */}
      <Card className="border-0 shadow-[0_25px_60px_rgba(30,58,95,0.12)]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-[#1e3a5f]">Recent Appointments</CardTitle>
          <Link to={createPageUrl('Appointments')}>
            <Button variant="outline" size="sm">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase text-slate-400">Ticket</th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase text-slate-400">Service</th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase text-slate-400">Phone</th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase text-slate-400">Time</th>
                  <th className="text-left py-3 px-4 text-xs tracking-[0.2em] uppercase text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.slice(0, 5).map((apt) => (
                  <tr key={apt.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#1e3a5f]">{apt.ticket_number}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{getServiceName(apt.service_id)}</td>
                    <td className="py-3 px-4 text-gray-600">{apt.customer_phone}</td>
                    <td className="py-3 px-4 text-gray-600">{apt.appointment_time}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
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
          <div className="space-y-4 sm:hidden">
            {mobileAppointments.length > 0 ? (
              mobileAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-2xl border border-white/50 bg-white/70 shadow-[0_15px_35px_rgba(30,58,95,0.15)] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d]">Ticket</p>
                      <p className="text-lg font-semibold text-[#1e3a5f]">{apt.ticket_number}</p>
                    </div>
                    <Badge className={getStatusBadge(apt.status)}>{apt.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">{getServiceName(apt.service_id)}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{apt.customer_phone || '—'}</span>
                    <span>{apt.appointment_time || '—'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/60 bg-white/60 py-8 text-center text-sm text-slate-500">
                No appointments today
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Counter Status */}
      <Card className="border-0 shadow-[0_25px_60px_rgba(30,58,95,0.12)]">
        <CardHeader>
          <CardTitle className="text-lg text-[#1e3a5f]">Counter Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {counters.map((counter) => (
              <div
                key={counter.id}
                className="p-4 rounded-2xl border border-white/50 bg-gradient-to-br from-white to-[#f8f6f2] shadow-[0_20px_40px_rgba(30,58,95,0.12)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1e3a5f]">Counter {counter.number}</span>
                  <Badge
                    className={`text-[11px] px-3 py-1 font-semibold rounded-full capitalize ${
                      counter.status === 'available'
                        ? 'bg-emerald-100 text-emerald-700'
                        : counter.status === 'busy'
                          ? 'bg-orange-100 text-orange-700'
                          : counter.status === 'break'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {counter.status}
                  </Badge>
                </div>
                {counter.staff_name && <p className="text-sm text-slate-500">{counter.staff_name}</p>}
                {counter.current_ticket && (
                  <p className="text-sm text-[#1e3a5f] font-semibold mt-1">Serving: {counter.current_ticket}</p>
                )}
              </div>
            ))}
            {!counters.length && (
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

