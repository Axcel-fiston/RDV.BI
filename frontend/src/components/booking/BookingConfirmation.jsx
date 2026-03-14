import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, Ticket, MessageSquare, Home } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BookingConfirmation({ appointment, service, institution }) {
  return (
    <div className="text-center space-y-6 py-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
        <p className="text-gray-500">Your booking has been successfully confirmed</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 space-y-4 text-left max-w-sm mx-auto">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Ticket className="w-5 h-5 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Ticket Number</p>
            <p className="text-2xl font-bold text-[#1e3a5f]">{appointment.ticket_number}</p>
          </div>
        </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-900">
                {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium text-gray-900">{appointment.appointment_time}</p>
            </div>
        </div>

        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-medium text-gray-900">{service?.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Guest</p>
            <p className="font-medium text-gray-900">{appointment.customer_name}</p>
          </div>
        </div>
      </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 max-w-sm mx-auto">
        <p className="text-sm text-[#1e3a5f]">
          📱 You will receive an SMS reminder before your appointment.
        </p>
      </div>

      <Link to={createPageUrl('Home')}>
        <Button variant="outline" className="mt-4">
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
