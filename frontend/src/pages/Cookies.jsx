import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';

export default function Cookies() {
  return (
    <MarketingInfoPage
      eyebrow="Legal"
      title="Cookies"
      intro="This page gives a simple overview of how browser storage and cookies may be used across the RDV.BI experience."
      sections={[
        {
          title: 'Why cookies may be used',
          body: [
            'Cookies or similar browser storage can help the application remember sessions, language preferences, and interface state.',
            'These mechanisms support a smoother experience across public pages and authenticated dashboards.',
          ],
        },
        {
          title: 'Functional storage',
          body: [
            'Some storage is necessary for essential behavior such as sign-in continuity, language selection, and routing after authentication.',
            'Without these functions, parts of the experience may feel inconsistent or require repeated manual input.',
          ],
        },
        {
          title: 'Ongoing policy review',
          body: [
            'Cookie and storage disclosures should be reviewed alongside privacy and legal requirements before formal publication.',
            'As the product evolves, this page should stay aligned with the actual technologies used in production.',
          ],
        },
      ]}
    />
  );
}
