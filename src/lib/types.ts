export const LANGS = ['uz', 'ru', 'en'] as const
export type Lang = (typeof LANGS)[number]
export type L3 = Record<Lang, string>

export type Branch = { id: string; city: L3; addr: L3; phones: string[]; img: string; map: string }
export type Slide = { id: string; title: L3; lead: L3; img: string; temp: number; cap: L3; sub: L3 }
export type TempStop = { id: string; t: number; label: L3; note: L3; cat: string; img: string }
export type Category = { id: string; slug: string; name: L3; spec: L3; desc: L3; img: string; temp?: [number, number] | null; visible: boolean }
export type Spec = { k: L3; v: string }
export type Product = { id: string; cat: string; name: L3; desc: L3; img: string; specs: Spec[]; visible: boolean }
export type Step = { id: string; t: L3; d: L3 }
export type Project = { id: string; name: L3; place: L3; system: L3; img: string; img2: string }
export type Member = { id: string; name: string; role: L3; phone: string; photo: string }
export type Client = { id: string; name: string; logo: string }
export type Fact = { id: string; v: string; u: L3; d: L3 }

export type Content = {
  settings: {
    phone: string
    email: string
    telegram: string
    instagram: string
    hours: L3
    branches: Branch[]
  }
  seo: { title: L3; description: L3 }
  texts: Record<string, L3>
  facts: Fact[]
  slides: Slide[]
  tempStops: TempStop[]
  categories: Category[]
  products: Product[]
  process: Step[]
  why: Step[]
  projects: Project[]
  team: Member[]
  brands: string[]
  clients: Client[]
}

export type LeadStatus = 'new' | 'progress' | 'done'
export type Lead = {
  id: string
  createdAt: string
  name: string
  phone: string
  product: string
  message: string
  lang: Lang
  page: string
  status: LeadStatus
  note: string
}

/** Pick a translation, falling back to Uzbek when a field is empty. */
export function tr(v: L3 | undefined, lang: Lang): string {
  if (!v) return ''
  return (v[lang] && v[lang].trim()) || v.uz || v.ru || v.en || ''
}

/** Resolve an image reference: absolute URLs pass through, catalog paths get a leading slash. */
export function src(p: string): string {
  if (!p) return ''
  if (/^(https?:\/\/|data:)/.test(p) || p.startsWith('/')) return p
  return `/${p}`
}

export const fmtT = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '0')
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`
