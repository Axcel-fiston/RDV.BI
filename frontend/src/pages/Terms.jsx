import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function Terms() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Juridique',
        title: "Conditions d'utilisation",
        intro: "Cette page décrit les attentes de base concernant l'utilisation du site et de la plateforme RDV.BI. Elle reste informative à ce stade et doit être revue juridiquement avant publication finale.",
        sections: [
          {
            title: 'Utilisation de la plateforme',
            body: [
              "Les utilisateurs doivent employer le service uniquement pour des activités licites liées aux rendez-vous, à la planification et à l'administration de la plateforme.",
              'Les institutions sont responsables de la précision des informations de service, des horaires et des paramètres opérationnels qu’elles publient.',
            ],
          },
          {
            title: 'Comptes et accès',
            body: [
              'L’accès aux fonctions administratives est fondé sur les rôles et doit être utilisé uniquement par des membres du personnel autorisés.',
              'Les utilisateurs sont responsables de la confidentialité de leurs identifiants et du signalement rapide de tout usage suspect.',
            ],
          },
          {
            title: 'Disponibilité du service',
            body: [
              'RDV.BI peut évoluer, être amélioré ou ajusté au fil du temps. Les fonctionnalités peuvent être mises à jour au fur et à mesure de la maturité du produit.',
              "L'utilisation de la plateforme est fournie sous réserve de la disponibilité opérationnelle et de besoins de maintenance raisonnables.",
            ],
          },
        ],
      }
    : {
        eyebrow: 'Legal',
        title: 'Terms of use',
        intro: 'These terms describe the basic expectations for using the RDV.BI website and platform. They are informational at this stage and should be reviewed formally before production legal publication.',
        sections: [
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
