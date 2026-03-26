import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function HowItWorks() {
  return (
    <MarketingInfoPage
      eyebrow="Product"
      title="How RDV.BI works from registration to daily operations."
      intro="The platform is structured to separate public booking from institution administration, so customers get a simple experience while teams keep strong control behind the scenes."
      sections={[
        {
          title: '1. Institution joins the platform',
          body: [
            'An institution submits its registration and setup details through the public onboarding flow.',
            'After approval, the institution can access its admin environment and begin configuration.',
          ],
        },
        {
          title: '2. Team configures services and slots',
          body: [
            'Admins define services, working schedules, counters, and available time slots.',
            'This creates a clear and manageable appointment inventory before public traffic starts.',
          ],
        },
        {
          title: '3. Customers book without queue friction',
          body: [
            'Visitors choose a service, pick a date and time, and receive confirmation for the appointment.',
            'On the day of service, staff can work from a controlled queue rather than a crowded first-come-first-served line.',
          ],
        },
      ]}
    />
  );
}
