import { notFound } from 'next/navigation'
import { getContent } from '@/lib/store'
import { isLang, makeT } from '@/lib/i18n'
import { tr, src } from '@/lib/types'
import { Hero } from '@/components/site/Hero'
import { TempScale } from '@/components/site/TempScale'
import { MapSection } from '@/components/site/MapSection'
import { CatalogGrid, Process, Why, Projects, Partners, Contact, Team } from '@/components/site/Sections'

export const revalidate = 3600

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const c = await getContent()
  const t = makeT(c, lang)
  const slugOf = (id: string) => c.categories.find((x) => x.id === id)?.slug
  return (
    <>
      <Hero cta={t('cta')} secondary={t('heroSecondary')} ctaHref={`/${lang}#contact`} catalogHref={`/${lang}/catalog`}
        slides={c.slides.map((s) => ({ title: tr(s.title, lang), lead: tr(s.lead, lang), img: src(s.img), temp: s.temp, cap: tr(s.cap, lang), sub: tr(s.sub, lang) }))}
        facts={c.facts.map((f) => ({ v: f.v, u: tr(f.u, lang), d: tr(f.d, lang) }))} />
      <TempScale title={t('tempTitle')} lead={t('tempLead')} cta={t('cta')} more={t('more')} ctaHref={`/${lang}#contact`}
        stops={c.tempStops.map((s) => ({ t: s.t, label: tr(s.label, lang), note: tr(s.note, lang), img: src(s.img), href: slugOf(s.cat) ? `/${lang}/catalog/${slugOf(s.cat)}` : `/${lang}/catalog` }))} />
      <CatalogGrid c={c} lang={lang} />
      <Process c={c} lang={lang} />
      <Why c={c} lang={lang} />
      <Projects c={c} lang={lang} />
      <Partners c={c} lang={lang} />
      <Contact c={c} lang={lang} />
      <Team c={c} lang={lang} />
      <MapSection title={t('mapTitle')} route={t('mapRoute')}
        branches={c.settings.branches.map((b) => ({ city: tr(b.city, lang), addr: tr(b.addr, lang), phones: b.phones, map: b.map }))} />
    </>
  )
}
