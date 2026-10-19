import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getContent } from '@/lib/store'
import { isLang, makeT } from '@/lib/i18n'
import { tr, src, fmtT } from '@/lib/types'
import { Contact } from '@/components/site/Sections'
import { RequestButton } from '@/components/site/RequestButton'

export const revalidate = 3600

export async function generateStaticParams() {
  const c = await getContent()
  return ['uz', 'ru', 'en'].flatMap((lang) => c.categories.map((x) => ({ lang, slug: x.slug })))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params
  if (!isLang(lang)) return {}
  const cat = (await getContent()).categories.find((x) => x.slug === slug)
  if (!cat) return {}
  return {
    title: tr(cat.name, lang), description: tr(cat.desc, lang) || tr(cat.spec, lang),
    alternates: { canonical: `/${lang}/catalog/${slug}`, languages: { uz: `/uz/catalog/${slug}`, ru: `/ru/catalog/${slug}`, en: `/en/catalog/${slug}` } },
    openGraph: { images: [src(cat.img)] },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params
  if (!isLang(lang)) notFound()
  const c = await getContent()
  const t = makeT(c, lang)
  const cat = c.categories.find((x) => x.slug === slug && x.visible)
  if (!cat) notFound()
  const items = c.products.filter((p) => p.cat === cat.id && p.visible)
  const name = tr(cat.name, lang)
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <Link href={`/${lang}/catalog`} className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-steel hover:text-ink"><ArrowLeft size={16} />{t('backToCatalog')}</Link>
            <h1 className="mt-5 font-display text-[32px] font-semibold leading-tight sm:text-[44px]">{name}</h1>
            <p className="mt-2 text-[17px] font-medium">{tr(cat.spec, lang)}</p>
            {tr(cat.desc, lang) && <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-steel">{tr(cat.desc, lang)}</p>}
            {cat.temp && <span className="mt-6 self-start rounded-full bg-ice/30 px-3 py-1.5 text-[14px] font-semibold tabular-nums text-ice-deep">{fmtT(cat.temp[0])}…{fmtT(cat.temp[1])}°C</span>}
            <Link href="#contact" className="mt-8 inline-flex h-12 items-center self-start rounded-md bg-samo px-5 text-[15px] font-semibold text-white hover:bg-samo-dark">{t('cta')}</Link>
          </div>
          <div className="overflow-hidden rounded-xl bg-frost-2"><img src={src(cat.img)} alt={name} className="h-full max-h-[440px] w-full object-cover" /></div>
        </div>
      </section>
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-[24px] font-semibold sm:text-[30px]">{t('productsTitle')}</h2>
          {items.length === 0 ? <p className="mt-6 rounded-xl border border-line bg-white p-6 text-steel">{t('emptyCategory')}</p> : (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
                  <div className="relative aspect-[4/3] bg-white"><img src={src(p.img)} alt={tr(p.name, lang)} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-3" /></div>
                  <div className="flex flex-1 flex-col border-t border-line p-5">
                    <h3 className="text-lg font-semibold leading-snug">{tr(p.name, lang)}</h3>
                    {tr(p.desc, lang) && <p className="mt-1.5 text-[15px] text-steel">{tr(p.desc, lang)}</p>}
                    {p.specs.length > 0 && (
                      <dl className="mt-4 divide-y divide-line rounded-lg bg-frost text-[14px]">
                        {p.specs.map((s, k) => (
                          <div key={k} className="flex justify-between gap-3 px-3 py-2"><dt className="text-steel">{tr(s.k, lang)}</dt><dd className="text-right font-semibold">{s.v}</dd></div>
                        ))}
                      </dl>
                    )}
                    <RequestButton product={tr(p.name, lang)} label={t('requestThis')} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      <Contact c={c} lang={lang} initialProduct={name} />
    </>
  )
}
