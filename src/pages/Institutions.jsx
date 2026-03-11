import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, Search, ArrowRight, Calendar, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TYPE_ICONS = {
    bank: '🏦', hospital: '🏥', insurance: '🛡️',
    government: '🏛️', utility: '⚡', other: '🏢'
};

const C = {
    red: '#b91c1c', green: '#15803d', gold: '#d4af6a',
    text: '#1a0a0a', textMuted: '#6b2a2a',
    bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
    cardBg: 'rgba(255,255,255,0.75)', cardBorder: 'rgba(255,255,255,0.9)',
};

export default function Institutions() {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const { data: institutions = [], isLoading } = useQuery({
        queryKey: ['institutions'],
        queryFn: () => api.entities.Institution.filter({ is_active: true })
    });

    const types = ['all', 'bank', 'hospital', 'insurance', 'government', 'utility', 'other'];

    const filtered = institutions.filter(inst => {
        const matchSearch = !search ||
            inst.name.toLowerCase().includes(search.toLowerCase()) ||
            inst.type?.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === 'all' || inst.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="min-h-screen" style={{ background: C.bg }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.07) 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-5%] right-[-5%] w-[450px] h-[450px] rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.07) 0%, transparent 70%)' }} />
                <div className="absolute top-0 left-0 w-full h-full opacity-25"
                    style={{ background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%)' }} />
            </div>

            {/* Header */}
            <header className="relative z-10 sticky top-0 border-b backdrop-blur-2xl"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(185,28,28,0.1)', boxShadow: '0 1px 30px rgba(185,28,28,0.05)' }}>
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link to={createPageUrl('Home')}>
                            <button className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(185,28,28,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(185,28,28,0.06)'}>
                                <ChevronLeft className="w-4 h-4" style={{ color: C.red }} />
                            </button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${C.red}, ${C.green})`, boxShadow: '0 4px 12px rgba(185,28,28,0.3)' }}>
                                <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-sm tracking-wide"
                                style={{ background: `linear-gradient(90deg, ${C.red}, ${C.green})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                RDV.bi
                            </span>
                        </div>
                    </div>
                    <LanguageSwitcher variant="outline" />
                </div>
            </header>

            <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: C.text }}>{t('findInstitution')}</h1>
                    <p className="text-sm" style={{ color: C.textMuted }}>{t('bookAtOrgs')}</p>
                </div>

                {/* Search & Filter */}
                <div className="rounded-2xl p-4 mb-6 space-y-3"
                    style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: 'blur(30px)', boxShadow: '0 4px 30px rgba(185,28,28,0.06), inset 0 1px 0 rgba(255,255,255,1)' }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.textMuted }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full h-11 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                            style={{ background: 'rgba(185,28,28,0.04)', border: '1px solid rgba(185,28,28,0.12)', color: C.text }}
                            onFocus={e => e.target.style.borderColor = `rgba(21,128,61,0.35)`}
                            onBlur={e => e.target.style.borderColor = 'rgba(185,28,28,0.12)'}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {types.map((type) => (
                            <button key={type} onClick={() => setTypeFilter(type)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                                style={typeFilter === type ? {
                                    background: `linear-gradient(135deg, ${C.red}, ${C.green})`,
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(185,28,28,0.3)'
                                } : {
                                    background: 'rgba(185,28,28,0.05)',
                                    border: '1px solid rgba(185,28,28,0.14)',
                                    color: C.textMuted
                                }}>
                                {type === 'all' ? t('allTypes') : `${TYPE_ICONS[type]} ${t(type)}`}
                            </button>
                        ))}
                    </div>
                </div>

                {!isLoading && (
                    <p className="text-xs mb-4" style={{ color: C.textMuted }}>
                        {filtered.length} {t('institutions').toLowerCase()}{search ? ` · "${search}"` : ''}
                    </p>
                )}

                {isLoading ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: 'rgba(185,28,28,0.05)' }} />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.map((institution) => (
                            <Link key={institution.id} to={`/institution/${institution.slug}`}>
                                <div className="group rounded-2xl p-5 cursor-pointer transition-all duration-300 h-full"
                                    style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, backdropFilter: 'blur(30px)', boxShadow: '0 4px 25px rgba(185,28,28,0.05), inset 0 1px 0 rgba(255,255,255,1)' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 50px rgba(185,28,28,0.12), inset 0 1px 0 rgba(255,255,255,1)'; e.currentTarget.style.borderColor = 'rgba(21,128,61,0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 25px rgba(185,28,28,0.05), inset 0 1px 0 rgba(255,255,255,1)'; e.currentTarget.style.borderColor = C.cardBorder; }}>
                                    <div className="flex items-center gap-4">
                                        {institution.logo_url ? (
                                            <img src={institution.logo_url} alt={institution.name}
                                                className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                                                style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.12)' }}>
                                                {TYPE_ICONS[institution.type] || '🏢'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate" style={{ color: C.text }}>{institution.name}</h3>
                                            <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 capitalize"
                                                style={{ background: 'rgba(21,128,61,0.08)', color: C.green, border: '1px solid rgba(21,128,61,0.18)' }}>
                                                {t(institution.type) || institution.type}
                                            </span>
                                            {institution.address && (
                                                <p className="text-xs mt-1 truncate" style={{ color: C.textMuted }}>{institution.address}</p>
                                            )}
                                        </div>
                                        <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-1"
                                            style={{ color: 'rgba(185,28,28,0.3)' }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Building2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(185,28,28,0.2)' }} />
                        <p className="font-medium" style={{ color: C.textMuted }}>{t('noResults')}</p>
                        <p className="text-sm mt-1" style={{ color: 'rgba(107,42,42,0.5)' }}>{t('tryDifferent')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

