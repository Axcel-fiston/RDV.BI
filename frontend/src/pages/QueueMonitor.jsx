import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format } from 'date-fns';
import { Users, Clock, Monitor, Search, RefreshCw, Activity, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function QueueMonitor() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  const [ticketSearch, setTicketSearch] = useState(urlParams.get('ticket') || '');
  const [submittedTicket, setSubmittedTicket] = useState(urlParams.get('ticket') || '');
  const [countdown, setCountdown] = useState(15);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const timer = setInterval(() => setCountdown(prev => prev <= 1 ? 15 : prev - 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: institutions = [] } = useQuery({
    queryKey: ['qm-institution', slug],
    queryFn: () => api.entities.Institution.filter({ slug }),
    enabled: !!slug
  });
  const institution = institutions[0];

  const { data: appointments = [], refetch } = useQuery({
    queryKey: ['qm-appointments', institution?.id, today],
    queryFn: () => api.entities.Appointment.filter({ institution_id: institution.id, appointment_date: today }),
    enabled: !!institution?.id,
    refetchInterval: 15000
  });

  const { data: counters = [] } = useQuery({
    queryKey: ['qm-counters', institution?.id],
    queryFn: () => api.entities.Counter.filter({ institution_id: institution.id }),
    enabled: !!institution?.id,
    refetchInterval: 15000
  });

  const { data: services = [] } = useQuery({
    queryKey: ['qm-services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution.id }),
    enabled: !!institution?.id
  });

  useEffect(() => {
    if (countdown === 15) refetch();
  }, [countdown]);

  const inProgress = appointments.filter(a => a.status === 'in_progress');
  const waiting = appointments
    .filter(a => a.status === 'waiting' || a.status === 'confirmed')
    .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));
  const activeCounters = counters.filter(c => c.is_active && c.status !== 'closed');
  const getServiceName = (sid) => services.find(s => s.id === sid)?.name || '';

  const myIdx = submittedTicket
    ? waiting.findIndex(a => a.ticket_number?.toLowerCase() === submittedTicket.toLowerCase())
    : -1;
  const myApt = myIdx >= 0 ? waiting[myIdx] : null;
  const isCompleted = submittedTicket
    ? appointments.some(a => a.ticket_number?.toLowerCase() === submittedTicket.toLowerCase() && a.status === 'completed')
    : false;

  const getWait = (pos) => {
    if (pos <= 0) return 0;
    const svc = myApt ? services.find(s => s.id === myApt.service_id) : null;
    return Math.ceil((pos * (svc?.duration_minutes || 15)) / Math.max(activeCounters.length, 1));
  };

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No institution specified.</p>
          <Link to={createPageUrl('Institutions')}><Button>Find Institutions</Button></Link>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)' }}>
        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a5f 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {institution.logo_url ? (
              <img src={institution.logo_url} alt={institution.name} className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div>
              <h1 className="font-bold leading-tight">{institution.name}</h1>
              <p className="text-white/50 text-xs">Live Queue Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>{countdown}s</span>
            <button onClick={() => { refetch(); setCountdown(15); }} className="ml-1 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Now Serving */}
        <div className="text-center py-10 rounded-2xl border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Now Serving</p>
          {inProgress.length > 0 ? (
            inProgress.map(apt => (
              <div key={apt.id}>
                <p className="text-7xl font-black tracking-tight">{apt.ticket_number}</p>
                <p className="text-white/60 text-sm mt-3">
                  Counter {apt.counter_number}
                  {getServiceName(apt.service_id) && ` · ${getServiceName(apt.service_id)}`}
                </p>
              </div>
            ))
          ) : (
            <p className="text-5xl font-bold text-white/20">—</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Waiting', value: waiting.length, color: 'text-amber-300' },
            { label: 'In Service', value: inProgress.length, color: 'text-green-300' },
            { label: 'Counters', value: activeCounters.length, color: 'text-blue-300' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 text-center border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <p className={cn("text-3xl font-bold", color)}>{value}</p>
              <p className="text-white/50 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Ticket Lookup */}
        <div className="rounded-2xl p-5 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-white/50" />
            Check Your Position
          </h2>
          <div className="flex gap-3">
            <Input
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value.toUpperCase())}
              placeholder="Enter your ticket (e.g. A21)"
              className="bg-white/20 border-white/30 text-white placeholder:text-white/40 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && setSubmittedTicket(ticketSearch)}
            />
            <Button
              onClick={() => setSubmittedTicket(ticketSearch)}
              className="bg-white text-[#1e3a5f] hover:bg-white/90 font-semibold"
            >
              Find
            </Button>
          </div>

          {submittedTicket && (
            <div className="mt-4">
              {isCompleted ? (
                <div className="rounded-xl p-4 text-center border border-green-400/30" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <p className="text-green-300 font-medium">✅ Your appointment is complete!</p>
                </div>
              ) : myIdx === -1 ? (
                <div className="rounded-xl p-4 text-center border border-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-white/50">Ticket <strong className="text-white">{submittedTicket}</strong> not found in today's queue.</p>
                </div>
              ) : (
                <div className="rounded-xl p-4 space-y-3 border border-amber-400/30" style={{ background: 'rgba(251,191,36,0.1)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Your ticket</span>
                    <span className="font-bold text-lg">{submittedTicket}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Queue position</span>
                    <span className="font-bold text-2xl text-amber-300">#{myIdx + 1}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">People ahead</span>
                    <span className="font-bold">{myIdx}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/20 pt-3">
                    <span className="text-white/60 text-sm flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Est. wait time
                    </span>
                    <span className="font-bold text-green-300 text-lg">~{getWait(myIdx)} min</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active Counters */}
        {activeCounters.length > 0 && (
          <div className="rounded-2xl p-5 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-white/50" />
              Service Counters
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {activeCounters.map(counter => {
                const serving = inProgress.find(a => a.counter_number === counter.number);
                return (
                  <div
                    key={counter.id}
                    className="rounded-xl p-3 border"
                    style={{
                      background: serving ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      borderColor: serving ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">#{counter.number}</span>
                      <div className={cn("w-2 h-2 rounded-full", serving ? "bg-green-400 animate-pulse" : "bg-white/20")} />
                    </div>
                    {counter.staff_name && <p className="text-xs text-white/40">{counter.staff_name}</p>}
                    {serving ? (
                      <p className="text-sm font-bold text-green-300 mt-1">{serving.ticket_number}</p>
                    ) : (
                      <p className="text-xs text-white/30 mt-1">Available</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Queue List */}
        {waiting.length > 0 && (
          <div className="rounded-2xl p-5 border border-white/20" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-white/50" />
              Queue ({waiting.length})
            </h2>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {waiting.slice(0, 12).map((apt, idx) => {
                const isMyTicket = apt.ticket_number?.toLowerCase() === submittedTicket.toLowerCase();
                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{
                      background: idx === 0 ? 'rgba(251,191,36,0.15)' : isMyTicket ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                      border: isMyTicket ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs w-5">#{idx + 1}</span>
                      <span className={cn("font-bold text-sm", idx === 0 && "text-amber-300", isMyTicket && "text-indigo-300")}>
                        {apt.ticket_number}
                      </span>
                      <span className="text-white/40 text-xs hidden sm:block">{getServiceName(apt.service_id)}</span>
                    </div>
                    <span className="text-white/30 text-xs">{apt.appointment_time}</span>
                  </div>
                );
              })}
              {waiting.length > 12 && (
                <p className="text-center text-white/30 text-xs py-1">+{waiting.length - 12} more</p>
              )}
            </div>
          </div>
        )}

        {waiting.length === 0 && inProgress.length === 0 && (
          <div className="text-center py-10 text-white/30">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No active queue right now</p>
          </div>
        )}

        <p className="text-center text-white/20 text-xs pb-6">
          <Link to={createPageUrl('Home')} className="hover:text-white/50 transition-colors">RDV.bi</Link>
          {' · '}Auto-refreshes every 15 seconds
        </p>
      </div>
    </div>
  );
}

