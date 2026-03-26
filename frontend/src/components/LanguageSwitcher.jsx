import React from 'react';
import { useLanguage } from './LanguageContext';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher({ variant = 'outline' }) {
  const { lang, switchLang, isSwitching, pendingLang } = useLanguage();
  const current = lang === 'fr'
    ? { code: 'FR', label: 'Francais', flag: 'FR', helper: 'Interface en francais' }
    : { code: 'EN', label: 'English', flag: 'EN', helper: 'Interface in English' };

  const options = [
    {
      value: 'en',
      code: 'EN',
      label: 'English',
      helper: 'Global interface',
    },
    {
      value: 'fr',
      code: 'FR',
      label: 'Francais',
      helper: 'Interface complete',
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          disabled={isSwitching}
          className="h-10 gap-2 rounded-2xl border-0 px-2.5 text-left shadow-none sm:h-11 sm:gap-3 sm:px-3.5"
          style={{
            background: 'rgba(255,255,255,0.58)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 10px 28px rgba(92,69,46,0.08)',
            color: '#2a1a10',
            backdropFilter: 'blur(18px)',
          }}
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-xl sm:h-8 sm:w-8"
            style={{
              background: 'linear-gradient(135deg, rgba(123,90,63,0.16), rgba(212,175,106,0.22))',
              color: '#7b5a3f',
            }}
          >
            <Globe className="h-4 w-4" />
          </span>
          <span className="hidden min-w-0 flex-1 flex-col leading-none sm:flex">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a6a4d]">
              Language
            </span>
            <span className="mt-1 truncate text-sm font-semibold text-[#2a1a10]">
              {isSwitching && pendingLang ? (pendingLang === 'fr' ? 'Francais' : 'English') : current.label}
            </span>
          </span>
          <span className="rounded-full bg-white/55 px-2 py-1 text-[10px] font-semibold text-[#7b5a3f] sm:text-[11px]">
            {isSwitching && pendingLang ? pendingLang.toUpperCase() : current.code}
          </span>
          <ChevronDown className="h-4 w-4 text-[#8a6a4d]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[calc(100vw-2rem)] max-w-64 rounded-3xl border-0 p-2.5 sm:w-64"
        style={{
          background: 'rgba(255,252,247,0.82)',
          boxShadow: '0 24px 70px rgba(72,52,34,0.18), inset 0 1px 0 rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <div className="px-3 pb-2 pt-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6a4d]">
            Language
          </p>
          <p className="mt-1 text-xs text-[#7a685a]">
            Choose how the interface is displayed.
          </p>
        </div>
        {options.map((option) => {
          const active = lang === option.value;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => switchLang(option.value)}
              className="mb-1 rounded-2xl border border-transparent px-3 py-3 focus:bg-transparent"
              style={active
                ? {
                    background: 'linear-gradient(135deg, rgba(123,90,63,0.10), rgba(212,175,106,0.16))',
                    borderColor: 'rgba(123,90,63,0.12)',
                  }
                : {
                    background: 'rgba(255,255,255,0.44)',
                  }}
            >
              <div className="flex w-full items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-2xl text-xs font-semibold sm:h-10 sm:w-10"
                  style={active
                    ? {
                        background: 'linear-gradient(135deg, #7b5a3f, #d4af6a)',
                        color: 'white',
                      }
                    : {
                        background: 'rgba(123,90,63,0.08)',
                        color: '#7b5a3f',
                      }}
                >
                  {option.code}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2a1a10]">{option.label}</p>
                  <p className="truncate text-xs text-[#7a685a]">{option.helper}</p>
                </div>
                {active && (
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                    style={{ background: 'rgba(21,128,61,0.12)', color: '#15803d' }}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
