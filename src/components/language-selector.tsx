'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/providers/i18n-provider';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { setLanguage, language } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9'>
          <Globe className='h-4 w-4' />
          <span className='sr-only'>Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          English {language === 'en' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ur')} className="font-nastaleeq">
          اردو {language === 'ur' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('pa')} className='font-nastaleeq'>
          پنجابی {language === 'pa' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('sd')} className='font-nastaleeq'>
          سنڌي {language === 'sd' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('ps')} className='font-nastaleeq'>
          پښتو {language === 'ps' && '✓'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

