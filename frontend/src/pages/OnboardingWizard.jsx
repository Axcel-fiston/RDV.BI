import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, addDays, startOfWeek } from 'date-fns';
import {
  CheckCircle2, Layers, Clock, Monitor, Calendar, ArrowRight,
  ArrowLeft, Plus, Trash2, Loader2, Building2, Rocket, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/api/apiClient';

const STEPS = [
  { id: 'welcome',  title: 'Welcome',        icon: Sparkles,     desc: 'Get started with your institution setup' },
  { id: 'services', title: 'Services',       icon: Layers,       desc: 'Add the services customers can book' },
  { id: 'hours',    title: 'Working Hours',  icon: Clock,        desc: 'Set your opening times' },
  { id: 'counters', title: 'Staff & Counters', icon: Monitor,    desc: 'Add counters and assign staff' },
  { id: 'slots',    title: 'Time Slots',     icon: Calendar,     desc: 'Generate appointment slots' },
  { id: 'done',     title: 'All Set!',       icon: Rocket,       desc: 'Your booking page is live' },
];

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAY_LABELS = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };

// ─── Step: Welcome ───────────────────────────────────────────────────────────
function WelcomeStep({ institution, onNext }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: 'linear-gradient(135deg, #1e3a5f20, #1e3a5f30)', border: '2px solid #1e3a5f30' }}>
        {institution?.logo_url
          ? <img src={institution.logo_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
          : <Building2 className="w-10 h-10 text-[#1e3a5f]" />}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome, {institution?.name}!</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Your institution has been approved on RDV.bi. Let's set up your booking system in just a few steps.
        </p>
      </div>
      <div className="grid sm:grid-cols-4 gap-3 max-w-lg mx-auto text-left">
        {[
          { icon: Layers, label: 'Add Services' },
          { icon: Clock, label: 'Set Hours' },
          { icon: Monitor, label: 'Add Counters' },
          { icon: Calendar, label: 'Create Slots' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
            <Icon className="w-5 h-5 text-[#1e3a5f] mx-auto mb-1.5" />
            <p className="text-xs font-medium text-gray-600">{label}</p>
          </div>
        ))}
      </div>
      <Button onClick={onNext} size="lg" className="bg-[#1e3a5f] hover:bg-[#2d4a6f] px-10">
        Let's Get Started <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// ─── Step: Services ───────────────────────────────────────────────────────────
function ServicesStep({ institution, onNext, onBack }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: 30, prefix: 'A' });
  const [adding, setAdding] = useState(false);

  const { data: services = [] } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution.id }),
    enabled: !!institution?.id
  });

  const createService = useMutation({
    mutationFn: (data) => api.entities.Service.create({ ...data, institution_id: institution.id, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['services', institution.id]);
      setForm({ name: '', description: '', duration_minutes: 30, prefix: 'A' });
      setAdding(false);
      toast.success('Service added!');
    }
  });

  const deleteService = useMutation({
    mutationFn: (id) => api.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['services', institution.id])
  });

  const prefixes = ['A','B','C','D','E','F'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{services.length} service{services.length !== 1 ? 's' : ''} added</p>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Service
        </Button>
      </div>

      {adding && (
        <div className="border border-[#1e3a5f]/20 rounded-xl p-4 bg-blue-50/30 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Service Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                placeholder="e.g. Account Opening" className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Ticket Prefix</Label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {prefixes.map(p => (
                  <button key={p} onClick={() => setForm(prev => ({...prev, prefix: p}))}
                    className={cn("w-8 h-8 rounded-lg text-xs font-bold border transition-all",
                      form.prefix === p ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-200 text-gray-600")}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-xs">Description (optional)</Label>
            <Textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              placeholder="Brief description..." rows={2} className="mt-1 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Duration:</Label>
              <Input type="number" value={form.duration_minutes}
                onChange={e => setForm(p => ({...p, duration_minutes: parseInt(e.target.value)||30}))}
                className="w-20 h-8 text-sm" min={5} max={240} />
              <span className="text-xs text-gray-500">min</span>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={() => createService.mutate(form)}
                disabled={!form.name || createService.isPending}
                className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
                {createService.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {services.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center text-xs font-bold text-[#1e3a5f]">
              {s.prefix || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{s.name}</p>
              <p className="text-xs text-gray-400">{s.duration_minutes} min</p>
            </div>
            <button onClick={() => deleteService.mutate(s.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {services.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No services yet. Add at least one to continue.</p>
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={services.length === 0} nextLabel="Next: Working Hours" />
    </div>
  );
}

// ─── Step: Working Hours ──────────────────────────────────────────────────────
function WorkingHoursStep({ institution, onNext, onBack }) {
  const queryClient = useQueryClient();
  const defaultHours = DAYS.reduce((acc, d) => ({
    ...acc,
    [d]: { open: '08:00', close: '17:00', enabled: d !== 'saturday' && d !== 'sunday' }
  }), {});

  const [hours, setHours] = useState(() => ({
    ...defaultHours,
    ...(institution?.working_hours || {})
  }));

  const toggle = (day, field, val) => setHours(p => ({ ...p, [day]: { ...p[day], [field]: val } }));

  return (
    <div className="space-y-3">
      {DAYS.map(day => (
        <div key={day} className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-all",
          hours[day]?.enabled ? "bg-white border border-gray-200" : "bg-gray-50 opacity-60"
        )}>
          <Switch checked={!!hours[day]?.enabled} onCheckedChange={v => toggle(day, 'enabled', v)} />
          <span className="w-10 text-sm font-semibold text-gray-700 capitalize">{DAY_LABELS[day]}</span>
          {hours[day]?.enabled ? (
            <div className="flex items-center gap-2 flex-1">
              <Input type="time" value={hours[day]?.open || '08:00'}
                onChange={e => toggle(day, 'open', e.target.value)}
                className="h-8 w-28 text-sm" />
              <span className="text-gray-400 text-sm">–</span>
              <Input type="time" value={hours[day]?.close || '17:00'}
                onChange={e => toggle(day, 'close', e.target.value)}
                className="h-8 w-28 text-sm" />
            </div>
          ) : (
            <span className="text-xs text-gray-400 ml-2">Closed</span>
          )}
        </div>
      ))}
      <StepNav onBack={onBack} onNext={onNext}
        nextLabel="Save & Continue" />
    </div>
  );
}

// ─── Step: Counters ───────────────────────────────────────────────────────────
function CountersStep({ institution, onNext, onBack }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ number: '', staff_name: '' });
  const [adding, setAdding] = useState(false);

  const { data: counters = [] } = useQuery({
    queryKey: ['counters', institution?.id],
    queryFn: () => api.entities.Counter.filter({ institution_id: institution.id }),
    enabled: !!institution?.id
  });

  const createCounter = useMutation({
    mutationFn: (data) => api.entities.Counter.create({
      ...data, institution_id: institution.id, is_active: true, status: 'available'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counters', institution.id] });
      setForm({ number: '', staff_name: '' });
      setAdding(false);
      toast.success('Counter added!');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to add counter');
    }
  });

  const deleteCounter = useMutation({
    mutationFn: (id) => api.entities.Counter.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['counters', institution.id] }),
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete counter');
    }
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{counters.length} counter{counters.length !== 1 ? 's' : ''} configured</p>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Counter
        </Button>
      </div>

      {adding && (
        <div className="border border-[#1e3a5f]/20 rounded-xl p-4 bg-blue-50/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Counter Number / Name *</Label>
              <Input value={form.number} onChange={e => setForm(p => ({...p, number: e.target.value}))}
                placeholder="e.g. 1, A, A1" className="mt-1 h-9" />
            </div>
            <div>
              <Label className="text-xs">Staff Name (optional)</Label>
              <Input value={form.staff_name} onChange={e => setForm(p => ({...p, staff_name: e.target.value}))}
                placeholder="e.g. Jean Bosco" className="mt-1 h-9" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createCounter.mutate(form)}
              disabled={!form.number || createCounter.isPending}
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
              {createCounter.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {counters.map(c => (
          <div key={c.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f] flex items-center justify-center text-white font-bold text-sm">
              {c.number}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">Counter {c.number}</p>
              <p className="text-xs text-gray-400">{c.staff_name || 'No staff assigned'}</p>
            </div>
            <button onClick={() => deleteCounter.mutate(c.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {counters.length === 0 && (
          <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <Monitor className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Add at least one counter to continue.</p>
          </div>
        )}
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={counters.length === 0} nextLabel="Next: Time Slots" />
    </div>
  );
}

// ─── Step: Time Slots ─────────────────────────────────────────────────────────
function TimeSlotsStep({ institution, onNext, onBack }) {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState({ startTime: '08:00', endTime: '17:00', interval: 30, daysAhead: 7 });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateSlots = async () => {
    setGenerating(true);
    const slots = [];
    const today = new Date();
    for (let dayOffset = 0; dayOffset < config.daysAhead; dayOffset++) {
      const date = addDays(today, dayOffset);
      const [startH, startM] = config.startTime.split(':').map(Number);
      const [endH, endM] = config.endTime.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      for (let m = startMins; m < endMins; m += config.interval) {
        const sh = Math.floor(m / 60).toString().padStart(2, '0');
        const sm = (m % 60).toString().padStart(2, '0');
        const em2 = m + config.interval;
        const eh = Math.floor(em2 / 60).toString().padStart(2, '0');
        const emStr = (em2 % 60).toString().padStart(2, '0');
        slots.push({
          institution_id: institution.id,
          date: format(date, 'yyyy-MM-dd'),
          start_time: `${sh}:${sm}`,
          end_time: `${eh}:${emStr}`,
          capacity: 1,
          booked_count: 0,
          is_blocked: false
        });
      }
    }
    await api.entities.TimeSlot.bulkCreate(slots);
    setGenerating(false);
    setGenerated(true);
    toast.success(`Generated ${slots.length} time slots for ${config.daysAhead} days!`);
  };

  const totalSlots = Math.floor(
    (parseInt(config.endTime.split(':')[0]) * 60 + parseInt(config.endTime.split(':')[1]) -
     parseInt(config.startTime.split(':')[0]) * 60 - parseInt(config.startTime.split(':')[1])) / config.interval
  ) * config.daysAhead;

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Opening Time</Label>
            <Input type="time" value={config.startTime}
              onChange={e => setConfig(p => ({...p, startTime: e.target.value}))}
              className="mt-1 h-9" />
          </div>
          <div>
            <Label className="text-xs">Closing Time</Label>
            <Input type="time" value={config.endTime}
              onChange={e => setConfig(p => ({...p, endTime: e.target.value}))}
              className="mt-1 h-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Slot Duration (minutes)</Label>
            <div className="flex gap-2 mt-1">
              {[15, 30, 45, 60].map(v => (
                <button key={v} onClick={() => setConfig(p => ({...p, interval: v}))}
                  className={cn("flex-1 h-9 rounded-lg text-sm font-medium border transition-all",
                    config.interval === v ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white border-gray-200 text-gray-600")}>
                  {v}m
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs">Days to Generate</Label>
            <div className="flex gap-2 mt-1">
              {[7, 14, 30].map(v => (
                <button key={v} onClick={() => setConfig(p => ({...p, daysAhead: v}))}
                  className={cn("flex-1 h-9 rounded-lg text-sm font-medium border transition-all",
                    config.daysAhead === v ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "bg-white border-gray-200 text-gray-600")}>
                  {v}d
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 border border-dashed border-[#1e3a5f]/30 bg-blue-50/20 text-center">
        <p className="text-sm font-semibold text-[#1e3a5f]">~{totalSlots} slots will be created</p>
        <p className="text-xs text-gray-500 mt-0.5">From today over the next {config.daysAhead} days</p>
      </div>

      {generated && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Slots generated successfully!</p>
        </div>
      )}

      <Button onClick={generateSlots} disabled={generating || generated}
        className="w-full h-11 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white">
        {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : generated ? <><CheckCircle2 className="w-4 h-4 mr-2" />Slots Generated</> : <><Calendar className="w-4 h-4 mr-2" />Generate Slots</>}
      </Button>

      <StepNav onBack={onBack} onNext={onNext} nextDisabled={!generated} nextLabel="Finish Setup →" />
    </div>
  );
}

// ─── Step: Done ───────────────────────────────────────────────────────────────
function DoneStep({ institution }) {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: 'linear-gradient(135deg, #15803d20, #15803d40)', border: '2px solid #15803d40' }}>
        <Rocket className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          <strong>{institution?.name}</strong> is ready to receive bookings. Your public page is live and customers can now schedule appointments.
        </p>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl font-mono text-sm text-gray-700">
        🔗 rdv.bi/PublicBooking?slug=<strong>{institution?.slug}</strong>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left text-sm">
        {[
          { label: 'Manage appointments from the Dashboard', icon: '📅' },
          { label: 'Handle live queue in Queue Management', icon: '👥' },
          { label: 'View analytics and performance stats', icon: '📊' },
        ].map(({ label, icon }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3">
            <div className="text-xl mb-1.5">{icon}</div>
            <p className="text-gray-600 text-xs">{label}</p>
          </div>
        ))}
      </div>
      <Button onClick={() => navigate(createPageUrl('Dashboard'))} size="lg"
        className="bg-green-600 hover:bg-green-700 text-white px-10">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Go to Dashboard
      </Button>
    </div>
  );
}

// ─── Shared nav ───────────────────────────────────────────────────────────────
function StepNav({ onBack, onNext, nextDisabled, nextLabel = 'Continue', loading }) {
  return (
    <div className="flex gap-3 pt-2">
      <Button variant="outline" onClick={onBack} className="flex-shrink-0">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
      </Button>
      <Button onClick={onNext} disabled={nextDisabled || loading}
        className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f] text-white">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {nextLabel} <ArrowRight className="w-4 h-4 ml-1.5" />
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.me()
  });

  const { data: institution, isLoading } = useQuery({
    queryKey: ['myInstitution', user?.institutionId],
    queryFn: async () => {
      const matches = await api.entities.Institution.filter({ id: user.institutionId });
      return matches[0] || {
        id: user.institutionId,
        name: user.institutionName || 'Institution',
      };
    },
    enabled: !!user?.institutionId
  });

  useEffect(() => {
    if (!isLoading && !institution) {
      navigate(createPageUrl('Institutions'));
    }
  }, [institution, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No institution found</p>
          <p className="text-sm text-gray-400 mt-1">Your account is not linked to any institution yet.</p>
        </div>
      </div>
    );
  }

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#1e3a5f] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{institution.name}</p>
            <p className="text-xs text-gray-500">Institution Setup Wizard</p>
          </div>
          <Badge className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-0 text-xs">
            Step {step + 1} of {STEPS.length}
          </Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s, i) => {
            const SIcon = s.icon;
            return (
              <React.Fragment key={s.id}>
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all",
                  i < step ? "bg-green-100 text-green-700" :
                  i === step ? "bg-[#1e3a5f] text-white shadow-lg" :
                  "bg-gray-100 text-gray-400"
                )}>
                  {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <SIcon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{s.title}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 rounded transition-all", i < step ? "bg-green-300" : "bg-gray-200")} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Step header */}
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{currentStep.title}</h2>
              <p className="text-sm text-gray-400">{currentStep.desc}</p>
            </div>
          </div>

          {/* Step content */}
          {step === 0 && <WelcomeStep institution={institution} onNext={() => setStep(1)} />}
          {step === 1 && <ServicesStep institution={institution} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
          {step === 2 && <WorkingHoursStep institution={institution} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <CountersStep institution={institution} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <TimeSlotsStep institution={institution} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {step === 5 && <DoneStep institution={institution} />}
        </div>
      </div>
    </div>
  );
}
