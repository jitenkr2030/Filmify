'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n, Language } from '@/lib/i18n'
import { Globe, Languages } from 'lucide-react'

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'compact'
  className?: string
}

const LANGUAGES: Record<Language, { name: string; flag: string; nativeName: string }> = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English',
  },
  hi: {
    name: 'Hindi',
    flag: '🇮🇳',
    nativeName: 'हिंदी',
  },
}

export default function LanguageSelector({ 
  variant = 'dropdown', 
  className = '' 
}: LanguageSelectorProps) {
  const { language, setLanguage, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setIsOpen(false)
  }

  if (variant === 'toggle') {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
          <Button
            key={lang}
            variant={language === lang ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(lang)}
            className="min-w-0 px-2"
          >
            <span className="mr-1">{LANGUAGES[lang].flag}</span>
            <span className="hidden sm:inline">{LANGUAGES[lang].name}</span>
          </Button>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-16 ${className}`}>
          <span className="text-lg">{LANGUAGES[language].flag}</span>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
            <SelectItem key={lang} value={lang}>
              <div className="flex items-center space-x-2">
                <span>{LANGUAGES[lang].flag}</span>
                <span>{LANGUAGES[lang].nativeName}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Default dropdown variant
  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-40 ${className}`}>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
          <SelectItem key={lang} value={lang}>
            <div className="flex items-center space-x-2">
              <span>{LANGUAGES[lang].flag}</span>
              <div>
                <div className="font-medium">{LANGUAGES[lang].name}</div>
                <div className="text-sm text-gray-500">
                  {LANGUAGES[lang].nativeName}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Hook for getting current language info
export function useLanguageInfo() {
  const { language } = useI18n()
  return LANGUAGES[language]
}