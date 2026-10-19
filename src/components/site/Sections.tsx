import Link from 'next/link'
import { ArrowUpRight, Check, MapPin, Mail, Phone, Send, Instagram, UserRound } from 'lucide-react'
import { tr, src, fmtT, telHref, type Content, type Lang } from '@/lib/types'
import { makeT } from '@/lib/i18n'
import { ContactForm } from './ContactForm'

type P = { c: Content; lang: Lang }
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="font-display text-[28px] font-semibold leading-tight sm:text-[36px]">{children}</h2>
const Wrap = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={`mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>

export function CatalogGrid({ c, lang, showHeader = true }: P & { showHeader?: boolean }) {
  const t = makeT(c, lang)
  const cats = c.categories.filter((x) => x.visible)
  return (
    <section id="catalog" className="py-16 lg:py-24">
      <Wrap>
        {showHeader && (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl"><H2>{t('catalogTitle')}</H2><p className="mt-3 text-[17px] text-steel">{t('catalogLead')}</p></div>
            <Link href={`/${lang}/catalog`} className="inline-flex items-center gap-1 font-semibold text-samo hover:text-samo-dark">{t('allCatalog')} <ArrowUpRight size={18} /></Link>
          </div>
        )}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((cat, i) => {
            const big = i < 2
            return (
              <Link key={cat.id} href={`/${lang}/catalog/${cat.slug}`} className={`group flex flex-col overflow-hidden rounded-xl border border-line bg-white hover:border-ink/40 ${big ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                <div className={`relative overflow-hidden bg-frost-2 ${big ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
                  <img src={src(cat.img)} alt={tr(cat.name, lang)} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className={`font-semibold ${big ? 'text-2xl' : 'text-lg'}`}>{tr(cat.name, lang)}</h3>
                  <p className="mt-1 text-[15px] text-steel">{tr(cat.spec, lang)}</p>
                  {cat.temp && <span className="mt-4 self-start rounded-full bg-ice/30 px-2.5 py-1 text-[12px] font-semibold tabular-nums text-ice-deep">{fmtT(cat.temp[0])}…{fmtT(cat.temp[1])}°C</span>}
                </div>
              </Link>
            )
          })}
          <Link href={`/${lang}#contact`} className="flex flex-col justify-between rounded-xl bg-samo p-6 text-white hover:bg-samo-dark">
            <p className="text-lg font-semibold leading-snug">{t('notFoundTitle')}</p>
            <p className="mt-6 text-white/85">{t('notFoundLead')}</p>
          </Link>
        </div>
      </Wrap>
    </section>
  )
}

export function Process({ c, lang }: P) {
  const t = makeT(c, lang)
  return (
    <section id="process" className="border-y border-line bg-white py-16 lg:py-24">
      <Wrap>
        <div className="max-w-2xl"><H2>{t('processTitle')}</H2></div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          {c.process.map((s, i) => (
            <li key={s.id} className="lg:pr-6">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-samo font-display text-sm font-semibold text-samo">{i + 1}</span>
                {i < c.process.length - 1 && <span className="hidden h-px flex-1 bg-line lg:block" />}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{tr(s.t, lang)}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-steel">{tr(s.d, lang)}</p>
            </li>
          ))}
        </ol>
      </Wrap>
    </section>
  )
}

export function Why({ c, lang }: P) {
  const t = makeT(c, lang)
  const photo = c.settings.branches[0]?.img
  return (
    <section id="why" className="py-16 lg:py-24">
      <Wrap className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="overflow-hidden rounded-xl">{photo && <img src={src(photo)} alt="SAMO" loading="lazy" className="h-full min-h-[320px] w-full object-cover" />}</div>
        <div>
          <H2>{t('whyTitle')}</H2>
          <div className="mt-8 flex items-baseline gap-4 border-b border-line pb-8">
            <span className="font-display text-[88px] font-semibold leading-none text-samo">3</span>
            <p className="text-[17px] leading-snug">{t('warranty')}</p>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {c.why.map((w) => (
              <li key={w.id} className="flex gap-4 py-6">
                <Check className="mt-1 shrink-0 text-samo" size={20} />
                <div><h3 className="text-lg font-semibold">{tr(w.t, lang)}</h3><p className="mt-1 text-steel">{tr(w.d, lang)}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </section>
  )
}

export function Projects({ c, lang }: P) {
  const t = makeT(c, lang)
  return (
    <section id="projects" className="border-y border-line bg-white py-16 lg:py-24">
      <Wrap>
        <H2>{t('projectsTitle')}</H2>
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-2">
          {c.projects.map((p) => (
            <article key={p.id}>
              <div className="grid grid-cols-[2fr_1fr] gap-2 overflow-hidden rounded-xl">
                <img src={src(p.img)} alt={tr(p.name, lang)} loading="lazy" className="aspect-[4/3] h-full w-full object-cover" />
                {p.img2 ? <img src={src(p.img2)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="bg-frost-2" />}
              </div>
              <p className="mt-4 text-[13px] font-semibold text-samo">{tr(p.system, lang)}</p>
              <h3 className="mt-1 text-xl font-semibold">{tr(p.name, lang)}</h3>
              <p className="mt-1 inline-flex items-start gap-1.5 text-steel"><MapPin size={16} className="mt-1 shrink-0" />{tr(p.place, lang)}</p>
            </article>
          ))}
        </div>
      </Wrap>
    </section>
  )
}

export function Partners({ c, lang }: P) {
  const t = makeT(c, lang)
  return (
    <section className="py-16 lg:py-20">
      <Wrap>
        <h2 className="text-[15px] font-semibold text-steel">{t('brandsTitle')}</h2>
        <div className="mt-5 flex flex-wrap gap-x-10 gap-y-4">{c.brands.map((b) => <span key={b} className="font-display text-2xl font-semibold text-ink/70">{b}</span>)}</div>
        {c.clients.length > 0 && <>
          <h2 className="mt-14 text-[15px] font-semibold text-steel">{t('clientsTitle')}</h2>
          <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-5">
            {c.clients.map((cl) => (
              <div key={cl.id} className="grid h-24 place-items-center bg-white p-5">
                <img src={src(cl.logo)} alt={cl.name} loading="lazy" className="max-h-12 max-w-[120px] object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              </div>
            ))}
          </div>
        </>}
      </Wrap>
    </section>
  )
}

export function Contact({ c, lang, initialProduct }: P & { initialProduct?: string }) {
  const t = makeT(c, lang)
  return (
    <section id="contact" className="border-t border-line bg-white py-16 lg:py-24">
      <Wrap className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <H2>{t('formTitle')}</H2>
          <p className="mt-3 text-[17px] text-steel">{t('formLead')}</p>
          <ContactForm lang={lang} initialProduct={initialProduct}
            labels={{ name: t('formName'), phone: t('formPhone'), product: t('formProduct'), message: t('formMessage'), send: t('formSend'), sent: t('formSent'), error: t('formError') }}
            products={[...c.categories.filter((x) => x.visible).map((x) => tr(x.name, lang)), ...(initialProduct && !c.categories.some((x) => tr(x.name, lang) === initialProduct) ? [initialProduct] : [])]} />
        </div>
        <div>
          <a href={`mailto:${c.settings.email}`} className="mb-6 flex items-center gap-3 rounded-xl border border-line p-5 hover:border-ink/40">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-samo/10 text-samo"><Mail size={20} /></span>
            <span><span className="block text-[13px] text-steel">E-mail</span><span className="text-lg font-semibold">{c.settings.email}</span></span>
          </a>
          <h3 className="text-[15px] font-semibold text-steel">{t('branchesTitle')}</h3>
          <div className="mt-4 grid gap-4">
            {c.settings.branches.map((b) => (
              <div key={b.id} className="grid grid-cols-[120px_1fr] overflow-hidden rounded-xl border border-line sm:grid-cols-[160px_1fr]">
                {b.img ? <img src={src(b.img)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="bg-frost-2" />}
                <div className="p-5">
                  <p className="text-lg font-semibold">{tr(b.city, lang)}</p>
                  <p className="mt-1 inline-flex items-start gap-1.5 text-steel"><MapPin size={16} className="mt-1 shrink-0" />{tr(b.addr, lang)}</p>
                  <div className="mt-3 flex flex-col gap-1">{b.phones.map((p) => <a key={p} href={telHref(p)} className="font-semibold tabular-nums hover:text-samo">{p}</a>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  )
}

export function Team({ c, lang }: P) {
  const t = makeT(c, lang)
  if (!c.team.length) return null
  return (
    <section id="team" className="py-16 lg:py-24">
      <Wrap>
        <div className="max-w-2xl"><H2>{t('teamTitle')}</H2><p className="mt-3 text-[17px] text-steel">{t('teamLead')}</p></div>
        <ul className={`mt-12 flex flex-wrap justify-center gap-x-6 gap-y-10 ${c.team.length >= 5 ? 'lg:justify-between' : ''}`}>
          {c.team.map((m) => (
            <li key={m.id} className="flex w-[calc(50%-12px)] flex-col items-center text-center sm:w-[200px]">
              <div className="aspect-square w-full max-w-[184px] overflow-hidden rounded-full bg-white ring-1 ring-line ring-offset-4 ring-offset-frost">
                {m.photo ? <img src={src(m.photo)} alt={m.name} loading="lazy" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-steel/40"><UserRound size={64} strokeWidth={1.25} /></div>}
              </div>
              <p className="mt-5 text-lg font-semibold leading-tight">{m.name}</p>
              <p className="mt-1 text-[15px] text-steel">{tr(m.role, lang)}</p>
              {m.phone && <a href={telHref(m.phone)} className="mt-2 text-[15px] font-semibold tabular-nums hover:text-samo">{m.phone}</a>}
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  )
}

export function Footer({ c, lang }: P) {
  const t = makeT(c, lang)
  return (
    <footer className="bg-ink pb-20 text-white/70 md:pb-0">
      <Wrap className="flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <img src="/brand/logo-white.png" alt="SAMO" className="h-12 w-auto self-start" />
        <nav className="flex flex-wrap gap-6 text-[15px]">
          <Link href={`/${lang}/catalog`} className="hover:text-white">{t('nav.catalog')}</Link>
          <Link href={`/${lang}#process`} className="hover:text-white">{t('nav.services')}</Link>
          <Link href={`/${lang}#projects`} className="hover:text-white">{t('nav.projects')}</Link>
          <Link href={`/${lang}#contact`} className="hover:text-white">{t('nav.contacts')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href={c.settings.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:border-white hover:text-white"><Send size={18} /></a>
          <a href={c.settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:border-white hover:text-white"><Instagram size={18} /></a>
          <a href={`mailto:${c.settings.email}`} className="ml-2 text-[15px] hover:text-white">{c.settings.email}</a>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} SAMO Cold &amp; Ventilation. {t('rights')}</p>
      </Wrap>
    </footer>
  )
}

export function MobileBar({ c, lang }: P) {
  const t = makeT(c, lang)
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-line bg-white p-2 md:hidden">
      <a href={telHref(c.settings.phone)} className="flex h-12 items-center justify-center gap-2 rounded-md border border-line font-semibold"><Phone size={18} />{t('call')}</a>
      <a href={c.settings.telegram} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-md bg-samo font-semibold text-white"><Send size={18} />Telegram</a>
    </div>
  )
}
