import { LANGS, tr, type Content, type Lang } from './types'

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v)
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.samobitzer.uz'

export function makeT(content: Content, lang: Lang) {
  return (key: string) => tr(content.texts[key], lang) || key
}
