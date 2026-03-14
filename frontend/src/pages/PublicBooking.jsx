import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { format, addDays } from 'date-fns';
import {
    Building2,
    MapPin,
    Phone,
    Loader2,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

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

const InstitutionHeader = ({ institution }) => (
    <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                {institution.logo_url ? (
                    <img
                        src={institution.logo_url}
                        alt={institution.name}
                        className="w-16 h-16 rounded-2xl object-cover border"
                    />
                ) : (
                    <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                    </div>
                )}
                <div>
                    <p className="text-sm font-semibold uppercase text-[#1e3a5f]/80 tracking-wide">
                        {institution.type || 'Institution'}
                    </p>
                    <h1 className="text-3xl font-bold text-gray-900">{institution.name}</h1>
                </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
                {institution.address && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#1e3a5f]" />
                        <span>{institution.address}</span>
                    </div>
                )}
                {institution.contact_phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#1e3a5f]" />
                        <span>{institution.contact_phone}</span>
                    </div>
                )}
            </div>
        </div>
    </section>
);

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
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const { data: institutions, isLoading: institutionsLoading } = useQuery({
        queryKey: ['institution', slug],
        queryFn: () => api.entities.Institution.filter({ slug, is_active: true }),
        enabled: !!slug
    });
    const institution = institutions?.[0];

    const { data: services = [] } = useQuery({
        queryKey: ['services', institution?.id],
        queryFn: () => api.entities.Service.filter({ institution_id: institution.id, is_active: true }),
        enabled: !!institution?.id
    });

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { data: timeSlots = [], isLoading: slotsLoading } = useQuery({
        queryKey: ['timeSlots', institution?.id, selectedService?.id, formattedDate],
        queryFn: () =>
            api.entities.TimeSlot.filter({
                institution_id: institution.id,
                date: formattedDate
            }),
        enabled: !!institution?.id && !!selectedService
    });

    const createAppointment = useMutation({
        mutationFn: async (data) => api.entities.Appointment.create(data),
        onSuccess: (data) => {
            setAppointment(data);
            setStep(STEPS.OTP);
        },
        onError: (err) => {
            setErrorMessage(err?.message || t('createAppointmentError'));
        }
    });

    const verifyOTP = useMutation({
        mutationFn: async (code) => {
            if (!appointment) throw new Error('Missing appointment');
            return api.entities.Appointment.verifyOtp({
                appointmentId: appointment.id,
                code,
                phone,
            });
        },
        onSuccess: (data) => {
            setAppointment(data);
            setStep(STEPS.CONFIRMATION);
        },
        onError: (err) => {
            setErrorMessage(err?.message || t('otpError'));
        }
    });

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setSelectedSlot(null);
        setStep(STEPS.DATETIME);
        if (institution) {
            queryClient.invalidateQueries({
                queryKey: ['timeSlots', institution.id, service.id, formattedDate]
            });
        }
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null);
    };

    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
    };

    const handleBookingSubmit = async () => {
        if (!selectedService || !selectedSlot || !fullName || !phone) {
            setErrorMessage('Select a slot and provide your name and phone number to continue.');
            return;
        }
        setErrorMessage('');
        setLoading(true);

        const prefix = selectedService.prefix || 'A';
        const randomNum = Math.floor(Math.random() * 99) + 1;
        const ticketNumber = `${prefix}${randomNum}`;

        const appointmentData = {
            institution_id: institution.id,
            service_id: selectedService.id,
            time_slot_id: selectedSlot.id,
            ticket_number: ticketNumber,
            customer_phone: phone,
            customer_email: email || undefined,
            appointment_date: formattedDate,
            appointment_time: selectedSlot.start_time,
            customer_name: fullName
        };

        try {
            await createAppointment.mutateAsync(appointmentData);
        } catch (err) {
            // error handled via onError
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!serviceIdFromQuery || !services.length) return;
        const match = services.find((s) => s.id === serviceIdFromQuery);
        if (match) {
            setSelectedService(match);
            setStep(STEPS.DATETIME);
        }
    }, [serviceIdFromQuery, services]);

    if (!slug) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">{t('invalidBooking')}</p>
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
                    <p className="text-gray-700 font-semibold">{t('institutionNotFound')}</p>
                    <Link to={createPageUrl('Institutions')}>
                        <Button>{t('backToHome')}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
                <InstitutionHeader institution={institution} />

                <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#1e3a5f]/80 uppercase tracking-wide">Services</p>
                            <h2 className="text-2xl font-bold text-gray-900">Select a service</h2>
                        </div>
                        <span className="text-xs text-gray-500">
                            {services.length} {services.length === 1 ? 'service' : 'services'} available
                        </span>
                    </div>
                    {services.length === 0 ? (
                        <p className="text-sm text-gray-500">This institution has not published any services yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {services.map((service) => {
                                const selected = selectedService?.id === service.id;
                                return (
                                    <div
                                        key={service.id}
                                        className={cn(
                                            'rounded-2xl border p-4 flex flex-col justify-between space-y-4 transition-shadow',
                                            selected
                                                ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-lg'
                                                : 'border-gray-100 bg-white hover:shadow-md'
                                        )}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={cn(
                                                        'text-lg font-semibold',
                                                        selected ? 'text-[#1e3a5f]' : 'text-gray-900'
                                                    )}
                                                >
                                                    {service.name}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    ~{service.duration_minutes || 30} min
                                                </span>
                                            </div>
                                            {service.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {service.description}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant={selected ? 'outline' : 'default'}
                                            className="h-12"
                                            onClick={() => handleServiceSelect(service)}
                                        >
                                            {selected ? 'Selected' : 'Select service'}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#1e3a5f]/80 uppercase tracking-wide">Booking</p>
                            <h2 className="text-2xl font-bold text-gray-900">Choose date & time</h2>
                        </div>
                        {selectedService && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Selected service</p>
                                <p className="font-medium text-gray-900">{selectedService.name}</p>
                            </div>
                        )}
                    </div>
                    {!selectedService ? (
                        <p className="text-sm text-gray-500">Select a service to unlock available slots.</p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                            <Card className="border-gray-200 shadow-none">
                                <CardContent className="p-0">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={handleDateSelect}
                                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                                        className="rounded-b-3xl"
                                    />
                                </CardContent>
                            </Card>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-600">Available slots</p>
                                    <span className="text-xs text-gray-400">{format(selectedDate, 'EEEE, MMM d')}</span>
                                </div>
                                <TimeSlotGrid
                                    slots={timeSlots}
                                    selectedSlot={selectedSlot}
                                    onSelect={handleSlotSelect}
                                    loading={slotsLoading}
                                />
                                {selectedSlot && (
                                    <div className="rounded-2xl border border-dashed border-gray-200 p-4 bg-gray-50">
                                        <p className="text-sm text-gray-500">Selected slot</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {selectedSlot.start_time} on {format(selectedDate, 'EEEE, MMM d')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#1e3a5f]/80 uppercase tracking-wide">Details</p>
                            <h2 className="text-2xl font-bold text-gray-900">Tell us who you're booking for</h2>
                        </div>
                        <span className="text-xs text-gray-500">Required fields are marked *</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1 text-sm">
                            <label className="text-xs text-gray-500">Full Name *</label>
                            <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g., Maria Silva"
                            />
                        </div>
                        <div className="space-y-1 text-sm">
                            <label className="text-xs text-gray-500">Phone *</label>
                            <Input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+123 456 789"
                            />
                        </div>
                        <div className="space-y-1 text-sm md:col-span-2">
                            <label className="text-xs text-gray-500">Email (optional)</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{errorMessage}</div>
                    )}
                    <div className="flex flex-col gap-2">
                        <Button
                            className="h-14 bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                            onClick={handleBookingSubmit}
                            disabled={!selectedSlot || !fullName || !phone || loading || createAppointment.isPending}
                        >
                            {loading || createAppointment.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : (
                                <>
                                    Confirm booking
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-gray-500">
                            We will send an OTP to {phone || 'your phone number'} and confirm your appointment at {selectedSlot?.start_time || 'the selected time'}.
                        </p>
                    </div>
                </section>

                {step === STEPS.OTP && appointment && (
                    <div className="bg-white border border-dashed border-gray-200 rounded-3xl shadow-sm p-6">
                        <OTPVerification
                            phone={phone}
                            onVerify={(code) => verifyOTP.mutate(code)}
                            onResend={() => console.log('OTP resent')}
                            onBack={() => setStep(STEPS.PHONE)}
                            loading={verifyOTP.isPending}
                        />
                    </div>
                )}

                {step === STEPS.CONFIRMATION && appointment && (
                    <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
                        <BookingConfirmation
                            appointment={appointment}
                            service={selectedService}
                            institution={institution}
                        />
                    </section>
                )}
            </div>
        </div>
    );
}
