import React, { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowLeft, ArrowRight, MapPin, Building2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function InstitutionDetails() {
  const { slug: slugParam } = useParams();
  const [searchParams] = useSearchParams();
  const slug = slugParam || searchParams.get('slug');
  const { t } = useLanguage();

  const { data: institutions = [], isLoading: loadingInstitution } = useQuery({
    queryKey: ['institution-details', slug],
    queryFn: () => api.entities.Institution.filter({ slug, is_active: true }),
    enabled: !!slug,
  });
  const institution = institutions?.[0];

  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ['institution-services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution.id, is_active: true }),
    enabled: !!institution?.id,
  });

  const { data: timeSlots = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['institution-slots', institution?.id],
    queryFn: () => api.entities.TimeSlot.filter({ institution_id: institution.id }),
    enabled: !!institution?.id,
  });

  const groupedSlots = useMemo(() => {
    const groups = new Map();
    timeSlots.forEach((slot) => {
      if (!slot.date) return;
      const dateObj = parseISO(slot.date);
      const label = format(dateObj, 'EEE, MMM d');
      const existing = groups.get(label) ?? [];
      groups.set(label, [...existing, slot].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    });
    return Array.from(groups.entries()).map(([label, slots]) => ({ label, slots })).slice(0, 4);
  }, [timeSlots]);

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-slate-600">No institution selected</p>
          <Link to={createPageUrl('Institutions')}>
            <Button variant="outline">{t('backToHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loadingInstitution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <p className="font-semibold text-slate-800">Institution not found</p>
          <Link to={createPageUrl('Institutions')}>
            <Button>{t('backToHome')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const bookingUrl = `${createPageUrl('PublicBooking')}?slug=${institution.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link to={createPageUrl('Institutions')} className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToHome')}
          </Link>
          <Link to={bookingUrl}>
            <Button className="bg-[#1e3a5f] hover:bg-[#2d4a6f]">
              {t('bookAppointment') || 'Book appointment'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg shadow-[#1e3a5f]/10">
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a5f] text-white flex items-center justify-center text-2xl">
              {institution.logo_url ? (
                <img src={institution.logo_url} alt={institution.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl text-slate-900">{institution.name}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2 text-slate-600">
                <Badge variant="outline" className="capitalize">{institution.type}</Badge>
                {institution.address && (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {institution.address}
                  </span>
                )}
              </CardDescription>
              {institution.description && (
                <p className="text-slate-700 leading-relaxed">{institution.description}</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-4 pt-0">
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Services</p>
              <p className="text-xl font-semibold text-slate-900">{services.length || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Next slot</p>
              <p className="text-xl font-semibold text-slate-900">
                {groupedSlots[0]?.slots?.[0]?.start_time ? groupedSlots[0].slots[0].start_time : 'Coming soon'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Booking</p>
              <p className="text-xl font-semibold text-[#1e3a5f]">Available</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader>
              <CardTitle>{t('selectService') || 'Available services'}</CardTitle>
              <CardDescription>{t('chooseService')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingServices ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : services.length ? (
                services.map((service) => (
                  <div key={service.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{service.name}</p>
                      <p className="text-sm text-slate-600">{service.description}</p>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-2">
                        <span className="inline-flex items-center gap-1"><Clock className="w-4 h-4" /> {service.duration_minutes} min</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> Prefix {service.prefix}</span>
                      </div>
                    </div>
                    <Link to={`${bookingUrl}&service=${service.id}`}>
                      <Button variant="outline" className="whitespace-nowrap">
                        {t('bookAppointment')}
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No services published yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Upcoming schedule</CardTitle>
              <CardDescription>Next available time slots</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSlots ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : groupedSlots.length ? (
                groupedSlots.map(({ label, slots }) => (
                  <div key={label} className="border border-slate-200 rounded-xl p-3">
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {label}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {slots.map((slot) => (
                        <span key={slot.id} className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No schedule published yet.</p>
              )}
              <Link to={bookingUrl}>
                <Button variant="outline" className="w-full">
                  {t('bookAppointment')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
