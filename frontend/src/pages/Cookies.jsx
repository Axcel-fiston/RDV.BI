import React from 'react';
import MarketingInfoPage from '@/components/marketing/MarketingInfoPage';
import { useLanguage } from '@/components/LanguageContext';

export default function Cookies() {
  const { lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        eyebrow: 'Juridique',
        title: 'Cookies',
        intro: "Cette page donne un aperçu simple de l'utilisation des cookies et du stockage navigateur dans l'expérience RDV.BI.",
        sections: [
          {
            title: 'Pourquoi des cookies peuvent être utilisés',
            body: [
              "Les cookies ou mécanismes de stockage similaires peuvent aider l'application à mémoriser les sessions, préférences de langue et états d'interface.",
              "Ces mécanismes contribuent à une expérience plus fluide sur les pages publiques comme dans les tableaux de bord authentifiés.",
            ],
          },
          {
            title: 'Stockage fonctionnel',
            body: [
              "Une partie du stockage est nécessaire pour des comportements essentiels comme la continuité de session, la sélection de langue et la redirection après authentification.",
              'Sans ces fonctions, certaines parties de l’expérience peuvent devenir incohérentes ou nécessiter des saisies répétées.',
            ],
          },
          {
            title: 'Révision continue de la politique',
            body: [
              'Les informations sur les cookies et le stockage doivent être revues avec les exigences juridiques et de confidentialité avant une publication officielle.',
              'À mesure que le produit évolue, cette page devra rester alignée avec les technologies réellement utilisées en production.',
            ],
          },
        ],
      }
    : {
        eyebrow: 'Legal',
        title: 'Cookies',
        intro: 'This page gives a simple overview of how browser storage and cookies may be used across the RDV.BI experience.',
        sections: [
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
