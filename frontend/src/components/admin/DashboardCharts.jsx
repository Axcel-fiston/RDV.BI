import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

const STATUS_COLORS = [
  '#1e3a5f',
  '#2563eb',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

export default function DashboardCharts({ institution }) {
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['appointments', institution?.id],
    queryFn: () =>
      institution?.id
        ? api.entities.Appointment.filter({ institution_id: institution.id })
        : api.entities.Appointment.list(),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () =>
      institution?.id
        ? api.entities.Service.filter({ institution_id: institution.id })
        : api.entities.Service.list(),
  });

  const bookingsByDay = useMemo(() => {
    const counts = new Map();

    appointments.forEach((apt) => {
      if (!apt.appointment_date) return;
      const dateObj = parseISO(apt.appointment_date);
      const key = dateObj.getTime();
      const label = format(dateObj, 'MMM d');
      const existing = counts.get(key) ?? { date: label, count: 0 };
      counts.set(key, { date: label, count: existing.count + 1 });
    });

    const ordered = Array.from(counts.entries())
      .sort(([a], [b]) => a - b)
      .map(([, value]) => value);

    if (ordered.length === 0) {
      const today = new Date();
      return [{ date: format(today, 'MMM d'), count: 0 }];
    }

    return ordered;
  }, [appointments]);

  const statusData = useMemo(() => {
    const statuses = ['pending', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'];

    const values = statuses
      .map((status, idx) => ({
        name: status.replace('_', ' '),
        value: appointments.filter((a) => a.status === status).length,
        color: STATUS_COLORS[idx % STATUS_COLORS.length],
      }))
      .filter((item) => item.value > 0);

    return values.length ? values : [{ name: 'no data', value: 1, color: '#e2e8f0' }];
  }, [appointments]);

  const serviceData = useMemo(() => {
    const counts = new Map();

    appointments.forEach((apt) => {
      const serviceName = services.find((s) => s.id === apt.service_id)?.name || 'Unknown';
      counts.set(serviceName, (counts.get(serviceName) ?? 0) + 1);
    });

    const rows = Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    return rows.length ? rows : [{ name: 'No data yet', value: 0 }];
  }, [appointments, services]);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card className="border-0 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardTitle>Bookings trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {isLoadingAppointments && <p className="text-sm text-slate-500 mt-3">Loading chart data…</p>}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Status breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={4}>
                  {statusData.map((entry, idx) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="flex-1 capitalize">{item.name}</span>
                <span className="font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm lg:col-span-3">
        <CardHeader>
          <CardTitle>Top services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="value" fill="#1e3a5f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!appointments.length && (
            <p className="text-sm text-slate-500 mt-3">Charts will populate as soon as appointments are created.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
