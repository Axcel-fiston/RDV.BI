import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { CheckCircle2, XCircle, Star, Calendar, Clock, Building2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';

export default function AppointmentAction() {
  const urlParams = new URLSearchParams(window.location.search);
  const appointmentId = urlParams.get('id');
  const initialAction = urlParams.get('action'); // confirm | cancel

  const [step, setStep] = useState('action'); // action | rate | done
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [actionDone, setActionDone] = useState(null);

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
          <p className="text-gray-600">Invalid link. Please use the link from your reminder email.</p>
          <Link to={createPageUrl('Home')}><Button className="mt-4">Back to Home</Button></Link>
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
          <p className="text-gray-600">Appointment not found.</p>
          <Link to={createPageUrl('Home')}><Button className="mt-4">Back to Home</Button></Link>
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
          <div className="inline-flex items-center gap-2 text-[#1e3a5f] font-bold text-2xl">
            <Building2 className="w-7 h-7" />
            RDV.bi
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
              Ticket: {appointment.ticket_number}
            </span>
          </div>

          {/* Step: Action */}
          {step === 'action' && (
            isAlreadyActioned ? (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">This appointment is already <strong>{appointment.status}</strong>.</p>
                <Link to={createPageUrl('Home')}>
                  <Button className="mt-4 bg-[#1e3a5f] hover:bg-[#2d4a6f]">Back to Home</Button>
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {initialAction === 'cancel' ? 'Cancel appointment?' : 'Confirm your appointment'}
                </h2>
                <p className="text-gray-500 text-center text-sm mb-6">
                  {initialAction === 'cancel'
                    ? 'Are you sure? This action cannot be undone.'
                    : 'Please confirm that you will attend this appointment.'}
                </p>
                <div className="flex gap-3">
                  {initialAction === 'cancel' ? (
                    <>
                      <Link to={createPageUrl('Home')} className="flex-1">
                        <Button variant="outline" className="w-full">Keep It</Button>
                      </Link>
                      <Button
                        onClick={handleAction}
                        disabled={updateMutation.isPending}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Cancel'}
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
                      Confirm Attendance
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
                <h2 className="text-xl font-bold text-gray-900">Appointment Confirmed!</h2>
                <p className="text-gray-500 text-sm mt-1">How would you rate this service?</p>
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
                placeholder="Leave a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('done')} className="flex-1">Skip</Button>
                <Button
                  onClick={handleRating}
                  disabled={!rating || ratingMutation.isPending}
                  className="flex-1 bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                >
                  {ratingMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Rating'}
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
                  <h2 className="text-xl font-bold text-gray-900">Appointment Cancelled</h2>
                  <p className="text-gray-500 text-sm mt-1">We hope to see you again soon.</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-gray-900">Thank You!</h2>
                  <p className="text-gray-500 text-sm mt-1">Your feedback has been recorded.</p>
                </>
              )}
              <Link to={createPageUrl('Home')}>
                <Button className="mt-6 bg-[#1e3a5f] hover:bg-[#2d4a6f]">Back to Home</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

