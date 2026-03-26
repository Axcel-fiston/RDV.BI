import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, Clock, Shield, Zap, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const C = {
  red: '#b91c1c',
  redLight: '#dc2626',
  green: '#15803d',
  greenLight: '#16a34a',
  gold: '#d4af6a',
  text: '#1a0a0a',
  textMuted: '#6b2a2a',
  bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
  cardBg: 'rgba(255,255,255,0.7)',
  cardBorder: 'rgba(185,28,28,0.12)',
};

export default function Home() {
  const { t, lang } = useLanguage();
  const copy = lang === 'fr'
    ? {
        partner: 'Devenir partenaire',
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
      }
    : {
        partner: 'Become a Partner',
        sectors: ['Banks', 'Clinics', 'Insurance', 'Public Services'],
        product: 'Product',
        features: 'Features',
        howItWorks: 'How it works',
        company: 'Company',
        about: 'About us',
        contact: 'Contact Us',
        legal: 'Legal',
        terms: 'Terms',
        privacy: 'Privacy',
        cookies: 'Cookies',
        builtFor: 'Built for banks, clinics, insurers, and public services.',
      };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: C.bg }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-[35%] left-[40%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,106,0.06) 0%, transparent 70%)' }} />
        {/* Mirror sheen */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30"
          style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)' }} />
      </div>

      {/* Header */}
      <header
        className="fixed inset-x-0 top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.58)',
          boxShadow: '0 1px 40px rgba(185,28,28,0.05)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/RDV_transparent.png"
              alt="RDV.bi"
              className="h-12 w-auto object-contain sm:h-14"
              style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher variant="outline" />
            <Link to={createPageUrl('AdminLogin')}>
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.2)', color: C.red }}
              >
                {t('adminLogin')}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center px-4 pt-32 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
          style={{
            background: 'rgba(255,255,255,0.8)',
            border: `1px solid rgba(212,175,106,0.4)`,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 20px rgba(212,175,106,0.15), inset 0 1px 0 rgba(255,255,255,0.9)'
          }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: C.gold }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: C.textMuted }}>{t('smartQueueSystem')}</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl" style={{ color: C.text }}>
          {t('heroTitle')}
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${C.red} 0%, ${C.gold} 45%, ${C.green} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            {t('heroSubtitle')}
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed" style={{ color: C.textMuted }}>
          {t('heroDesc')}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <Link to={createPageUrl('Institutions')}>
            <button className="group flex w-full items-center justify-center gap-3 px-6 py-4 rounded-2xl text-base font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-2xl sm:w-auto sm:px-8"
              style={{
                background: `linear-gradient(135deg, ${C.red}, #991b1b)`,
                boxShadow: `0 8px 30px rgba(185,28,28,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
              }}>
              <Calendar className="w-5 h-5" />
              {t('bookNow')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to={createPageUrl('MyAppointments')}>
            <button className="flex w-full items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow hover:shadow-lg sm:w-auto sm:px-8"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: `1px solid rgba(21,128,61,0.25)`,
                color: C.green,
                backdropFilter: 'blur(15px)',
                boxShadow: '0 4px 20px rgba(21,128,61,0.1), inset 0 1px 0 rgba(255,255,255,0.9)'
              }}>
              {t('viewMyAppointments')}
            </button>
          </Link>
          <Link to="/InstitutionRegister">
            <button className="flex w-full items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow hover:shadow-lg border sm:w-auto sm:px-8"
              style={{
                background: 'rgba(255,255,255,0.85)',
                border: `1px solid rgba(26,10,10,0.15)`,
                color: C.text,
              }}>
              {copy.partner}
              <ChevronRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10 mt-16">
          {[['10K+', t('bookingsMade')], ['50+', t('institutionsStat')], ['< 60s', t('toBook')]].map(([val, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold" style={{ color: C.text }}>{val}</p>
              <p className="text-xs mt-1" style={{ color: C.textMuted }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 mb-8">
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(185,28,28,0.2), rgba(21,128,61,0.2), transparent)` }} />
      </div>

      {/* Feature Cards */}
      <section className="relative z-10 px-4 pb-24">
        <div className="max-w-5xl mx-auto grid gap-5 md:grid-cols-3">
          {[
            { icon: Zap, label: t('fastBooking'), desc: t('fastBookingDesc'), color: C.red, glow: 'rgba(185,28,28,0.12)' },
            { icon: Clock, label: t('saveTime'), desc: t('saveTimeDesc'), color: C.gold, glow: 'rgba(212,175,106,0.12)' },
            { icon: Shield, label: t('smsReminders'), desc: t('smsRemindersDesc'), color: C.green, glow: 'rgba(21,128,61,0.12)' },
          ].map(({ icon: Icon, label, desc, color, glow }) => (
            <div key={label} className="rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: 'rgba(255,255,255,0.75)',
                border: `1px solid rgba(255,255,255,0.9)`,
                backdropFilter: 'blur(30px)',
                boxShadow: `0 4px 30px ${glow}, 0 1px 0 rgba(255,255,255,1) inset`
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${glow}`, border: `1px solid ${color}25` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: C.text }}>{label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: C.textMuted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 px-4 pb-8"
      >
        <div
          className="max-w-6xl mx-auto mt-8"
          style={{
            background: 'transparent',
          }}
        >
          <div className="grid gap-8 py-8 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] md:items-start">
            <div>
              <Link to={createPageUrl('Home')} className="inline-flex items-center" style={{ background: 'transparent' }}>
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
    </div>
  );
}
