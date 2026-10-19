'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtT } from '@/lib/types'

export type HeroSlide = { title: string; lead: string; img: string; temp: number; cap: string; sub: string }
type Fact = { v: string; u: string; d: string }

function Thermometer({ temp }: { temp: number }) {
  const ticks = [30, 20, 10, 0, -10, -20, -30, -40]
  const top = 6 + ((30 - Math.max(-40, Math.min(30, temp))) / 70) * 88
  return (
    <div className="absolute inset-y-0 left-0 w-[86px] bg-ink/55 text-white backdrop-blur-sm" aria-hidden>
      <div className="relative h-full">
        {ticks.map((v, i) => (
          <div key={v} className="absolute inset-x-0 flex items-center gap-2 pl-3" style={{ top: `${6 + i * (88 / (ticks.length - 1))}%` }}>
            <span className="h-px w-4 bg-white/60" />
            <span className="text-[12px] tabular-nums text-white/80">{fmtT(v)}°</span>
          </div>
        ))}
        <div className="absolute inset-x-0 transition-[top] duration-1000 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none" style={{ top: `${top}%` }}>
          <div className="relative flex items-center">
            <span className="h-[3px] w-full bg-samo" />
            <span className="absolute left-[92px] whitespace-nowrap rounded bg-samo px-2.5 py-1 text-[13px] font-semibold tabular-nums">{fmtT(temp)}°C</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Hero({ slides, facts, cta, secondary, ctaHref, catalogHref }: { slides: HeroSlide[]; facts: Fact[]; cta: string; secondary: string; ctaHref: string; catalogHref: string }) {
  const [i, setI] = useState(0)
  const n = slides.length
  useEffect(() => {
    if (n < 2) return
    const id = setTimeout(() => setI((x) => (x + 1) % n), 6000)
    return () => clearTimeout(id)
  }, [i, n])
  if (!n) return null
  const s = slides[i]
  const go = (d: number) => setI((x) => (x + d + n) % n)
  return (
    <section className="relative overflow-hidden" aria-roledescription="carousel">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="flex flex-col justify-center">
          <div className="grid" aria-live="polite">
            {slides.map((sl, k) => {
              const H = k === 0 ? 'h1' : 'h2'
              return (
                <div key={k} aria-hidden={k !== i}
                  className={`col-start-1 row-start-1 transition-all duration-700 motion-reduce:transition-none ${k === i ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}>
                  <H className="font-display text-[32px] font-semibold leading-[1.12] tracking-[-0.01em] sm:text-[44px] lg:text-[50px]">{sl.title}</H>
                  <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-steel">{sl.lead}</p>
                </div>
              )
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ctaHref} className="inline-flex h-12 items-center rounded-md bg-samo px-5 text-[15px] font-semibold text-white hover:bg-samo-dark">{cta}</Link>
            <Link href={catalogHref} className="inline-flex h-12 items-center rounded-md border border-ink/20 px-5 text-[15px] font-semibold hover:border-ink hover:bg-white">{secondary}</Link>
          </div>
          <dl className="mt-12 grid grid-cols-3 border-t border-line pt-6">
            {facts.map((f, k) => (
              <div key={k} className={k > 0 ? 'border-l border-line pl-4 sm:pl-6' : 'pr-4'}>
                <dt className="whitespace-nowrap font-display text-[22px] font-semibold leading-none sm:text-[28px]">{f.v}<span className="mt-2 block font-sans text-[14px] font-semibold leading-none sm:text-[15px]">{f.u}</span></dt>
                <dd className="mt-1 text-[13px] leading-snug text-steel sm:text-sm">{f.d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[380px] overflow-hidden rounded-xl bg-ink lg:min-h-[560px]">
          {slides.map((sl, k) => (
            <img key={k} src={sl.img} alt={k === i ? sl.cap : ''} aria-hidden={k !== i} loading={k === 0 ? 'eager' : 'lazy'} fetchPriority={k === 0 ? 'high' : 'auto'}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${k === i ? 'opacity-100' : 'opacity-0'}`} />
          ))}
          <Thermometer temp={s.temp} />
          <div className="absolute bottom-4 left-[102px] right-4 flex items-end justify-between gap-3 rounded-lg bg-white/95 p-4 text-sm shadow-sm">
            <div key={i} className="anim-fade min-w-0">
              <p className="font-semibold">{s.cap}</p>
              <p className="text-steel">{s.sub}</p>
            </div>
            {n > 1 && (
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => go(-1)} aria-label="Previous" className="grid h-9 w-9 place-items-center rounded-md border border-line hover:border-ink"><ChevronLeft size={18} /></button>
                <button onClick={() => go(1)} aria-label="Next" className="grid h-9 w-9 place-items-center rounded-md border border-line hover:border-ink"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
          {n > 1 && (
            <div className="absolute right-4 top-4 flex gap-1.5">
              {slides.map((_, k) => (
                <button key={k} onClick={() => setI(k)} aria-label={`${k + 1}`} aria-current={k === i} className="h-1.5 w-8 overflow-hidden rounded-full bg-white/40">
                  <span key={`${k}-${i}`} className={`block h-full bg-white ${k < i ? 'w-full' : k === i ? 'anim-progress w-0' : 'w-0'}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
