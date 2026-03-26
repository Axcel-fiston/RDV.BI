import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

const C = {
  red: '#b91c1c',
  green: '#15803d',
  gold: '#d4af6a',
  text: '#1a0a0a',
  textMuted: '#6b2a2a',
};

const COPY = {
  en: {
    sectors: ['Banks', 'Clinics', 'Insurance', 'Public Services'],
    product: 'Product',
    features: 'Features',
    howItWorks: 'How it works',
    company: 'Company',
    about: 'About us',
    contact: 'Contact',
    legal: 'Legal',
    terms: 'Terms',
    privacy: 'Privacy',
    cookies: 'Cookies',
    builtFor: 'Built for banks, clinics, insurers, and public services.',
  },
  fr: {
    sectors: ['Banques', 'Cliniques', 'Assurance', 'Services publics'],
    product: 'Produit',
    features: 'Fonctionnalités',
    howItWorks: 'Comment ça marche',
    company: 'Entreprise',
    about: 'À propos',
    contact: 'Contact',
    legal: 'Juridique',
    terms: 'Conditions',
    privacy: 'Confidentialité',
    cookies: 'Cookies',
    builtFor: 'Conçu pour les banques, cliniques, assureurs et services publics.',
  },
};

export default function PublicFooter() {
  const { lang, t } = useLanguage();
  const copy = COPY[lang] || COPY.en;

  return (
    <footer className="relative z-10 px-4 pb-8">
      <div className="max-w-6xl mx-auto mt-8" style={{ background: 'transparent' }}>
        <div className="grid gap-8 py-8 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] md:items-start">
          <div>
            <Link
              to={createPageUrl('Home')}
              className="inline-flex items-center"
              style={{ background: 'transparent' }}
            >
              <img
                src="/RDV_transparent.png"
                alt="RDV.bi"
                className="h-16 w-auto object-contain"
                style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
              />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7" style={{ color: C.textMuted }}>
              Premium appointment booking for institutions that want smoother queues, faster service, and a calmer customer experience.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.sectors.map((label) => (
                <span
                  key={label}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.66)',
                    border: '1px solid rgba(185,28,28,0.1)',
                    color: C.textMuted,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: C.text }}>
              {copy.product}
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link to={createPageUrl('Features')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.features}
              </Link>
              <Link to={createPageUrl('HowItWorks')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.howItWorks}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: C.text }}>
              {copy.company}
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link to={createPageUrl('About')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.about}
              </Link>
              <Link to={createPageUrl('Contact')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.contact}
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: C.text }}>
              {copy.legal}
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              <Link to={createPageUrl('Terms')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.terms}
              </Link>
              <Link to={createPageUrl('Privacy')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.privacy}
              </Link>
              <Link to={createPageUrl('Cookies')} className="transition-opacity hover:opacity-70" style={{ color: C.textMuted }}>
                {copy.cookies}
              </Link>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col gap-3 py-5 text-xs md:flex-row md:items-center md:justify-between"
          style={{ color: C.textMuted }}
        >
          <p>{t('footer')}</p>
          <p>{copy.builtFor}</p>
        </div>
      </div>
    </footer>
  );
}
