import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval } from 'date-fns';
import { 
  BarChart3, TrendingUp, Users, Clock, Calendar,
  CheckCircle, XCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminLayout from '@/components/admin/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import StaffPerformance from '@/components/analytics/StaffPerformance';

const COLORS = ['#1e3a5f', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function AnalyticsContent({ institution }) {
  const [period, setPeriod] = useState('7');

  const { data: appointments = [] } = useQuery({
    queryKey: ['analyticsAppointments', institution?.id],
    queryFn: () => api.entities.Appointment.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  // Filter by period
  const startDate = subDays(new Date(), parseInt(period));
  const filteredAppointments = appointments.filter(apt => 
    new Date(apt.appointment_date) >= startDate
  );

  // Stats
  const totalAppointments = filteredAppointments.length;
  const completedAppointments = filteredAppointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = filteredAppointments.filter(a => a.status === 'cancelled').length;
  const noShowAppointments = filteredAppointments.filter(a => a.status === 'no_show').length;
  const completionRate = totalAppointments > 0 
    ? Math.round((completedAppointments / totalAppointments) * 100) 
    : 0;

  // Daily appointments chart
  const dailyData = eachDayOfInterval({
    start: startDate,
    end: new Date()
  }).map(day => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayAppointments = filteredAppointments.filter(a => a.appointment_date === dayStr);
    return {
      date: format(day, 'MMM d'),
      total: dayAppointments.length,
      completed: dayAppointments.filter(a => a.status === 'completed').length
    };
  });

  // Service distribution
  const serviceData = services.map(service => {
    const count = filteredAppointments.filter(a => a.service_id === service.id).length;
    return {
      name: service.name,
      value: count
    };
  }).filter(s => s.value > 0);

  // Status distribution
  const statusData = [
    { name: 'Completed', value: completedAppointments, color: '#10b981' },
    { name: 'Cancelled', value: cancelledAppointments, color: '#ef4444' },
    { name: 'No Show', value: noShowAppointments, color: '#6b7280' },
    { name: 'Other', value: totalAppointments - completedAppointments - cancelledAppointments - noShowAppointments, color: '#3b82f6' }
  ].filter(s => s.value > 0);

  // Peak hours
  const hourlyData = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 8;
    const timeStr = `${hour.toString().padStart(2, '0')}:`;
    const count = filteredAppointments.filter(a => a.appointment_time?.startsWith(timeStr)).length;
    return {
      hour: `${hour}:00`,
      count
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your appointment performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={totalAppointments}
          icon={Calendar}
        />
        <StatCard
          title="Completed"
          value={completedAppointments}
          icon={CheckCircle}
          trend={`${completionRate}% rate`}
          trendUp={completionRate >= 80}
        />
        <StatCard
          title="Cancelled"
          value={cancelledAppointments}
          icon={XCircle}
        />
        <StatCard
          title="No Shows"
          value={noShowAppointments}
          icon={Users}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Appointments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Daily Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Appointments by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {serviceData.map((service, index) => {
                const percentage = Math.round((service.value / totalAppointments) * 100) || 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{service.name}</span>
                      <span className="text-gray-500">{service.value} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {serviceData.length === 0 && (
                <p className="text-gray-500 text-center py-8">No service data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Peak Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1e3a5f" 
                    strokeWidth={2}
                    dot={{ fill: '#1e3a5f' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>
        <TabsContent value="staff">
          <StaffPerformance institution={institution} appointments={filteredAppointments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Analytics() {
  return (
    <AdminLayout>
      <AnalyticsContent />
    </AdminLayout>
  );
}

