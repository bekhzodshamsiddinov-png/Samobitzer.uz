'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Send, Instagram } from 'lucide-react'
import { LANGS, telHref, type Lang } from '@/lib/types'

type Props = {
  lang: Lang
  hours: string
  phone: string
  telegram: string
  instagram: string
  cta: string
  links: { href: string; label: string }[]
}

export function Header({ lang, hours, phone, telegram, instagram, cta, links }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname() || `/${lang}`
  const swap = (l: Lang) => pathname.replace(/^\/(uz|ru|en)(?=\/|$)/, `/${l}`)
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-frost/95 backdrop-blur">
      <div className="hidden bg-ink text-[13px] text-white/80 md:block">
        <div className="mx-auto flex h-9 max-w-[1240px] items-center justify-between px-6 lg:px-8">
          <span>Toshkent · Namangan — {hours}</span>
          <div className="flex items-center gap-5">
            <a href={telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white"><Send size={14} />Telegram</a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white"><Instagram size={14} />Instagram</a>
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href={`/${lang}`} className="shrink-0" aria-label="SAMO"><img src="/brand/logo-red.png" alt="SAMO" className="h-10 w-auto" /></Link>
        <nav className="hidden items-center gap-7 text-[15px] font-medium text-steel lg:flex">
          {links.map((l) => <Link key={l.href} href={l.href} className="hover:text-ink">{l.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex rounded-md border border-line bg-white p-0.5 text-[13px] font-semibold" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <Link key={l} href={swap(l)} hrefLang={l} aria-current={lang === l ? 'true' : undefined}
                className={`grid h-8 w-10 place-items-center rounded-[5px] uppercase ${lang === l ? 'bg-ink text-white' : 'text-steel hover:text-ink'}`}>{l}</Link>
            ))}
          </div>
          <a href={telHref(phone)} className="hidden font-semibold tabular-nums xl:block">{phone}</a>
          <Link href={`/${lang}#contact`} className="hidden h-12 items-center rounded-md bg-samo px-5 text-[15px] font-semibold text-white hover:bg-samo-dark md:inline-flex">{cta}</Link>
          <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-frost lg:hidden">
          <nav className="mx-auto flex max-w-[1240px] flex-col px-4 py-3 sm:px-6">
            {links.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-3 text-lg font-medium last:border-0">{l.label}</Link>)}
          </nav>
        </div>
      )}
    </header>
  )
}
