import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function About() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Entreprise',
        title: 'À propos de RDV.BI',
        intro: 'RDV.BI existe pour rendre l’accès au service plus moderne, plus respectueux du temps des usagers et plus facile à gérer pour les institutions sous pression.',
        sections: [
          {
            title: 'Pourquoi nous avons créé RDV.BI',
            body: [
              "Les longues files physiques créent un stress évitable pour les clients comme pour le personnel. Nous pensons que les institutions doivent pouvoir organiser l'accès au service avant même l'arrivée du visiteur.",
              "RDV.BI a été construit autour de cette idée : réduire la friction de l'attente, améliorer la clarté opérationnelle et offrir de meilleurs outils d'organisation.",
            ],
          },
          {
            title: 'À qui la plateforme s’adresse',
            body: [
              "La plateforme convient aux banques, cliniques, assureurs et services publics qui ont besoin d'une prise de rendez-vous, d'une discipline horaire et d'une visibilité sur la file.",
              "Elle est particulièrement utile pour les équipes qui veulent un parcours public simple avec un meilleur contrôle interne.",
            ],
          },
          {
            title: 'Ce que nous valorisons',
            body: [
              'Nous valorisons la clarté, la rapidité et la confiance. Cela signifie que les décisions produit sont guidées par un usage opérationnel réel, pas uniquement par l’esthétique.',
              "L'objectif n'est pas seulement de faciliter la réservation, mais d'aider les institutions à être plus sereines et plus prévisibles au quotidien.",
            ],
          },
        ],
      }
    : {
        eyebrow: 'Company',
        title: 'About RDV.BI',
        intro: 'RDV.BI exists to make service access feel more modern, more respectful of people’s time, and more manageable for institutions under pressure.',
        sections: [
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
