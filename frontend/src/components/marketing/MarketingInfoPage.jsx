import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';

const C = {
  red: '#b91c1c',
  green: '#15803d',
  gold: '#d4af6a',
  text: '#1a0a0a',
  textMuted: '#6b2a2a',
  bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
};

export default function MarketingInfoPage({ eyebrow, title, intro, sections }) {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[25%] left-[42%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,106,0.08) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 md:px-8">
        <header className="flex items-center justify-between py-2">
          <Link to={createPageUrl('Home')} className="inline-flex items-center">
            <img src="/RDV%20logo.png" alt="RDV.bi" className="h-14 w-auto object-contain mix-blend-multiply" />
          </Link>
          <Link
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: C.textMuted, background: 'rgba(255,255,255,0.66)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Link>
        </header>

        <main className="pt-10 pb-16">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: C.textMuted }}>
              {eyebrow}
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight" style={{ color: C.text }}>
              {title}
            </h1>
            <p className="mt-5 text-base leading-8" style={{ color: C.textMuted }}>
              {intro}
            </p>
          </div>

          <div className="mt-10 space-y-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.75rem] p-7 md:p-8"
                style={{
                  background: 'rgba(255,255,255,0.68)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 12px 40px rgba(185,28,28,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <h2 className="text-2xl font-semibold" style={{ color: C.text }}>
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-7" style={{ color: C.textMuted }}>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
