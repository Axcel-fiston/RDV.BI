import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function Terms() {
  return (
    <MarketingInfoPage
      eyebrow="Legal"
      title="Terms of use"
      intro="These terms describe the basic expectations for using the RDV.BI website and platform. They are informational at this stage and should be reviewed formally before production legal publication."
      sections={[
        {
          title: 'Use of the platform',
          body: [
            'Users must use the service only for lawful appointment, scheduling, and administrative activities related to the platform.',
            'Institutions are responsible for the accuracy of the service information, schedules, and operational settings they publish.',
          ],
        },
        {
          title: 'Accounts and access',
          body: [
            'Access to administrative functions is role-based and should only be used by authorized staff members.',
            'Users are responsible for maintaining the confidentiality of their credentials and reporting suspected misuse promptly.',
          ],
        },
        {
          title: 'Service availability',
          body: [
            'RDV.BI may evolve, improve, or adjust the service over time. Features may be updated as the platform matures.',
            'Use of the platform is provided subject to operational availability and reasonable maintenance needs.',
          ],
        },
      ]}
    />
  );
}
