import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import '../../globals.css'
import { getContent } from '@/lib/store'
import { isLang, makeT, SITE_URL } from '@/lib/i18n'
import { LANGS, tr } from '@/lib/types'
import { Header } from '@/components/site/Header'
import { Footer, MobileBar } from '@/components/site/Sections'

export const revalidate = 3600
export function generateStaticParams() { return LANGS.map((lang) => ({ lang })) }

export const viewport: Viewport = { themeColor: '#d0102c', width: 'device-width', initialScale: 1 }

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!isLang(lang)) return {}
  const c = await getContent()
  const title = tr(c.seo.title, lang)
  const description = tr(c.seo.description, lang)
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s — SAMO' },
    description,
    alternates: { canonical: `/${lang}`, languages: { uz: '/uz', ru: '/ru', en: '/en', 'x-default': '/uz' } },
    openGraph: { title, description, url: `/${lang}`, siteName: 'SAMO', locale: lang === 'uz' ? 'uz_UZ' : lang === 'ru' ? 'ru_RU' : 'en_US', type: 'website', images: ['/catalog/p11-084.webp'] },
    icons: { icon: '/brand/logo-red.png' },
  }
}

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLang(lang)) notFound()
  const c = await getContent()
  const t = makeT(c, lang)
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'SAMO Cold & Ventilation', url: SITE_URL,
    email: c.settings.email, telephone: c.settings.phone, image: `${SITE_URL}/brand/logo-red.png`,
    sameAs: [c.settings.instagram, c.settings.telegram],
    address: c.settings.branches.map((b) => ({ '@type': 'PostalAddress', streetAddress: tr(b.addr, lang), addressCountry: 'UZ' })),
  }
  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&family=Unbounded:wght@500;600&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Header lang={lang} hours={tr(c.settings.hours, lang)} phone={c.settings.phone} telegram={c.settings.telegram} instagram={c.settings.instagram} cta={t('cta')}
          links={[
            { href: `/${lang}/catalog`, label: t('nav.catalog') },
            { href: `/${lang}#process`, label: t('nav.services') },
            { href: `/${lang}#projects`, label: t('nav.projects') },
            { href: `/${lang}#why`, label: t('nav.about') },
            { href: `/${lang}#contact`, label: t('nav.contacts') },
          ]} />
        <main>{children}</main>
        <Footer c={c} lang={lang} />
        <MobileBar c={c} lang={lang} />
      </body>
    </html>
  )
}
