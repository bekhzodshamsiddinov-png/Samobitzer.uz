import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getContent } from '@/lib/store'
import { isLang, makeT } from '@/lib/i18n'
import { CatalogGrid, Contact } from '@/components/site/Sections'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const t = makeT(await getContent(), lang)
  return { title: t('catalogTitle'), alternates: { canonical: `/${lang}/catalog`, languages: { uz: '/uz/catalog', ru: '/ru/catalog', en: '/en/catalog' } } }
}

export default async function CatalogPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const c = await getContent()
  const t = makeT(c, lang)
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h1 className="font-display text-[32px] font-semibold leading-tight sm:text-[44px]">{t('catalogTitle')}</h1>
          <p className="mt-3 max-w-2xl text-[17px] text-steel">{t('catalogLead')}</p>
        </div>
      </section>
      <CatalogGrid c={c} lang={lang} showHeader={false} />
      <Contact c={c} lang={lang} />
    </>
  )
}
