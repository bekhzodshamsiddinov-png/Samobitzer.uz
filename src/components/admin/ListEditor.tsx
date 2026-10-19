'use client'
import { useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Search } from 'lucide-react'
import { LANGS, src, type L3, type Spec } from '@/lib/types'
import { Btn, Drawer, Field, ImageField, LangField, PageHead, SpecsField, Toggle, input } from './ui'

export type FieldDef =
  | { key: string; label: string; type: 'l3' | 'l3long'; hint?: string }
  | { key: string; label: string; type: 'text' | 'number'; hint?: string; placeholder?: string }
  | { key: string; label: string; type: 'image' | 'imageRound'; hint?: string }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; hint?: string }
  | { key: string; label: string; type: 'phones' | 'specs' | 'temp' | 'bool'; hint?: string }

type Item = Record<string, unknown> & { id: string }

const emptyL3: L3 = { uz: '', ru: '', en: '' }

function blankFor(fields: FieldDef[]): Item {
  const o: Item = { id: `x${Date.now().toString(36)}` }
  for (const f of fields) {
    o[f.key] = f.type === 'l3' || f.type === 'l3long' ? { ...emptyL3 } : f.type === 'phones' || f.type === 'specs' ? [] : f.type === 'bool' ? true : f.type === 'number' ? 0 : f.type === 'temp' ? null : f.type === 'select' ? f.options[0]?.value ?? '' : ''
  }
  return o
}

function missingLangs(item: Item, fields: FieldDef[]) {
  return LANGS.filter((l) => fields.some((f) => (f.type === 'l3' || f.type === 'l3long') && !(item[f.key] as L3 | undefined)?.[l]?.trim()))
}

export function ListEditor<T extends Item>({
  title, sub, addLabel, items, fields, onSave, titleOf, metaOf, imageKey, round, visibleKey, filter, searchable,
}: {
  title: string; sub: string; addLabel: string; items: T[]; fields: FieldDef[]
  onSave: (items: T[]) => Promise<boolean>
  titleOf: (i: T) => string; metaOf?: (i: T) => string; imageKey?: string; round?: boolean; visibleKey?: string
  filter?: { label: string; key: string; options: { value: string; label: string }[] }; searchable?: boolean
}) {
  const [edit, setEdit] = useState<{ item: T; isNew: boolean } | null>(null)
  const [q, setQ] = useState('')
  const [fv, setFv] = useState('')
  const list = items.filter((i) => (!fv || !filter || i[filter.key] === fv) && (!q || titleOf(i).toLowerCase().includes(q.toLowerCase())))

  const persist = async (next: T[]) => onSave(next)
  const move = (id: string, d: number) => {
    const idx = items.findIndex((x) => x.id === id), j = idx + d
    if (j < 0 || j >= items.length) return
    const next = [...items];[next[idx], next[j]] = [next[j], next[idx]]
    persist(next)
  }
  const done = async () => {
    if (!edit) return
    const next = edit.isNew ? [...items, edit.item] : items.map((x) => (x.id === edit.item.id ? edit.item : x))
    if (await persist(next)) setEdit(null)
  }
  const remove = async () => {
    if (!edit || edit.isNew) { setEdit(null); return }
    if (!window.confirm('Rostdan ham o‘chirilsinmi?')) return
    if (await persist(items.filter((x) => x.id !== edit.item.id))) setEdit(null)
  }
  const set = (k: string, v: unknown) => setEdit((e) => (e ? { ...e, item: { ...e.item, [k]: v } } : e))

  return (
    <>
      <PageHead title={title} sub={sub} action={<Btn onClick={() => setEdit({ item: { ...blankFor(fields), ...(filter && fv ? { [filter.key]: fv } : {}) } as T, isNew: true })}><Plus size={16} />{addLabel}</Btn>} />
      {(searchable || filter) && (
        <div className="mb-4 flex flex-wrap gap-3">
          {searchable && (
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" size={18} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nomi bo‘yicha qidirish" className={`${input} pl-10`} />
            </div>
          )}
          {filter && (
            <select value={fv} onChange={(e) => setFv(e.target.value)} className={`${input} w-auto min-w-[240px]`} aria-label={filter.label}>
              <option value="">{filter.label}: hammasi</option>
              {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
      )}
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
        {list.length === 0 && <li className="p-6 text-steel">Hozircha bo‘sh. “{addLabel}” tugmasini bosing.</li>}
        {list.map((it) => {
          const miss = missingLangs(it, fields)
          const visible = visibleKey ? (it[visibleKey] as boolean) : true
          return (
            <li key={it.id} className={`flex items-center gap-3 px-3 py-2.5 hover:bg-frost/60 sm:gap-4 sm:px-4 ${visible ? '' : 'opacity-60'}`}>
              <div className="flex flex-col">
                <button onClick={() => move(it.id, -1)} aria-label="Yuqoriga" className="grid h-6 w-6 place-items-center rounded text-steel hover:bg-frost-2"><ArrowUp size={14} /></button>
                <button onClick={() => move(it.id, 1)} aria-label="Pastga" className="grid h-6 w-6 place-items-center rounded text-steel hover:bg-frost-2"><ArrowDown size={14} /></button>
              </div>
              {imageKey && (
                <div className={`h-14 w-14 shrink-0 overflow-hidden border border-line bg-frost-2 ${round ? 'rounded-full' : 'rounded-lg'}`}>
                  {(it[imageKey] as string) && <img src={src(it[imageKey] as string)} alt="" className={`h-full w-full ${round ? 'object-cover object-top' : 'object-cover'}`} />}
                </div>
              )}
              <button onClick={() => setEdit({ item: structuredClone(it), isNew: false })} className="min-w-0 flex-1 text-left">
                <p className="truncate font-semibold">{titleOf(it) || '(nomsiz)'}</p>
                {metaOf && <p className="truncate text-[14px] text-steel">{metaOf(it)}</p>}
              </button>
              {miss.length > 0 && <span className="hidden rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold uppercase text-amber-700 sm:inline" title="Tarjima to‘ldirilmagan">{miss.join(' ')}</span>}
              {visibleKey && (
                <button onClick={() => persist(items.map((x) => (x.id === it.id ? { ...x, [visibleKey]: !visible } : x)))} aria-label={visible ? 'Saytdan yashirish' : 'Saytda ko‘rsatish'} title={visible ? 'Saytda ko‘rinadi' : 'Yashirilgan'}
                  className="grid h-9 w-9 place-items-center rounded-lg text-steel hover:bg-frost-2">{visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              )}
              <button onClick={() => setEdit({ item: structuredClone(it), isNew: false })} aria-label="Tahrirlash" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-frost-2"><Pencil size={16} /></button>
            </li>
          )
        })}
      </ul>
      {edit && (
        <Drawer title={edit.isNew ? addLabel : 'Tahrirlash'} onClose={() => setEdit(null)} onDone={done} onDelete={edit.isNew ? undefined : remove}>
          {fields.map((f) => {
            const v = edit.item[f.key]
            switch (f.type) {
              case 'l3': case 'l3long': return <div key={f.key}><LangField label={f.label} value={(v as L3) || emptyL3} multiline={f.type === 'l3long'} onChange={(x) => set(f.key, x)} />{f.hint && <p className="mt-1 text-[12px] text-steel">{f.hint}</p>}</div>
              case 'text': return <Field key={f.key} label={f.label} hint={f.hint}><input className={input} value={(v as string) || ''} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} /></Field>
              case 'number': return <Field key={f.key} label={f.label} hint={f.hint}><input type="number" className={input} value={Number(v) || 0} onChange={(e) => set(f.key, Number(e.target.value))} /></Field>
              case 'image': case 'imageRound': return <Field key={f.key} label={f.label} hint={f.hint}><ImageField value={(v as string) || ''} round={f.type === 'imageRound'} onChange={(u) => set(f.key, u)} /></Field>
              case 'select': return <Field key={f.key} label={f.label} hint={f.hint}><select className={input} value={(v as string) || ''} onChange={(e) => set(f.key, e.target.value)}>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></Field>
              case 'phones': return <Field key={f.key} label={f.label} hint={f.hint || 'Bir nechta raqamni vergul bilan ajrating'}><input className={input} value={((v as string[]) || []).join(', ')} onChange={(e) => set(f.key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} /></Field>
              case 'specs': return <SpecsField key={f.key} value={(v as Spec[]) || []} onChange={(x) => set(f.key, x)} />
              case 'bool': return <div key={f.key} className="rounded-lg bg-frost p-4"><Toggle on={!!v} onChange={(x) => set(f.key, x)} label={f.label} /></div>
              case 'temp': {
                const t = (v as [number, number] | null) || null
                return (
                  <Field key={f.key} label={f.label} hint={f.hint || 'Bo‘sh qoldirsangiz, harorat belgisi ko‘rinmaydi'}>
                    <div className="flex items-center gap-2">
                      <input type="number" className={input} placeholder="dan, °C" value={t ? t[0] : ''} onChange={(e) => set(f.key, e.target.value === '' ? null : [Number(e.target.value), t ? t[1] : 0])} />
                      <span className="text-steel">…</span>
                      <input type="number" className={input} placeholder="gacha, °C" value={t ? t[1] : ''} onChange={(e) => set(f.key, e.target.value === '' && !t ? null : [t ? t[0] : 0, Number(e.target.value)])} />
                    </div>
                  </Field>
                )
              }
            }
          })}
        </Drawer>
      )}
    </>
  )
}
