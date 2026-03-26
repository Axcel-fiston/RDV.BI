import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function HowItWorks() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Produit',
        title: 'Comment RDV.BI fonctionne, de l’inscription aux opérations quotidiennes.',
        intro: "La plateforme sépare la réservation publique de l'administration institutionnelle, afin que les clients profitent d'une expérience simple pendant que les équipes gardent un contrôle fort en arrière-plan.",
        sections: [
          {
            title: "1. L'institution rejoint la plateforme",
            body: [
              "Une institution soumet sa demande d'inscription et ses informations initiales via le parcours public d'onboarding.",
              "Après approbation, elle peut accéder à son environnement d'administration et commencer la configuration.",
            ],
          },
          {
            title: '2. L’équipe configure services et créneaux',
            body: [
              'Les administrateurs définissent les services, horaires, guichets et créneaux disponibles.',
              "Cela crée une offre de rendez-vous claire et maîtrisable avant l'arrivée du trafic public.",
            ],
          },
          {
            title: '3. Les clients réservent sans friction',
            body: [
              'Les visiteurs choisissent un service, une date et une heure, puis reçoivent leur confirmation.',
              "Le jour du service, le personnel travaille à partir d'une file maîtrisée plutôt qu'avec une attente désordonnée au guichet.",
            ],
          },
        ],
      }
    : {
        eyebrow: 'Product',
        title: 'How RDV.BI works from registration to daily operations.',
        intro: 'The platform is structured to separate public booking from institution administration, so customers get a simple experience while teams keep strong control behind the scenes.',
        sections: [
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
        ],
      };
  return (
    <MarketingInfoPage
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
      sections={copy.sections}
    />
  );
}
