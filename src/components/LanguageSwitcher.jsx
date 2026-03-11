import React from 'react';
import { useLanguage } from './LanguageContext';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher({ variant = 'outline' }) {
  const { lang, switchLang } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          {lang === 'fr' ? 'FR' : 'EN'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => switchLang('en')}
          className={lang === 'en' ? 'font-semibold bg-gray-50' : ''}
        >
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => switchLang('fr')}
          className={lang === 'fr' ? 'font-semibold bg-gray-50' : ''}
        >
          🇫🇷 Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
