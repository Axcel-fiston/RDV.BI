import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function Privacy() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Juridique',
        title: 'Politique de confidentialité',
        intro: "Cette page explique l'approche générale de RDV.BI en matière de confidentialité. Il s'agit d'une page d'information produit qui devra être finalisée avec une validation juridique avant publication officielle.",
        sections: [
          {
            title: 'Informations utilisées par la plateforme',
            body: [
              "RDV.BI peut traiter des informations liées aux rendez-vous telles que les noms, numéros de téléphone, adresses e-mail, données d'institution et préférences horaires.",
              'Ces données sont utilisées pour prendre en charge les réservations, rappels, workflows administratifs et opérations de file d’attente.',
            ],
          },
          {
            title: 'Finalité du traitement',
            body: [
              'Les données personnelles et opérationnelles sont utilisées pour fournir les fonctions de rendez-vous, soutenir la gestion institutionnelle et améliorer la fiabilité du service.',
              "La plateforme n'a pas besoin de données superflues pour assurer ses tâches principales.",
            ],
          },
          {
            title: 'Accès et responsabilité',
            body: [
              'Les institutions qui utilisent RDV.BI sont responsables des données qu’elles collectent et gèrent au travers de leurs propres workflows.',
              'Les attentes en matière de confidentialité, les règles de conservation et les exigences régionales de conformité doivent être examinées dans le contexte de chaque institution.',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Legal',
        title: 'Privacy notice',
        intro: 'This page explains the general privacy posture of RDV.BI. It is a product-facing information page and should be completed with formal legal review before final publication.',
        sections: [
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
