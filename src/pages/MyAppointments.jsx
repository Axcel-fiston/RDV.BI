import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Phone, ArrowLeft, Loader2, Building2, Clock, XCircle, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import OTPVerification from '@/components/booking/OTPVerification';
import { isPast, parseISO } from 'date-fns';

const STEPS = { PHONE: 'phone', OTP: 'otp', HISTORY: 'history' };

const C = {
    red: '#b91c1c', green: '#15803d', gold: '#d4af6a',
    text: '#1a0a0a', textMuted: '#6b2a2a',
    bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
    cardBg: 'rgba(255,255,255,0.75)', cardBorder: 'rgba(255,255,255,0.9)',
};

const statusConfig = {
    pending: { bg: 'rgba(251,191,36,0.1)', color: '#92400e', border: 'rgba(251,191,36,0.3)', icon: Clock },
    confirmed: { bg: 'rgba(21,128,61,0.08)', color: '#15803d', border: 'rgba(21,128,61,0.22)', icon: CheckCircle2 },
    waiting: { bg: 'rgba(185,28,28,0.07)', color: '#b91c1c', border: 'rgba(185,28,28,0.2)', icon: Clock },
    in_progress: { bg: 'rgba(212,175,106,0.1)', color: '#92601a', border: 'rgba(212,175,106,0.3)', icon: ChevronRight },
    completed: { bg: 'rgba(21,128,61,0.1)', color: '#15803d', border: 'rgba(21,128,61,0.25)', icon: CheckCircle2 },
    cancelled: { bg: 'rgba(239,68,68,0.07)', color: '#dc2626', border: 'rgba(239,68,68,0.18)', icon: XCircle },
    no_show: { bg: 'rgba(0,0,0,0.03)', color: '#6b2a2a', border: 'rgba(0,0,0,0.08)', icon: AlertCircle },
};

export default function MyAppointments() {
    const { t } = useLanguage();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(STEPS.PHONE);
    const [phone, setPhone] = useState('');
    const [verifiedPhone, setVerifiedPhone] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [cancelId, setCancelId] = useState(null);

    const { data: appointments = [], isLoading: apptLoading } = useQuery({
        queryKey: ['myAppointments', verifiedPhone],
        queryFn: () => api.entities.Appointment.filter({ customer_phone: verifiedPhone }),
        enabled: !!verifiedPhone,
    });

    const { data: institutions = [] } = useQuery({
        queryKey: ['institutions'],
        queryFn: () => api.entities.Institution.list(),
        enabled: !!verifiedPhone,
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => api.entities.Service.list(),
        enabled: !!verifiedPhone,
    });

    const cancelMutation = useMutation({
        mutationFn: (id) => api.entities.Appointment.update(id, { status: 'cancelled' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myAppointments', verifiedPhone] });
            setCancelId(null);
        },
    });

    const handleSendOTP = () => {
        if (!phone || phone.length < 8) return;
        setOtpLoading(true);
        setTimeout(() => { setOtpLoading(false); setStep(STEPS.OTP); }, 1000);
    };

    const handleVerifyOTP = async () => {
        await new Promise(r => setTimeout(r, 1000));
        setVerifiedPhone(phone);
        setStep(STEPS.HISTORY);
    };

    const getInstitutionName = (id) => institutions.find(i => i.id === id)?.name || '—';
    const getServiceName = (id) => services.find(s => s.id === id)?.name || '—';

    const isUpcoming = (appt) => ['pending', 'confirmed', 'waiting'].includes(appt.status) && !isPast(parseISO(appt.appointment_date));
    const upcoming = appointments.filter(isUpcoming).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
    const past = appointments.filter(a => !isUpcoming(a)).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    const glassShadow = '0 4px 30px rgba(185,28,28,0.07), inset 0 1px 0 rgba(255,255,255,1)';

    return (
        <div className="min-h-screen" style={{ background: C.bg }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.07) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[400px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.07) 0%, transparent 70%)' }} />
                <div className="absolute top-0 left-0 w-full h-full opacity-25"
                    style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 sticky top-0 border-b backdrop-blur-2xl"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(185,28,28,0.1)', boxShadow: '0 1px 30px rgba(185,28,28,0.05)' }}>
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link to={createPageUrl('Home')}>
                        <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                            style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
                            <ArrowLeft className="w-4 h-4" style={{ color: C.red }} />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2 flex-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${C.red}, ${C.green})`, boxShadow: '0 4px 12px rgba(185,28,28,0.3)' }}>
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-wide"
                            style={{ background: `linear-gradient(90deg, ${C.red}, ${C.green})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            RDV.bi
                        </span>
                    </div>
                    <LanguageSwitcher variant="outline" />
                </div>
            </header>

            <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">

                {/* Step 1: Phone */}
                {step === STEPS.PHONE && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold mb-2" style={{ color: C.text }}>{t('myAppointments')}</h1>
                            <p className="text-sm" style={{ color: C.textMuted }}>{t('myAppointmentsDesc')}</p>
                        </div>
                        <div className="rounded-2xl p-6 space-y-4"
                            style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: 'blur(30px)', boxShadow: glassShadow }}>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textMuted }} />
                                <input
                                    type="tel"
                                    placeholder="+257 XX XXX XXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                                    className="w-full h-14 pl-12 pr-4 rounded-xl text-base outline-none transition-all"
                                    style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.14)', color: C.text }}
                                    onFocus={e => e.target.style.borderColor = `rgba(21,128,61,0.4)`}
                                    onBlur={e => e.target.style.borderColor = 'rgba(185,28,28,0.14)'}
                                />
                            </div>
                            <button
                                onClick={handleSendOTP}
                                disabled={!phone || phone.length < 8 || otpLoading}
                                className="w-full py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-40"
                                style={{ background: `linear-gradient(135deg, ${C.red}, #991b1b)`, boxShadow: '0 8px 25px rgba(185,28,28,0.35)' }}>
                                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('sendOtp')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: OTP */}
                {step === STEPS.OTP && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-center" style={{ color: C.text }}>{t('myAppointments')}</h1>
                        <div className="rounded-2xl p-6"
                            style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: 'blur(30px)', boxShadow: glassShadow }}>
                            <OTPVerification
                                phone={phone}
                                onVerify={handleVerifyOTP}
                                onResend={handleSendOTP}
                                onBack={() => setStep(STEPS.PHONE)}
                                loading={false}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: History */}
                {step === STEPS.HISTORY && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold" style={{ color: C.text }}>{t('myAppointments')}</h1>
                                <p className="text-sm mt-0.5" style={{ color: C.textMuted }}>{phone}</p>
                            </div>
                            <button
                                onClick={() => { setStep(STEPS.PHONE); setVerifiedPhone(''); setPhone(''); }}
                                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                                style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)', color: C.red }}>
                                {t('changePhone')}
                            </button>
                        </div>

                        {apptLoading && (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin" style={{ color: C.red }} />
                            </div>
                        )}

                        {!apptLoading && appointments.length === 0 && (
                            <div className="text-center py-16">
                                <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(185,28,28,0.2)' }} />
                                <p className="font-medium" style={{ color: C.text }}>{t('noAppointmentsFound')}</p>
                                <p className="text-sm mt-1" style={{ color: C.textMuted }}>{t('noAppointmentsFoundDesc')}</p>
                                <Link to={createPageUrl('Institutions')}>
                                    <button className="mt-6 px-6 py-3 rounded-xl font-semibold text-white text-sm"
                                        style={{ background: `linear-gradient(135deg, ${C.red}, #991b1b)`, boxShadow: '0 8px 25px rgba(185,28,28,0.3)' }}>
                                        {t('bookNow')}
                                    </button>
                                </Link>
                            </div>
                        )}

                        {!apptLoading && upcoming.length > 0 && (
                            <section>
                                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.textMuted }}>{t('upcomingAppointments')}</h2>
                                <div className="space-y-3">
                                    {upcoming.map(appt => (
                                        <AppointmentCard key={appt.id} appt={appt}
                                            institutionName={getInstitutionName(appt.institution_id)}
                                            serviceName={getServiceName(appt.service_id)}
                                            canCancel onCancel={() => setCancelId(appt.id)}
                                            cancelling={cancelMutation.isPending && cancelId === appt.id} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {!apptLoading && past.length > 0 && (
                            <section>
                                <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: C.textMuted }}>{t('pastAppointments')}</h2>
                                <div className="space-y-3">
                                    {past.map(appt => (
                                        <AppointmentCard key={appt.id} appt={appt}
                                            institutionName={getInstitutionName(appt.institution_id)}
                                            serviceName={getServiceName(appt.service_id)}
                                            canCancel={false} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {cancelId && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                                style={{ background: 'rgba(26,10,10,0.35)', backdropFilter: 'blur(10px)' }}>
                                <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
                                    style={{ background: 'rgba(255,252,252,0.97)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 20px 80px rgba(185,28,28,0.15), inset 0 1px 0 rgba(255,255,255,1)' }}>
                                    <h3 className="text-lg font-semibold" style={{ color: C.text }}>{t('cancelAppointment')}</h3>
                                    <p className="text-sm" style={{ color: C.textMuted }}>{t('cancelConfirmDesc')}</p>
                                    <div className="flex gap-3 pt-2">
                                        <button className="flex-1 py-3 rounded-xl text-sm font-medium"
                                            style={{ background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)', color: C.textMuted }}
                                            onClick={() => setCancelId(null)}>
                                            {t('keepIt')}
                                        </button>
                                        <button
                                            disabled={cancelMutation.isPending}
                                            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.3)' }}
                                            onClick={() => cancelMutation.mutate(cancelId)}>
                                            {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : t('yesCancel')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function AppointmentCard({ appt, institutionName, serviceName, canCancel, onCancel, cancelling }) {
    const { t } = useLanguage();
    const cfg = statusConfig[appt.status] || statusConfig.pending;
    const StatusIcon = cfg.icon;

    return (
        <div className="rounded-2xl p-4 transition-all duration-200"
            style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`,
                backdropFilter: 'blur(30px)',
                boxShadow: '0 2px 20px rgba(185,28,28,0.05), inset 0 1px 0 rgba(255,255,255,1)'
            }}>
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.12)' }}>
                    <Building2 className="w-5 h-5" style={{ color: C.red }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: C.text }}>{institutionName}</p>
                    <p className="text-sm truncate" style={{ color: C.textMuted }}>{serviceName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: C.textMuted }}>
                            <Calendar className="w-3 h-3" />{appt.appointment_date}
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: C.textMuted }}>
                            <Clock className="w-3 h-3" />{appt.appointment_time}
                        </span>
                        {appt.ticket_number && (
                            <span className="text-xs font-mono font-bold" style={{ color: C.green }}>#{appt.ticket_number}</span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        <StatusIcon className="w-3 h-3" />
                        {t(appt.status) || appt.status}
                    </span>
                    {canCancel && (
                        <button onClick={onCancel} disabled={cancelling}
                            className="text-xs px-2 py-1 rounded-lg transition-all"
                            style={{ color: '#dc2626', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            {cancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : t('cancel')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

