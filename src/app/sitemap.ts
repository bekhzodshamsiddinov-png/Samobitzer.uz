import type { MetadataRoute } from 'next'
import { getContent } from '@/lib/store'
import { SITE_URL } from '@/lib/i18n'
import { LANGS } from '@/lib/types'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await getContent()
  const paths = ['', '/catalog', ...c.categories.filter((x) => x.visible).map((x) => `/catalog/${x.slug}`)]
  return paths.flatMap((p) => LANGS.map((lang) => ({
    url: `${SITE_URL}/${lang}${p}`,
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
    alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}${p}`])) },
  })))
}
