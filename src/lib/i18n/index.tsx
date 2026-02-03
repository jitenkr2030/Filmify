'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Language translations
import enTranslations from './en.json'
import hiTranslations from './hi.json'

type Language = 'en' | 'hi'
type Translations = typeof enTranslations

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translations: Record<Language, Translations> = {
  en: enTranslations,
  hi: hiTranslations,
}

const RTL_LANGUAGES: Language[] = [] // Add RTL languages here

interface I18nProviderProps {
  children: ReactNode
  defaultLanguage?: Language
}

export function I18nProvider({ children, defaultLanguage = 'en' }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)

  // Load language from localStorage on mount
  useEffect(() => {
    const loadSavedLanguage = () => {
      const savedLanguage = localStorage.getItem('filmify-language') as Language
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage)
      }
    }
    loadSavedLanguage()
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('filmify-language', lang)
    
    // Update document language and direction
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr'
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to English if key not found
        value = translations.en
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey]
          } else {
            return key // Return key if not found
          }
        }
        break
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters in the string
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param]?.toString() || match
      })
    }
    
    return value
  }

  const isRTL = RTL_LANGUAGES.includes(language)

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Export types for use in components
export type { Language, Translations }