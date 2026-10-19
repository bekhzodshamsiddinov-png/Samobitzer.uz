'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react'
import { LANGS, src, type L3, type Lang, type Spec } from '@/lib/types'

export const input = 'h-11 w-full rounded-lg border border-line bg-white px-3.5 text-[15px] focus:border-ink focus:outline-none'

export function Btn({ children, variant = 'primary', onClick, className = '', disabled, type = 'button' }: {
  children: React.ReactNode; variant?: 'primary' | 'ghost' | 'danger'; onClick?: () => void; className?: string; disabled?: boolean; type?: 'button' | 'submit'
}) {
  const v = variant === 'primary' ? 'bg-samo text-white hover:bg-samo-dark' : variant === 'danger' ? 'text-samo hover:bg-samo/5' : 'border border-line bg-white text-ink hover:border-ink/40'
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold transition-colors disabled:opacity-50 ${v} ${className}`}>{children}</button>
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[12px] text-steel">{hint}</span>}
    </div>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className="inline-flex items-center gap-2.5">
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-line'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      {label && <span className="text-[14px] font-medium">{label}</span>}
    </button>
  )
}

const LANG_NAMES: Record<Lang, string> = { uz: 'O‘zbekcha', ru: 'Русский', en: 'English' }

/** Three-language text: tabs mark which translations are still empty. */
export function LangField({ label, value, onChange, multiline }: { label: string; value: L3; onChange: (v: L3) => void; multiline?: boolean }) {
  const [lang, setLang] = useState<Lang>('uz')
  const v = value || { uz: '', ru: '', en: '' }
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <span className="text-[13px] font-semibold">{label}</span>
        <div className="flex rounded-lg bg-frost-2 p-0.5 text-[12px] font-semibold">
          {LANGS.map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`flex h-7 items-center gap-1.5 rounded-md px-2.5 uppercase ${lang === l ? 'bg-white shadow-sm' : 'text-steel'}`}>
              {l}<span className={`h-1.5 w-1.5 rounded-full ${v[l]?.trim() ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5">
        {multiline
          ? <textarea rows={4} value={v[lang] || ''} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} placeholder={`${LANG_NAMES[lang]}…`} className={`${input} h-auto py-2.5`} />
          : <input value={v[lang] || ''} onChange={(e) => onChange({ ...v, [lang]: e.target.value })} placeholder={`${LANG_NAMES[lang]}…`} className={input} />}
      </div>
      {lang !== 'uz' && !v[lang]?.trim() && <p className="mt-1 text-[12px] text-amber-700">Bu tilda to‘ldirilmagan — saytda o‘zbekcha matn ko‘rinadi.</p>}
    </div>
  )
}

/** Shrink big photos in the browser before upload, keeping uploads fast and small. */
async function shrink(file: File, max = 1600): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.85))
  if (!blob || blob.size > file.size) return file
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' })
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', await shrink(file))
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  if (!res.ok) throw new Error('upload failed')
  return (await res.json()).url as string
}

export function ImageField({ value, onChange, round }: { value: string; onChange: (url: string) => void; round?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [over, setOver] = useState(false)
  async function handle(f?: File | null) {
    if (!f) return
    setBusy(true); setErr('')
    try { onChange(await uploadImage(f)) } catch { setErr('Rasm yuklanmadi. Boshqa rasm tanlab ko‘ring (4 MB gacha).') }
    setBusy(false)
  }
  return (
    <div className="flex items-center gap-4">
      <div className={`grid h-24 w-24 shrink-0 place-items-center overflow-hidden border border-line bg-frost-2 ${round ? 'rounded-full' : 'rounded-lg'}`}>
        {value ? <img src={src(value)} alt="" className={`h-full w-full ${round ? 'object-cover object-top' : 'object-contain'}`} /> : <ImagePlus className="text-steel/50" />}
      </div>
      <button type="button" onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files?.[0]) }}
        className={`flex-1 rounded-lg border-2 border-dashed p-4 text-center text-[13px] text-steel ${over ? 'border-samo bg-samo/5' : 'border-line hover:border-ink/40'}`}>
        {busy ? <Loader2 className="mx-auto animate-spin" size={20} /> : <ImagePlus className="mx-auto mb-1" size={20} />}
        {busy ? 'Yuklanmoqda…' : <>Rasmni shu yerga tashlang yoki <span className="font-semibold text-samo">kompyuterdan tanlang</span></>}
        <span className="block text-[12px]">JPG, PNG yoki WEBP — o‘lchami avtomatik kichraytiriladi</span>
        {err && <span className="mt-1 block font-semibold text-samo">{err}</span>}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  )
}

export function SpecsField({ value, onChange }: { value: Spec[]; onChange: (v: Spec[]) => void }) {
  const [lang, setLang] = useState<Lang>('uz')
  return (
    <div>
      <div className="flex items-end justify-between">
        <span className="text-[13px] font-semibold">Texnik xususiyatlar</span>
        <div className="flex rounded-lg bg-frost-2 p-0.5 text-[12px] font-semibold">
          {LANGS.map((l) => <button key={l} type="button" onClick={() => setLang(l)} className={`h-7 rounded-md px-2.5 uppercase ${lang === l ? 'bg-white shadow-sm' : 'text-steel'}`}>{l}</button>)}
        </div>
      </div>
      <div className="mt-1.5 space-y-2">
        {value.map((sp, i) => (
          <div key={i} className="flex gap-2">
            <input value={sp.k[lang]} placeholder={lang === 'uz' ? 'Nomi: Balandlik, sm' : lang === 'ru' ? 'Высота, см' : 'Height, cm'} className={input}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, k: { ...x.k, [lang]: e.target.value } } : x)))} />
            <input value={sp.v} placeholder="Qiymati: 200" className={input} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label="O‘chirish" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-steel hover:bg-frost"><Trash2 size={16} /></button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, { k: { uz: '', ru: '', en: '' }, v: '' }])} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-samo"><Plus size={16} />Qator qo‘shish</button>
      </div>
    </div>
  )
}

export function Drawer({ title, onClose, onDone, onDelete, children }: { title: string; onClose: () => void; onDone: () => void; onDelete?: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onMouseDown={onClose}>
      <div className="flex h-full w-full max-w-[580px] flex-col bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Yopish" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-frost"><X size={20} /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6">{children}</div>
        <div className="flex items-center justify-between gap-2 border-t border-line px-6 py-4">
          {onDelete ? <Btn variant="danger" onClick={onDelete} className="px-2"><Trash2 size={16} />O‘chirish</Btn> : <span />}
          <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Bekor qilish</Btn><Btn onClick={onDone}><Check size={16} />Saqlash</Btn></div>
        </div>
      </div>
    </div>
  )
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-[26px] font-bold tracking-tight">{title}</h1>{sub && <p className="mt-1 max-w-2xl text-[15px] text-steel">{sub}</p>}</div>
      {action}
    </div>
  )
}
