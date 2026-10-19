'use client'
import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { telHref } from '@/lib/types'

type B = { city: string; addr: string; phones: string[]; map: string }

export function MapSection({ title, route, branches }: { title: string; route: string; branches: B[] }) {
  const [b, setB] = useState(0)
  if (!branches.length) return null
  const br = branches[b]
  const q = encodeURIComponent(br.map || br.addr)
  return (
    <section id="map" className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="font-display text-[22px] font-semibold sm:text-[28px]">{title}</h2>
        <div className="flex rounded-md border border-line bg-frost p-0.5 text-[14px] font-semibold" role="tablist">
          {branches.map((x, i) => (
            <button key={i} role="tab" aria-selected={b === i} onClick={() => setB(i)} className={`h-10 rounded-[5px] px-4 ${b === i ? 'bg-ink text-white' : 'text-steel hover:text-ink'}`}>{x.city}</button>
          ))}
        </div>
      </div>
      <div className="relative h-[420px] w-full bg-frost-2">
        <iframe key={b} title={br.city} src={`https://www.google.com/maps?q=${q}&z=16&output=embed`} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="pointer-events-none relative mx-auto h-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="pointer-events-auto absolute bottom-6 left-4 max-w-sm rounded-xl bg-white p-5 shadow-lg sm:left-6 lg:left-8">
            <p className="text-lg font-semibold">{br.city}</p>
            <p className="mt-1 text-steel">{br.addr}</p>
            <div className="mt-2 flex flex-col">{br.phones.map((p) => <a key={p} href={telHref(p)} className="font-semibold tabular-nums hover:text-samo">{p}</a>)}</div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-samo px-4 text-[14px] font-semibold text-white hover:bg-samo-dark"><Navigation size={16} />{route}</a>
          </div>
        </div>
      </div>
    </section>
  )
}
