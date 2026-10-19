'use client'
import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import type { Lang } from '@/lib/types'

type Labels = { name: string; phone: string; product: string; message: string; send: string; sent: string; error: string }

export function ContactForm({ lang, labels, products, initialProduct = '' }: { lang: Lang; labels: Labels; products: string[]; initialProduct?: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [product, setProduct] = useState(initialProduct)
  const [extra, setExtra] = useState<string[]>([])
  useEffect(() => {
    const on = (e: Event) => {
      const p = (e as CustomEvent<string>).detail
      setExtra((x) => (products.includes(p) || x.includes(p) ? x : [...x, p]))
      setProduct(p)
    }
    window.addEventListener('samo:product', on)
    return () => window.removeEventListener('samo:product', on)
  }, [products])
  const field = 'h-12 w-full rounded-md border border-line bg-white px-4 text-[15px] placeholder:text-steel/70 focus:border-ink focus:outline-none'

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setState('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(fd), lang, page: window.location.pathname }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return <p className="mt-8 flex items-center gap-3 rounded-lg bg-frost p-5 font-semibold" role="status"><Check className="text-samo" />{labels.sent}</p>

  return (
    <form className="mt-8 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="sr-only" htmlFor="lead-name">{labels.name}</label>
      <input id="lead-name" name="name" required maxLength={80} autoComplete="name" className={field} placeholder={labels.name} />
      <label className="sr-only" htmlFor="lead-phone">{labels.phone}</label>
      <input id="lead-phone" name="phone" required type="tel" minLength={7} maxLength={30} autoComplete="tel" className={field} placeholder="+998 __ ___ __ __" />
      <label className="sr-only" htmlFor="lead-product">{labels.product}</label>
      <select id="lead-product" name="product" className={`${field} sm:col-span-2`} value={product} onChange={(e) => setProduct(e.target.value)}>
        <option value="">{labels.product}</option>
        {[...products, ...extra].map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <label className="sr-only" htmlFor="lead-msg">{labels.message}</label>
      <textarea id="lead-msg" name="message" rows={4} maxLength={2000} className={`${field} h-auto py-3 sm:col-span-2`} placeholder={labels.message} />
      <button disabled={state === 'sending'} className="h-12 rounded-md bg-samo font-semibold text-white hover:bg-samo-dark disabled:opacity-60 sm:col-span-2">{state === 'sending' ? '…' : labels.send}</button>
      {state === 'error' && <p className="text-[15px] font-medium text-samo sm:col-span-2" role="alert">{labels.error}</p>}
    </form>
  )
}
