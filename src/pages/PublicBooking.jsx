import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import {
    Building2, Calendar as CalendarIcon, ArrowLeft, ArrowRight,
    Phone, Mail, Loader2, ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ServiceCard from '@/components/booking/ServiceCard';
import TimeSlotGrid from '@/components/booking/TimeSlotGrid';
import OTPVerification from '@/components/booking/OTPVerification';
import BookingConfirmation from '@/components/booking/BookingConfirmation';
import { useLanguage } from '@/components/LanguageContext';

const STEPS = {
    SERVICE: 'service',
    DATETIME: 'datetime',
    PHONE: 'phone',
    OTP: 'otp',
    CONFIRMATION: 'confirmation'
};

export default function PublicBooking() {
    const { slug: slugParam } = useParams();
    const [searchParams] = useSearchParams();
    const slug = slugParam || searchParams.get('slug');
    const serviceIdFromQuery = searchParams.get('service');
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const [step, setStep] = useState(STEPS.SERVICE);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch institution
    const { data: institutions, isLoading: institutionsLoading } = useQuery({
        queryKey: ['institution', slug],
        queryFn: () => api.entities.Institution.filter({ slug, is_active: true }),
        enabled: !!slug
    });
    const institution = institutions?.[0];

    // Fetch services
    const { data: services = [] } = useQuery({
        queryKey: ['services', institution?.id],
        queryFn: () => api.entities.Service.filter({ institution_id: institution.id, is_active: true }),
        enabled: !!institution?.id
    });

    // Fetch time slots
    const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
        queryKey: ['timeSlots', institution?.id, format(selectedDate, 'yyyy-MM-dd')],
        queryFn: () => api.entities.TimeSlot.filter({
            institution_id: institution.id,
            date: format(selectedDate, 'yyyy-MM-dd')
        }),
        enabled: !!institution?.id && step === STEPS.DATETIME
    });

    // Create appointment mutation
    const createAppointment = useMutation({
        mutationFn: async (data) => {
            const result = await api.entities.Appointment.create(data);
            return result;
        },
        onSuccess: (data) => {
            setAppointment(data);
            setStep(STEPS.OTP);
        }
    });

    // Verify OTP mutation
    const verifyOTP = useMutation({
        mutationFn: async (code) => {
            // Simulate OTP verification - in production, this would verify against actual OTP
            await new Promise(resolve => setTimeout(resolve, 1000));
            const updated = await api.entities.Appointment.update(appointment.id, {
                otp_verified: true,
                status: 'confirmed'
            });
            return updated;
        },
        onSuccess: (data) => {
            setAppointment(data);
            setStep(STEPS.CONFIRMATION);
        }
    });

    const handleServiceSelect = (service) => {
        setSelectedService(service);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handlePhoneSubmit = async () => {
        if (!phone || phone.length < 8) return;
        setLoading(true);

        // Generate ticket number
        const prefix = selectedService.prefix || 'A';
        const randomNum = Math.floor(Math.random() * 99) + 1;
        const ticketNumber = `${prefix}${randomNum}`;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const appointmentData = {
            institution_id: institution.id,
            service_id: selectedService.id,
            time_slot_id: selectedSlot?.id,
            ticket_number: ticketNumber,
            customer_phone: phone,
            appointment_date: format(selectedDate, 'yyyy-MM-dd'),
            appointment_time: selectedSlot.start_time,
            status: 'pending',
            otp_code: otp,
            otp_verified: false,
            customer_email: email || undefined
        };

        createAppointment.mutate(appointmentData);
        setLoading(false);
    };

    const handleOTPVerify = (code) => {
        verifyOTP.mutate(code);
    };

    const handleResendOTP = () => {
        // Simulate resending OTP
        console.log('Resending OTP...');
    };

    // Preselect service when coming from institution page
    useEffect(() => {
        if (!serviceIdFromQuery || !services.length) return;
        const match = services.find((s) => s.id === serviceIdFromQuery);
        if (match) setSelectedService(match);
    }, [serviceIdFromQuery, services]);

    useEffect(() => {
        if (serviceIdFromQuery && selectedService && step === STEPS.SERVICE) {
            setStep(STEPS.DATETIME);
        }
    }, [serviceIdFromQuery, selectedService, step]);

    if (!slug) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">Invalid booking link</p>
                    <Link to={createPageUrl('Institutions')}>
                        <Button className="mt-4">{t('backToHome')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (institutionsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <p className="text-gray-700 font-semibold">Institution not found</p>
                    <Link to={createPageUrl('Institutions')}>
                        <Button>{t('backToHome')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        {step !== STEPS.CONFIRMATION && (
                            <Link to={step === STEPS.SERVICE ? createPageUrl('Institutions') : '#'}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        if (step !== STEPS.SERVICE) {
                                            e.preventDefault();
                                            if (step === STEPS.DATETIME) setStep(STEPS.SERVICE);
                                            else if (step === STEPS.PHONE) setStep(STEPS.DATETIME);
                                        }
                                    }}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                        )}
                        <div className="flex items-center gap-3 flex-1">
                            {institution.logo_url ? (
                                <img
                                    src={institution.logo_url}
                                    alt={institution.name}
                                    className="w-10 h-10 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="font-semibold text-gray-900">{institution.name}</h1>
                                <p className="text-sm text-gray-500 capitalize">{institution.type}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            {step !== STEPS.CONFIRMATION && (
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-2xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-2">
                            {[STEPS.SERVICE, STEPS.DATETIME, STEPS.PHONE, STEPS.OTP].map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={cn(
                                        "h-1.5 flex-1 rounded-full transition-colors",
                                        Object.values(STEPS).indexOf(step) >= i
                                            ? "bg-[#1e3a5f]"
                                            : "bg-gray-200"
                                    )} />
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Step 1: Service Selection */}
                {step === STEPS.SERVICE && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('selectService')}</h2>
                            <p className="text-gray-500">{t('chooseService')}</p>
                        </div>

                        <div className="space-y-3">
                            {services.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    selected={selectedService?.id === service.id}
                                    onClick={() => handleServiceSelect(service)}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={() => setStep(STEPS.DATETIME)}
                            disabled={!selectedService}
                            className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                        >
                            {t('continue')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Step 2: Date & Time Selection */}
                {step === STEPS.DATETIME && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('selectDateTime')}</h2>
                            <p className="text-gray-500">{t('pickSlot')}</p>
                        </div>

                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                                    className="mx-auto"
                                />
                            </CardContent>
                        </Card>

                        <div>
                            <h3 className="font-medium text-gray-900 mb-4">
                                {format(selectedDate, 'EEEE, MMMM d')}
                            </h3>
                            <TimeSlotGrid
                                slots={timeSlots}
                                selectedSlot={selectedSlot}
                                onSelect={handleSlotSelect}
                                loading={slotsLoading}
                            />
                        </div>

                        <Button
                            onClick={() => setStep(STEPS.PHONE)}
                            disabled={!selectedSlot}
                            className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                        >
                            {t('continue')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                )}

                {/* Step 3: Phone Number */}
                {step === STEPS.PHONE && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('yourPhone')}</h2>
                            <p className="text-gray-500">{t('phoneSend')}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="tel"
                                    placeholder="+257 XX XXX XXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-12 h-14 text-lg"
                                />
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="Email address (optional, for reminders)"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12 h-14 text-lg"
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-100 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('service')}</span>
                                    <span className="font-medium text-gray-900">{selectedService?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('date')}</span>
                                    <span className="font-medium text-gray-900">
                                        {format(selectedDate, 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('time')}</span>
                                    <span className="font-medium text-gray-900">{selectedSlot?.start_time}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePhoneSubmit}
                            disabled={!phone || phone.length < 8 || loading || createAppointment.isPending}
                            className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                        >
                            {loading || createAppointment.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {t('sendOtp')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Step 4: OTP Verification */}
                {step === STEPS.OTP && (
                    <OTPVerification
                        phone={phone}
                        onVerify={handleOTPVerify}
                        onResend={handleResendOTP}
                        onBack={() => setStep(STEPS.PHONE)}
                        loading={verifyOTP.isPending}
                    />
                )}

                {/* Step 5: Confirmation */}
                {step === STEPS.CONFIRMATION && appointment && (
                    <BookingConfirmation
                        appointment={appointment}
                        service={selectedService}
                        institution={institution}
                    />
                )}
            </div>
        </div>
    );
}

