import { NavigationMenu } from 'alpina-ui'
import { guideHref } from './paths.js'

export const guideLanguageNames = { en: 'English', de: 'Deutsch', fr: 'Français', it: 'Italiano' } as const
export type GuideLanguage = keyof typeof guideLanguageNames
export const downloadLabel = { en: 'Download', de: 'Herunterladen:', fr: 'Télécharger', it: 'Scarica' }
const labels = { en: 'Guide language', de: 'Sprache der Anleitung', fr: 'Langue du guide', it: 'Lingua della guida' }
export function guideTitle(guide: string, language: GuideLanguage) {
  const titles = guide === 'start'
    ? { en: 'Getting started', de: 'Erste Schritte', fr: 'Premiers pas', it: 'Guida introduttiva' }
    : { en: 'Swiss interfaces', de: 'Schweizer Benutzeroberflächen', fr: 'Interfaces suisses', it: 'Interfacce svizzere' }
  return titles[language]
}
export function GuideLanguages({ guide, language, hosted }: { guide: string; language: GuideLanguage; hosted: boolean }) {
  return <NavigationMenu label={labels[language]} orientation="horizontal" sections={[{ links:
    Object.entries(guideLanguageNames).map(([key, name]) => ({
      href: guideHref(guide + (key === 'en' ? '' : '/' + key), hosted),
      label: <span lang={key}>{name}</span>, current: key === language,
    })),
  }]} />
}
