import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function Features() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Produit',
        title: 'Des fonctionnalités conçues pour rendre la prise de rendez-vous fluide et simple.',
        intro: "RDV.BI est conçu pour les institutions qui ont besoin de rapidité, de structure et de sérénité. La plateforme réunit réservation en ligne, gestion de file d'attente et pilotage opérationnel dans une seule expérience.",
        sections: [
          {
            title: 'Expérience de réservation',
            body: [
              "Les clients peuvent parcourir les institutions approuvées, choisir un service et réserver un créneau sans passer par un processus long ou confus.",
              "Le parcours de réservation reste volontairement léger afin qu'un rendez-vous puisse être pris rapidement depuis un téléphone ou un ordinateur.",
            ],
          },
          {
            title: 'Contrôle opérationnel',
            body: [
              'Les équipes institutionnelles peuvent gérer horaires, services, guichets et rendez-vous depuis un tableau de bord unique.',
              'Cela réduit les allers-retours entre feuilles de calcul, appels téléphoniques et gestion manuelle des files.',
            ],
          },
          {
            title: 'Visibilité en temps réel',
            body: [
              "Les vues de file permettent au personnel et aux visiteurs de comprendre ce qui se passe en temps réel, ce qui améliore la prévisibilité à l'intérieur de l'institution.",
              'Ceci est particulièrement utile dans les environnements à fort volume comme les banques, cliniques et services publics.',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Product',
        title: 'Features built to make appointment flow feel effortless.',
        intro: 'RDV.BI is designed for institutions that need speed, structure, and calm. The platform combines online booking, live queue management, and operational oversight in one experience.',
        sections: [
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
