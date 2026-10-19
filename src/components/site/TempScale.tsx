'use client'
import { useState } from 'react'
import Link from 'next/link'
import { fmtT } from '@/lib/types'

export type Stop = { t: number; label: string; note: string; img: string; href: string }

export function TempScale({ title, lead, stops, cta, more, ctaHref }: { title: string; lead: string; stops: Stop[]; cta: string; more: string; ctaHref: string }) {
  const sorted = [...stops].sort((a, b) => a.t - b.t)
  const [sel, setSel] = useState(Math.min(1, sorted.length - 1))
  if (!sorted.length) return null
  const min = -40, max = 30
  const pos = (v: number) => ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 100
  // Spread labels over three rows so neighbours never overlap.
  const row = (k: number) => [2, 1, 2, 0, 1, 0][k % 6]
  const s = sorted[sel]
  return (
    <section className="border-y border-line bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-[28px] font-semibold leading-tight sm:text-[36px]">{title}</h2>
          <p className="mt-3 text-[17px] text-steel">{lead}</p>
        </div>
        <div className="-mx-4 mt-14 overflow-x-auto px-4 pb-2 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="relative mx-12 min-w-[680px] pt-[100px] lg:min-w-0">
            {sorted.map((st, k) => (
              <button key={k} onClick={() => setSel(k)} aria-pressed={sel === k}
                className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: `${pos(st.t)}%`, top: row(k) * 30 }}>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-[13px] font-semibold transition-colors ${sel === k ? 'bg-samo text-white' : 'bg-frost-2 text-ink hover:bg-ice/50'}`}>{st.label}</span>
              </button>
            ))}
            <div className="temp-band relative h-3 rounded-full">
              {sorted.map((st, k) => (
                <span key={k} className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white transition-transform ${sel === k ? 'scale-125 bg-samo' : 'bg-ink'}`} style={{ left: `${pos(st.t)}%` }} />
              ))}
            </div>
            <div className="relative mt-3 h-5 text-[12px] tabular-nums text-steel">
              {[-40, -30, -20, -10, 0, 10, 20, 30].map((v) => <span key={v} className="absolute -translate-x-1/2" style={{ left: `${pos(v)}%` }}>{fmtT(v)}°</span>)}
            </div>
          </div>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-xl border border-line bg-frost md:grid-cols-[1.2fr_1fr]">
          <img src={s.img} alt={s.label} loading="lazy" className="h-64 w-full object-cover md:h-full md:min-h-[300px]" />
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="font-display text-[40px] font-semibold tabular-nums text-samo">{fmtT(s.t)}°C</p>
            <h3 className="mt-2 text-2xl font-semibold">{s.label}</h3>
            <p className="mt-2 text-steel">{s.note}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={ctaHref} className="inline-flex h-12 items-center rounded-md bg-samo px-5 text-[15px] font-semibold text-white hover:bg-samo-dark">{cta}</Link>
              <Link href={s.href} className="inline-flex h-12 items-center rounded-md border border-ink/20 px-5 text-[15px] font-semibold hover:border-ink hover:bg-white">{more}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
