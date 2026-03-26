import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function Features() {
  return (
    <MarketingInfoPage
      eyebrow="Product"
      title="Features built to make appointment flow feel effortless."
      intro="RDV.BI is designed for institutions that need speed, structure, and calm. The platform combines online booking, live queue management, and operational oversight in one experience."
      sections={[
        {
          title: 'Booking Experience',
          body: [
            'Customers can browse approved institutions, choose a service, and reserve a time slot without going through a long or confusing process.',
            'The booking flow is intentionally lightweight so appointments can be made quickly from a phone or desktop browser.',
          ],
        },
        {
          title: 'Operational Control',
          body: [
            'Institution teams can manage schedules, services, counters, and appointments from a single dashboard.',
            'That reduces handoffs between spreadsheets, phone calls, and manual queue handling.',
          ],
        },
        {
          title: 'Live Queue Visibility',
          body: [
            'Queue-facing views help staff and visitors understand what is happening in real time, which improves predictability inside the institution.',
            'This matters most in high-volume environments like banks, clinics, and public service offices.',
          ],
        },
      ]}
    />
  );
}
