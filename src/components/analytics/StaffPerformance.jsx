import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, TrendingUp, Award } from 'lucide-react';
import { differenceInMinutes, parseISO, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

export default function StaffPerformance({ institution, appointments = [] }) {
  const { data: counters = [] } = useQuery({
    queryKey: ['sp-counters', institution?.id],
    queryFn: () => api.entities.Counter.filter({ institution_id: institution.id }),
    enabled: !!institution?.id
  });

  const { data: ratings = [] } = useQuery({
    queryKey: ['sp-ratings', institution?.id],
    queryFn: () => api.entities.CustomerRating.filter({ institution_id: institution.id }),
    enabled: !!institution?.id
  });

  const last7 = subDays(new Date(), 7);

  const staffStats = counters.map(counter => {
    const completed = appointments.filter(a => a.counter_number === counter.number && a.status === 'completed');

    const durations = completed
      .filter(a => a.called_time && a.completed_time)
      .map(a => differenceInMinutes(parseISO(a.completed_time), parseISO(a.called_time)))
      .filter(d => d > 0 && d < 120);

    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : null;

    const recent = completed.filter(a => new Date(a.appointment_date) >= last7);
    const perDay = (recent.length / 7).toFixed(1);

    const counterRatings = ratings.filter(r => r.counter_number === counter.number);
    const avgRating = counterRatings.length > 0
      ? (counterRatings.reduce((s, r) => s + r.rating, 0) / counterRatings.length).toFixed(1)
      : null;

    return { counter, total: completed.length, avgDuration, perDay, avgRating, ratingCount: counterRatings.length };
  });

  const activeStaff = staffStats.filter(s => s.counter.is_active);

  if (activeStaff.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center text-gray-400">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No staff data yet. Complete appointments to see performance metrics.</p>
        </CardContent>
      </Card>
    );
  }

  const topPerformer = [...activeStaff].sort((a, b) => b.total - a.total)[0];

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">{activeStaff.reduce((s, x) => s + x.total, 0)}</p>
              <p className="text-xs text-blue-600">Total Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-900">
                {(() => {
                  const valid = activeStaff.filter(s => s.avgDuration);
                  return valid.length > 0
                    ? `${Math.round(valid.reduce((s, x) => s + x.avgDuration, 0) / valid.length)}m`
                    : '—';
                })()}
              </p>
              <p className="text-xs text-amber-600">Avg Service Time</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {(() => {
                  const valid = activeStaff.filter(s => s.avgRating);
                  return valid.length > 0
                    ? (valid.reduce((s, x) => s + parseFloat(x.avgRating), 0) / valid.length).toFixed(1)
                    : '—';
                })()}
              </p>
              <p className="text-xs text-green-600">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-staff cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeStaff.map(({ counter, total, avgDuration, perDay, avgRating, ratingCount }) => {
          const isTop = counter.id === topPerformer?.counter.id && total > 0;
          return (
            <Card key={counter.id} className={cn("border-0 shadow-sm", isTop && "ring-2 ring-amber-400 ring-offset-1")}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {counter.staff_name || `Counter ${counter.number}`}
                      {isTop && <Award className="w-4 h-4 text-amber-500" />}
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-0.5">Counter #{counter.number}</p>
                  </div>
                  <Badge className={
                    counter.status === 'available' ? 'bg-green-100 text-green-700' :
                    counter.status === 'busy' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }>{counter.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-blue-800">{total}</p>
                    <p className="text-xs text-blue-500">Completed</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-center">
                    <TrendingUp className="w-4 h-4 text-violet-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-violet-800">{perDay}</p>
                    <p className="text-xs text-violet-500">Per Day</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-amber-800">{avgDuration ? `${avgDuration}m` : '—'}</p>
                    <p className="text-xs text-amber-500">Avg Time</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <Star className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-800">{avgRating || '—'}</p>
                    <p className="text-xs text-green-500">{ratingCount > 0 ? `${ratingCount} reviews` : 'No reviews'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

