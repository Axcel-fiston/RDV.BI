import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, Search, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import PublicFooter from '@/components/PublicFooter';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TYPE_ICONS = {
  all: '✨',
  bank: '🏦',
  hospital: '🏥',
  insurance: '🛡️',
  government: '🏛️',
  utility: '⚡',
  other: '🏢',
};

const C = {
  red: '#b91c1c',
  green: '#15803d',
  gold: '#d4af6a',
  text: '#1a0a0a',
  textMuted: '#6b2a2a',
  bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
  cardBg: 'rgba(255,255,255,0.75)',
  cardBorder: 'rgba(255,255,255,0.9)',
};

export default function Institutions() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: () => api.entities.Institution.filter({ is_active: true }),
  });

  const types = ['all', 'bank', 'hospital', 'insurance', 'government', 'utility', 'other'];

  const filtered = institutions.filter((inst) => {
    const matchSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.type?.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || inst.type === typeFilter;

    return matchSearch && matchType;
  });

  return (
    <>
      <div className="min-h-screen" style={{ background: C.bg }}>
        
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.07) 0%, transparent 70%)' }}
          />
          <div
            className="absolute bottom-[-5%] right-[-5%] w-[450px] h-[450px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.07) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-0 left-0 w-full h-full opacity-25"
            style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)' }}
          />
        </div>

        {/* Header */}
        <header
          className="fixed inset-x-0 top-0 z-30"
          style={{
            background: 'rgba(255,255,255,0.58)',
            boxShadow: '0 1px 30px rgba(185,28,28,0.05)',
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Home')}>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border"
                  style={{
                    background: 'rgba(185,28,28,0.08)',
                    borderColor: 'rgba(185,28,28,0.15)',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: C.red }} />
                </button>
              </Link>

              <img
                src="/RDV_transparent.png"
                alt="RDV.bi"
                className="h-16 w-auto object-contain sm:h-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="outline" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-32">
          
          <div className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: C.text }}>
              {t('findInstitution')}
            </h1>
            <p className="text-sm" style={{ color: C.textMuted }}>
              {t('bookAtOrgs')}
            </p>
          </div>

          {/* Search & Filter */}
          <div
            className="rounded-2xl p-4 mb-6 space-y-3"
            style={{
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              backdropFilter: 'blur(30px)',
              boxShadow: '0 4px 30px rgba(185,28,28,0.06)',
            }}
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full h-11 pl-10 pr-4 rounded-xl outline-none"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {types.map((type) => {
                const isActive = typeFilter === type;

                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1"
                    style={{
                      background: isActive ? C.red : 'rgba(255,255,255,0.6)',
                      color: isActive ? '#fff' : C.textMuted,
                      border: isActive
                        ? '1px solid transparent'
                        : '1px solid rgba(0,0,0,0.08)',
                      boxShadow: isActive
                        ? '0 4px 12px rgba(185,28,28,0.25)'
                        : 'none',
                    }}
                  >
                    <span>{TYPE_ICONS[type]}</span>
                    <span className="capitalize">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>
          

          {/* Results */}
          {isLoading ? (
            <div>Loading...</div>
          ) : filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((institution) => (
                <Link key={institution.id} to={`/institutions/${institution.slug}`}>
                  <div className="p-4 border rounded-xl hover:shadow-md transition">
                    {institution.name}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-60" />
              <p>{t('noResults')}</p>
            </div>
          )} 
        </div>  
      </div>

      {/* Footer */}
      <PublicFooter />
    </>
  );
}