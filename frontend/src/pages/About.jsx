import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function About() {
  return (
    <MarketingInfoPage
      eyebrow="Company"
      title="About RDV.BI"
      intro="RDV.BI exists to make service access feel more modern, more respectful of people’s time, and more manageable for institutions under pressure."
      sections={[
        {
          title: 'Why we built it',
          body: [
            'Long physical queues create avoidable stress for both customers and staff. We believe institutions should be able to deliver structure before a visitor even arrives.',
            'RDV.BI is built around that idea: reduce waiting friction, improve operational clarity, and give institutions better tools to organize service demand.',
          ],
        },
        {
          title: 'Who it is for',
          body: [
            'The platform is suited to banks, clinics, insurance providers, and public services that need appointments, scheduling discipline, and queue visibility.',
            'It is especially useful for teams that want a simple public-facing booking journey with stronger internal control.',
          ],
        },
        {
          title: 'What we value',
          body: [
            'We value clarity, speed, and trust. That means product decisions are shaped around real operational use, not just interface aesthetics.',
            'The goal is not only to make booking easier, but to help institutions feel more composed and predictable every day.',
          ],
        },
      ]}
    />
  );
}
