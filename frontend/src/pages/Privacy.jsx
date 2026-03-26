import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function Privacy() {
  return (
    <MarketingInfoPage
      eyebrow="Legal"
      title="Privacy notice"
      intro="This page explains the general privacy posture of RDV.BI. It is a product-facing information page and should be completed with formal legal review before final publication."
      sections={[
        {
          title: 'Information used by the platform',
          body: [
            'RDV.BI may process appointment-related information such as names, phone numbers, email addresses, institution details, and scheduling preferences.',
            'This data is used to support bookings, reminders, administrative workflows, and queue operations.',
          ],
        },
        {
          title: 'Purpose of processing',
          body: [
            'Personal and operational data is used to deliver appointment functionality, support institution management, and improve service reliability.',
            'The platform does not need unnecessary data to perform its main booking and administration tasks.',
          ],
        },
        {
          title: 'Access and responsibility',
          body: [
            'Institutions using RDV.BI are responsible for the data they collect and manage through their own workflows on the platform.',
            'Privacy expectations, retention rules, and regional compliance requirements should be reviewed in the context of the institution’s operating environment.',
          ],
        },
      ]}
    />
  );
}
