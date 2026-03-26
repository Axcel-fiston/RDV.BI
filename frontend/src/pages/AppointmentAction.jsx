import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { CheckCircle2, XCircle, Star, Calendar, Clock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

export default function AppointmentAction() {
  const { t, lang } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get('id');
  const initialAction = urlParams.get('action'); // confirm | cancel

  const [step, setStep] = useState('action'); // action | rate | done
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [actionDone, setActionDone] = useState(null);
  const copy = lang === 'fr'
    ? {
        invalidLink: "Lien invalide. Veuillez utiliser le lien reçu dans votre e-mail de rappel.",
        appointmentNotFound: 'Rendez-vous introuvable.',
        ticket: 'Ticket',
        alreadyActioned: 'Ce rendez-vous est déjà',
        cancelQuestion: 'Annuler le rendez-vous ?',
        confirmQuestion: 'Confirmer votre rendez-vous',
        cancelWarning: 'Êtes-vous sûr ? Cette action est irréversible.',
        confirmWarning: 'Veuillez confirmer que vous serez présent à ce rendez-vous.',
        keepIt: 'Conserver',
        yesCancel: 'Oui, annuler',
        confirmAttendance: 'Confirmer la présence',
        appointmentConfirmed: 'Rendez-vous confirmé !',
        rateService: 'Comment évalueriez-vous ce service ?',
        commentPlaceholder: 'Laisser un commentaire (facultatif)',
        skip: 'Passer',
        submitRating: "Envoyer l'évaluation",
        appointmentCancelled: 'Rendez-vous annulé',
        seeYouSoon: 'Nous espérons vous revoir bientôt.',
        thankYou: 'Merci !',
        feedbackRecorded: 'Votre avis a bien été enregistré.',
      }
    : {
        invalidLink: 'Invalid link. Please use the link from your reminder email.',
        appointmentNotFound: 'Appointment not found.',
        ticket: 'Ticket',
        alreadyActioned: 'This appointment is already',
        cancelQuestion: 'Cancel appointment?',
        confirmQuestion: 'Confirm your appointment',
        cancelWarning: 'Are you sure? This action cannot be undone.',
        confirmWarning: 'Please confirm that you will attend this appointment.',
        keepIt: 'Keep It',
        yesCancel: 'Yes, Cancel',
        confirmAttendance: 'Confirm Attendance',
        appointmentConfirmed: 'Appointment Confirmed!',
        rateService: 'How would you rate this service?',
        commentPlaceholder: 'Leave a comment (optional)',
        skip: 'Skip',
        submitRating: 'Submit Rating',
        appointmentCancelled: 'Appointment Cancelled',
        seeYouSoon: 'We hope to see you again soon.',
        thankYou: 'Thank You!',
        feedbackRecorded: 'Your feedback has been recorded.',
      };

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['apt-action', appointmentId],
    queryFn: () => api.entities.Appointment.filter({ id: appointmentId }),
    enabled: !!appointmentId
  });
  const appointment = appointments[0];

  const { data: services = [] } = useQuery({
    queryKey: ['apt-services', appointment?.institution_id],
    queryFn: () => api.entities.Service.filter({ institution_id: appointment.institution_id }),
    enabled: !!appointment?.institution_id
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ['apt-institution', appointment?.institution_id],
    queryFn: () => api.entities.Institution.filter({ id: appointment.institution_id }),
    enabled: !!appointment?.institution_id
  });

  const aptInstitution = institutions[0];
  const service = services.find(s => s.id === appointment?.service_id);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Appointment.update(id, data),
    onSuccess: (_, vars) => {
      const newStatus = vars.data.status;
      setActionDone(newStatus);
      setStep(newStatus === 'confirmed' ? 'rate' : 'done');
    }
  });

  const ratingMutation = useMutation({
    mutationFn: (data) => api.entities.CustomerRating.create(data),
    onSuccess: () => setStep('done')
  });

  const handleAction = () => {
    if (!appointment) return;
    updateMutation.mutate({
      id: appointment.id,
      data: { status: initialAction === 'cancel' ? 'cancelled' : 'confirmed' }
    });
  };

  const handleRating = () => {
    ratingMutation.mutate({
      appointment_id: appointment.id,
      institution_id: appointment.institution_id,
      service_id: appointment.service_id,
      counter_number: appointment.counter_number,
      rating,
      comment
    });
  };

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">{copy.invalidLink}</p>
          <Link to={createPageUrl('Home')}><Button className="mt-4">{t('backToHome')}</Button></Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">{copy.appointmentNotFound}</p>
          <Link to={createPageUrl('Home')}><Button className="mt-4">{t('backToHome')}</Button></Link>
        </div>
      </div>
    );
  }

  const isAlreadyActioned = ['confirmed', 'cancelled', 'completed'].includes(appointment.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-2xl px-2 py-2 text-[#1e3a5f] font-bold text-2xl bg-gradient-to-br from-slate-50 to-blue-50">
            <img src="/RDV_transparent.png" alt="RDV.bi" className="h-14 w-auto object-contain" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Appointment Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-1">
            <p className="font-semibold text-gray-900">{aptInstitution?.name}</p>
            <p className="text-sm text-gray-600">{service?.name}</p>
            <div className="flex gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {appointment.appointment_date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {appointment.appointment_time}
              </span>
            </div>
            <span className="inline-block text-xs font-mono bg-[#1e3a5f]/10 text-[#1e3a5f] px-2 py-1 rounded-md mt-1">
              {copy.ticket}: {appointment.ticket_number}
            </span>
          </div>

          {/* Step: Action */}
          {step === 'action' && (
            isAlreadyActioned ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{copy.alreadyActioned} <strong>{appointment.status}</strong>.</p>
                <Link to={createPageUrl('Home')}>
                  <Button className="mt-4 bg-[#1e3a5f] hover:bg-[#2d4a6f]">{t('backToHome')}</Button>
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {initialAction === 'cancel' ? copy.cancelQuestion : copy.confirmQuestion}
                </h2>
                <p className="text-gray-500 text-center text-sm mb-6">
                  {initialAction === 'cancel'
                    ? copy.cancelWarning
                    : copy.confirmWarning}
                </p>
                <div className="flex gap-3">
                  {initialAction === 'cancel' ? (
                    <>
                      <Link to={createPageUrl('Home')} className="flex-1">
                        <Button variant="outline" className="w-full">{copy.keepIt}</Button>
                      </Link>
                      <Button
                        onClick={handleAction}
                        disabled={updateMutation.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : copy.yesCancel}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleAction}
                      disabled={updateMutation.isPending}
                      className="w-full bg-[#1e3a5f] hover:bg-[#2d4a6f] h-12 text-base"
                    >
                      {updateMutation.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        : <CheckCircle2 className="w-5 h-5 mr-2" />}
                      {copy.confirmAttendance}
                    </Button>
                  )}
                </div>
              </>
            )
          )}

          {/* Step: Rate */}
          {step === 'rate' && (
            <>
              <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h2 className="text-xl font-bold text-gray-900">{copy.appointmentConfirmed}</h2>
                <p className="text-gray-500 text-sm mt-1">{copy.rateService}</p>
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={cn(
                      "w-8 h-8 transition-colors",
                      (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    )} />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder={copy.commentPlaceholder}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('done')} className="flex-1">{copy.skip}</Button>
                <Button
                  onClick={handleRating}
                  disabled={!rating || ratingMutation.isPending}
                  className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                >
                  {ratingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : copy.submitRating}
                </Button>
              </div>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              {actionDone === 'cancelled' ? (
                <>
                  <XCircle className="w-14 h-14 text-red-400 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-900">{copy.appointmentCancelled}</h2>
                  <p className="text-gray-500 text-sm mt-1">{copy.seeYouSoon}</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-900">{copy.thankYou}</h2>
                  <p className="text-gray-500 text-sm mt-1">{copy.feedbackRecorded}</p>
                </>
              )}
              <Link to={createPageUrl('Home')}>
                <Button className="mt-6 bg-[#1e3a5f] hover:bg-[#2d4a6f]">{t('backToHome')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

