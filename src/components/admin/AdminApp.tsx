'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard, Inbox, Package, Layers, Images, Thermometer, FolderKanban, Users, Handshake, Type, Settings, ExternalLink,
  Phone, Send, X, Check, LogOut, ChevronRight, Plus, Mail, Loader2, AlertTriangle, Menu, RefreshCw,
} from 'lucide-react'
import { tr, telHref, type Content, type L3, type Lead, type LeadStatus } from '@/lib/types'
import { Btn, Field, LangField, PageHead, input } from './ui'
import { ListEditor } from './ListEditor'

type Page = 'dash' | 'leads' | 'products' | 'categories' | 'slides' | 'temp' | 'projects' | 'team' | 'clients' | 'texts' | 'settings'

const statusMeta: Record<LeadStatus, { label: string; cls: string }> = {
  new: { label: 'Yangi', cls: 'bg-samo/10 text-samo' },
  progress: { label: 'Jarayonda', cls: 'bg-amber-100 text-amber-800' },
  done: { label: 'Yopildi', cls: 'bg-emerald-100 text-emerald-800' },
}
const when = (iso: string) => new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const uz = (v: L3) => tr(v, 'uz')

/** Admin labels for every site text, grouped the way they appear on the page. */
const TEXT_GROUPS: { name: string; keys: [string, string][] }[] = [
  { name: 'Menyu va tugmalar', keys: [['nav.catalog', 'Menyu: Katalog'], ['nav.services', 'Menyu: Xizmatlar'], ['nav.projects', 'Menyu: Loyihalar'], ['nav.about', 'Menyu: Kompaniya'], ['nav.contacts', 'Menyu: Kontaktlar'], ['cta', 'Asosiy tugma (Narx so‘rash)'], ['call', 'Telefonda: Qo‘ng‘iroq tugmasi'], ['more', '“Batafsil” tugmasi'], ['heroSecondary', 'Bosh blok: ikkinchi tugma']] },
  { name: 'Harorat bo‘limi', keys: [['tempTitle', 'Sarlavha'], ['tempLead', 'Matn']] },
  { name: 'Katalog', keys: [['catalogTitle', 'Sarlavha'], ['catalogLead', 'Matn'], ['allCatalog', '“Butun katalog” havolasi'], ['notFoundTitle', 'Qizil kartochka: sarlavha'], ['notFoundLead', 'Qizil kartochka: matn'], ['productsTitle', 'Kategoriya sahifasi: “Mahsulotlar”'], ['requestThis', 'Mahsulot ostidagi tugma'], ['backToCatalog', '“Katalogga qaytish”'], ['emptyCategory', 'Bo‘sh kategoriya matni']] },
  { name: 'Ish jarayoni, Nega SAMO, Loyihalar', keys: [['processTitle', 'Ish jarayoni sarlavhasi'], ['whyTitle', '“Nega aynan SAMO” sarlavhasi'], ['warranty', 'Kafolat matni'], ['projectsTitle', 'Loyihalar sarlavhasi'], ['brandsTitle', 'Brendlar sarlavhasi'], ['clientsTitle', 'Mijozlar sarlavhasi']] },
  { name: 'Ariza formasi', keys: [['formTitle', 'Sarlavha'], ['formLead', 'Matn'], ['formName', 'Ism maydoni'], ['formPhone', 'Telefon maydoni'], ['formProduct', '“Nima kerak?” maydoni'], ['formMessage', 'Xabar maydoni'], ['formSend', 'Yuborish tugmasi'], ['formSent', 'Yuborilgandan keyingi matn'], ['formError', 'Xatolik matni'], ['branchesTitle', '“Filiallar” sarlavhasi']] },
  { name: 'Jamoa, xarita, pastki qism', keys: [['teamTitle', 'Jamoa sarlavhasi'], ['teamLead', 'Jamoa matni'], ['mapTitle', 'Xarita sarlavhasi'], ['mapRoute', '“Yo‘nalish olish” tugmasi'], ['rights', '“Barcha huquqlar himoyalangan”']] },
]

/* ------------------------------------------------------------------ */
function Dashboard({ c, leads, go }: { c: Content; leads: Lead[]; go: (p: Page) => void }) {
  const week = Date.now() - 7 * 864e5
  const stats = [
    { label: 'Yangi arizalar', v: leads.filter((l) => l.status === 'new').length, page: 'leads' as Page, accent: true },
    { label: 'Oxirgi 7 kun', v: leads.filter((l) => +new Date(l.createdAt) > week).length, page: 'leads' as Page },
    { label: 'Mahsulotlar', v: c.products.length, page: 'products' as Page },
    { label: 'Loyihalar', v: c.projects.length, page: 'projects' as Page },
  ]
  return (
    <>
      <PageHead title="Assalomu alaykum!" sub="Saytingizdagi so‘nggi holat." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <button key={s.label} onClick={() => go(s.page)} className="rounded-xl border border-line bg-white p-5 text-left hover:border-ink/30">
            <p className="text-[14px] text-steel">{s.label}</p>
            <p className={`mt-2 text-[34px] font-bold leading-none ${s.accent ? 'text-samo' : ''}`}>{s.v}</p>
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-semibold">So‘nggi arizalar</h2><button onClick={() => go('leads')} className="text-[14px] font-semibold text-samo">Hammasi</button></div>
          <ul className="divide-y divide-line">
            {leads.length === 0 && <li className="px-5 py-6 text-steel">Hozircha ariza yo‘q. Saytdagi forma orqali kelgan arizalar shu yerda chiqadi.</li>}
            {leads.slice(0, 5).map((l) => (
              <li key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1"><p className="font-semibold">{l.name} <span className="font-normal text-steel">· {l.phone}</span></p><p className="truncate text-[14px] text-steel">{l.product || '—'} {l.message && `— ${l.message}`}</p></div>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusMeta[l.status].cls}`}>{statusMeta[l.status].label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-semibold">Tezkor amallar</h2>
          <div className="mt-4 grid gap-2">
            {([['Mahsulot qo‘shish', 'products'], ['Loyiha qo‘shish', 'projects'], ['Xodim qo‘shish', 'team'], ['Bosh sahifa slaydlari', 'slides'], ['Telefon va manzillar', 'settings']] as [string, Page][]).map(([l, p]) => (
              <button key={l} onClick={() => go(p)} className="flex h-12 items-center justify-between rounded-lg bg-frost px-4 text-[15px] font-medium hover:bg-frost-2">
                <span className="inline-flex items-center gap-2"><Plus size={16} className="text-samo" />{l}</span><ChevronRight size={16} className="text-steel" />
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-line p-4 text-[14px]">
            <p className="inline-flex items-center gap-2 font-semibold"><Mail size={16} />Arizalar pochtaga keladi</p>
            <p className="mt-1 text-steel">Har bir yangi ariza <b className="text-ink">{c.settings.email}</b> manziliga ham yuboriladi.</p>
          </div>
        </section>
      </div>
    </>
  )
}

function Leads({ leads, setLeads, reload, email }: { leads: Lead[]; setLeads: (l: Lead[]) => void; reload: () => void; email: string }) {
  const [tab, setTab] = useState<'all' | LeadStatus>('all')
  const [open, setOpen] = useState<Lead | null>(null)
  const [note, setNote] = useState('')
  const list = leads.filter((l) => tab === 'all' || l.status === tab)
  async function patch(id: string, p: { status?: LeadStatus; note?: string }) {
    const res = await fetch('/api/admin/leads', { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, ...p }) })
    if (!res.ok) return
    const upd = (await res.json()) as Lead
    setLeads(leads.map((l) => (l.id === id ? upd : l)))
    setOpen((o) => (o && o.id === id ? upd : o))
  }
  return (
    <>
      <PageHead title="Arizalar" sub={`Saytdagi “Narx so‘rash” formasidan kelgan so‘rovlar. Har biri ${email} ga ham yuboriladi.`} action={<Btn variant="ghost" onClick={reload}><RefreshCw size={16} />Yangilash</Btn>} />
      <div className="mb-4 flex w-fit flex-wrap gap-1 rounded-lg bg-frost-2 p-1 text-[14px] font-semibold">
        {([['all', 'Hammasi'], ['new', 'Yangi'], ['progress', 'Jarayonda'], ['done', 'Yopildi']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`h-9 rounded-md px-4 ${tab === k ? 'bg-white shadow-sm' : 'text-steel'}`}>{l} <span className="ml-1 text-steel">{k === 'all' ? leads.length : leads.filter((x) => x.status === k).length}</span></button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead className="bg-frost text-[13px] text-steel"><tr><th className="px-5 py-3 font-semibold">Mijoz</th><th className="px-5 py-3 font-semibold">Nima kerak</th><th className="px-5 py-3 font-semibold">Vaqt</th><th className="px-5 py-3 font-semibold">Holat</th></tr></thead>
          <tbody className="divide-y divide-line">
            {list.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-steel">Bu bo‘limda ariza yo‘q.</td></tr>}
            {list.map((l) => (
              <tr key={l.id} onClick={() => { setOpen(l); setNote(l.note) }} className="cursor-pointer hover:bg-frost/60">
                <td className="px-5 py-3.5"><p className="font-semibold">{l.name}</p><p className="tabular-nums text-steel">{l.phone}</p></td>
                <td className="px-5 py-3.5"><p className="font-medium">{l.product || '—'}</p><p className="max-w-[340px] truncate text-steel">{l.message}</p></td>
                <td className="whitespace-nowrap px-5 py-3.5 text-steel">{when(l.createdAt)}</td>
                <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusMeta[l.status].cls}`}>{statusMeta[l.status].label}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30" onMouseDown={() => setOpen(null)}>
          <div className="h-full w-full max-w-[480px] overflow-y-auto bg-white p-6 shadow-2xl" onMouseDown={(e) => e.stopPropagation()} role="dialog">
            <div className="flex items-start justify-between">
              <div><p className="text-[13px] text-steel">{when(open.createdAt)} · Sayt ({open.lang.toUpperCase()})</p><h2 className="mt-1 text-xl font-bold">{open.name}</h2></div>
              <button onClick={() => setOpen(null)} aria-label="Yopish" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-frost"><X size={20} /></button>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href={telHref(open.phone)} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-samo font-semibold text-white"><Phone size={16} />Qo‘ng‘iroq</a>
              <a href={`https://t.me/+${open.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-lg border border-line font-semibold"><Send size={16} />Telegram</a>
            </div>
            <dl className="mt-6 space-y-4 text-[15px]">
              <div><dt className="text-[13px] text-steel">Telefon</dt><dd className="font-semibold tabular-nums">{open.phone}</dd></div>
              <div><dt className="text-[13px] text-steel">Nima kerak</dt><dd className="font-semibold">{open.product || '—'}</dd></div>
              <div><dt className="text-[13px] text-steel">Xabar</dt><dd className="whitespace-pre-wrap rounded-lg bg-frost p-3">{open.message || '—'}</dd></div>
              <div><dt className="text-[13px] text-steel">Qaysi sahifadan</dt><dd>{open.page || '/'}</dd></div>
            </dl>
            <p className="mt-6 text-[13px] font-semibold">Holatini belgilang</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(statusMeta) as LeadStatus[]).map((s) => (
                <button key={s} onClick={() => patch(open.id, { status: s })} className={`h-10 rounded-lg border text-[14px] font-semibold ${open.status === s ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink/40'}`}>{statusMeta[s].label}</button>
              ))}
            </div>
            <div className="mt-6"><Field label="Izoh (faqat sizga ko‘rinadi)"><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={`${input} h-auto py-2.5`} placeholder="Masalan: ertaga obyektga borib o‘lchash" /></Field></div>
            <Btn className="mt-3" variant="ghost" onClick={() => patch(open.id, { note })}><Check size={16} />Izohni saqlash</Btn>
          </div>
        </div>
      )}
    </>
  )
}

function Accordion({ name, open, setOpen, children }: { name: string; open: string; setOpen: (v: string) => void; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white">
      <button onClick={() => setOpen(open === name ? '' : name)} className="flex w-full items-center justify-between px-5 py-4 text-left"><span className="font-semibold">{name}</span><ChevronRight size={18} className={`text-steel transition-transform ${open === name ? 'rotate-90' : ''}`} /></button>
      {open === name && <div className="space-y-5 border-t border-line p-5">{children}</div>}
    </section>
  )
}

function Texts({ c, save }: { c: Content; save: (n: Content) => Promise<boolean> }) {
  const [d, setD] = useState(c)
  const [open, setOpen] = useState('Menyu va tugmalar')
  const dirty = JSON.stringify(d) !== JSON.stringify(c)
  const setText = (k: string, v: L3) => setD({ ...d, texts: { ...d.texts, [k]: v } })
  return (
    <>
      <PageHead title="Sahifa matnlari" sub="Saytdagi sarlavha va yozuvlar. Har bir matn 3 tilda." action={<Btn disabled={!dirty} onClick={() => save(d)}><Check size={16} />Saqlash</Btn>} />
      <div className="space-y-3">
        <Accordion open={open} setOpen={setOpen} name="Google uchun (SEO)">
          <LangField label="Sayt sarlavhasi (brauzer va Google’da)" value={d.seo.title} onChange={(v) => setD({ ...d, seo: { ...d.seo, title: v } })} />
          <LangField label="Qisqa tavsif (Google natijalarida)" multiline value={d.seo.description} onChange={(v) => setD({ ...d, seo: { ...d.seo, description: v } })} />
        </Accordion>
        <Accordion open={open} setOpen={setOpen} name="Bosh blokdagi raqamlar">
          {d.facts.map((f, i) => (
            <div key={f.id} className="space-y-3 rounded-lg bg-frost p-4">
              <Field label={`Raqam ${i + 1}`}><input className={input} value={f.v} onChange={(e) => setD({ ...d, facts: d.facts.map((x) => (x.id === f.id ? { ...x, v: e.target.value } : x)) })} /></Field>
              <LangField label="Birligi" value={f.u} onChange={(v) => setD({ ...d, facts: d.facts.map((x) => (x.id === f.id ? { ...x, u: v } : x)) })} />
              <LangField label="Izoh" value={f.d} onChange={(v) => setD({ ...d, facts: d.facts.map((x) => (x.id === f.id ? { ...x, d: v } : x)) })} />
            </div>
          ))}
        </Accordion>
        <Accordion open={open} setOpen={setOpen} name="Ish jarayoni (bosqichlar)">
          {d.process.map((s, i) => (
            <div key={s.id} className="space-y-3 rounded-lg bg-frost p-4">
              <LangField label={`${i + 1}-bosqich nomi`} value={s.t} onChange={(v) => setD({ ...d, process: d.process.map((x) => (x.id === s.id ? { ...x, t: v } : x)) })} />
              <LangField label="Izoh" multiline value={s.d} onChange={(v) => setD({ ...d, process: d.process.map((x) => (x.id === s.id ? { ...x, d: v } : x)) })} />
            </div>
          ))}
        </Accordion>
        <Accordion open={open} setOpen={setOpen} name="“Nega aynan SAMO” punktlari">
          {d.why.map((s) => (
            <div key={s.id} className="space-y-3 rounded-lg bg-frost p-4">
              <LangField label="Sarlavha" value={s.t} onChange={(v) => setD({ ...d, why: d.why.map((x) => (x.id === s.id ? { ...x, t: v } : x)) })} />
              <LangField label="Matn" multiline value={s.d} onChange={(v) => setD({ ...d, why: d.why.map((x) => (x.id === s.id ? { ...x, d: v } : x)) })} />
            </div>
          ))}
        </Accordion>
        {TEXT_GROUPS.map((g) => (
          <Accordion key={g.name} open={open} setOpen={setOpen} name={g.name}>
            {g.keys.map(([k, label]) => <LangField key={k} label={label} value={d.texts[k] || { uz: '', ru: '', en: '' }} multiline={(d.texts[k]?.uz || '').length > 70} onChange={(v) => setText(k, v)} />)}
          </Accordion>
        ))}
      </div>
      {dirty && <SaveBar onSave={() => save(d)} onReset={() => setD(c)} />}
    </>
  )
}

function SettingsPage({ c, save }: { c: Content; save: (n: Content) => Promise<boolean> }) {
  const [d, setD] = useState(c.settings)
  useEffect(() => setD(c.settings), [c.settings])
  const dirty = JSON.stringify(d) !== JSON.stringify(c.settings)
  const f = (k: 'phone' | 'email' | 'telegram' | 'instagram', label: string, hint?: string) => (
    <Field label={label} hint={hint}><input className={input} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></Field>
  )
  return (
    <>
      <PageHead title="Kontaktlar va sozlamalar" sub="Bu yerdagi o‘zgarishlar saytning hamma joyida yangilanadi." action={<Btn disabled={!dirty} onClick={() => save({ ...c, settings: d })}><Check size={16} />Saqlash</Btn>} />
      <section className="space-y-4 rounded-xl border border-line bg-white p-5">
        <h2 className="font-semibold">Asosiy aloqa</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {f('phone', 'Asosiy telefon (saytning tepasida)')}
          {f('email', 'E-mail', 'Saytda ko‘rinadi va arizalar shu manzilga keladi')}
          {f('telegram', 'Telegram havolasi', 'Masalan: https://t.me/username')}
          {f('instagram', 'Instagram havolasi')}
        </div>
        <LangField label="Ish vaqti" value={d.hours} onChange={(v) => setD({ ...d, hours: v })} />
      </section>
      {dirty && <SaveBar onSave={() => save({ ...c, settings: d })} onReset={() => setD(c.settings)} />}
      <div className="mt-8">
        <ListEditor title="Filiallar" sub="Ariza formasi yonida va xaritada ko‘rinadi." addLabel="Filial qo‘shish"
          items={c.settings.branches} titleOf={(b) => uz(b.city)} metaOf={(b) => `${uz(b.addr)} · ${b.phones.join(', ')}`} imageKey="img"
          onSave={(branches) => save({ ...c, settings: { ...c.settings, branches } })}
          fields={[
            { key: 'city', label: 'Filial nomi', type: 'l3' },
            { key: 'addr', label: 'Manzil', type: 'l3' },
            { key: 'phones', label: 'Telefonlar', type: 'phones' },
            { key: 'map', label: 'Xaritada qidirish uchun manzil', type: 'text', hint: 'Google Maps’da qanday topilsa, shunday yozing' },
            { key: 'img', label: 'Rasm', type: 'image' },
          ]} />
      </div>
    </>
  )
}

function Clients({ c, save }: { c: Content; save: (n: Content) => Promise<boolean> }) {
  const [brands, setBrands] = useState(c.brands.join(', '))
  const dirty = brands !== c.brands.join(', ')
  return (
    <>
      <ListEditor title="Mijozlar" sub="“Bizga ishonch bildirganlar” bo‘limidagi logotiplar." addLabel="Mijoz qo‘shish"
        items={c.clients} titleOf={(x) => x.name} imageKey="logo" onSave={(clients) => save({ ...c, clients })}
        fields={[{ key: 'name', label: 'Kompaniya nomi', type: 'text' }, { key: 'logo', label: 'Logotip', type: 'image' }]} />
      <section className="mt-8 rounded-xl border border-line bg-white p-5">
        <h2 className="font-semibold">Brendlar</h2>
        <p className="mt-1 text-[14px] text-steel">“Biz ishlaydigan brendlar” qatori. Vergul bilan ajrating.</p>
        <div className="mt-3 flex gap-2"><input className={input} value={brands} onChange={(e) => setBrands(e.target.value)} />
          <Btn disabled={!dirty} onClick={() => save({ ...c, brands: brands.split(',').map((s) => s.trim()).filter(Boolean) })}><Check size={16} />Saqlash</Btn></div>
      </section>
    </>
  )
}

function SaveBar({ onSave, onReset }: { onSave: () => void; onReset: () => void }) {
  return (
    <div className="sticky bottom-4 z-30 mt-6 flex items-center justify-between gap-3 rounded-xl bg-ink px-5 py-3 text-white shadow-lg">
      <span className="text-[14px] font-medium">Saqlanmagan o‘zgarishlar bor</span>
      <div className="flex gap-2"><button onClick={onReset} className="h-9 rounded-lg px-3 text-[14px] font-semibold text-white/80 hover:text-white">Bekor qilish</button><Btn onClick={onSave}><Check size={16} />Saqlash</Btn></div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
export function AdminApp() {
  const [page, setPage] = useState<Page>('dash')
  const [c, setC] = useState<Content | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null)
  const [menu, setMenu] = useState(false)
  const [loadErr, setLoadErr] = useState('')

  const loadLeads = useCallback(() => { fetch('/api/admin/leads', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).then(setLeads).catch(() => {}) }, [])
  useEffect(() => {
    fetch('/api/admin/content', { cache: 'no-store' }).then(async (r) => {
      if (r.status === 401) { window.location.href = '/admin/login'; return }
      if (!r.ok) throw new Error()
      setC(await r.json())
    }).catch(() => setLoadErr('Ma’lumotlarni yuklab bo‘lmadi. Sahifani yangilang.'))
    loadLeads()
  }, [loadLeads])

  const flash = (ok: boolean, msg: string) => { setToast({ ok, msg }); setTimeout(() => setToast(null), 3000) }
  const save = useCallback(async (next: Content) => {
    const res = await fetch('/api/admin/content', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(next) }).catch(() => null)
    if (res?.ok) { setC(next); flash(true, 'Saqlandi — saytda yangilandi'); return true }
    if (res?.status === 401) { window.location.href = '/admin/login'; return false }
    flash(false, 'Saqlab bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.'); return false
  }, [])

  const catOptions = useMemo(() => (c ? c.categories.map((x) => ({ value: x.id, label: uz(x.name) })) : []), [c])
  const newCount = leads.filter((l) => l.status === 'new').length

  if (loadErr) return <div className="grid h-screen place-items-center p-6 text-center"><p className="inline-flex items-center gap-2 font-semibold"><AlertTriangle className="text-samo" />{loadErr}</p></div>
  if (!c) return <div className="grid h-screen place-items-center"><Loader2 className="animate-spin text-steel" /></div>

  const nav: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dash', label: 'Bosh panel', icon: LayoutDashboard },
    { id: 'leads', label: 'Arizalar', icon: Inbox, badge: newCount },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'categories', label: 'Kategoriyalar', icon: Layers },
    { id: 'slides', label: 'Bosh sahifa slaydlari', icon: Images },
    { id: 'temp', label: 'Harorat shkalasi', icon: Thermometer },
    { id: 'projects', label: 'Loyihalar', icon: FolderKanban },
    { id: 'team', label: 'Jamoa', icon: Users },
    { id: 'clients', label: 'Mijozlar va brendlar', icon: Handshake },
    { id: 'texts', label: 'Sahifa matnlari', icon: Type },
    { id: 'settings', label: 'Kontaktlar va filiallar', icon: Settings },
  ]
  const go = (p: Page) => { setPage(p); setMenu(false); window.scrollTo(0, 0) }

  return (
    <div className="flex min-h-screen">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[264px] flex-col border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center gap-3 border-b border-line px-5"><img src="/brand/logo-red.png" alt="SAMO" className="h-8 w-auto" /><span className="text-[13px] font-semibold text-steel">Boshqaruv paneli</span></div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {nav.map((n) => {
            const Icon = n.icon, active = page === n.id
            return (
              <button key={n.id} onClick={() => go(n.id)} className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-medium ${active ? 'bg-ink text-white' : 'text-steel hover:bg-frost hover:text-ink'}`}>
                <Icon size={18} /><span className="flex-1 text-left">{n.label}</span>
                {!!n.badge && <span className={`rounded-full px-2 text-[12px] font-bold ${active ? 'bg-white text-ink' : 'bg-samo text-white'}`}>{n.badge}</span>}
              </button>
            )
          })}
        </nav>
        <div className="border-t border-line p-3">
          <button onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login' }} className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] text-steel hover:bg-frost"><LogOut size={18} />Chiqish</button>
        </div>
      </aside>
      {menu && <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setMenu(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-4 sm:px-8">
          <button className="p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Menyu"><Menu /></button>
          <p className="hidden text-[14px] text-steel lg:block">samobitzer.uz</p>
          <a href="/uz" target="_blank" className="inline-flex items-center gap-1.5 text-[14px] font-semibold hover:text-samo">Saytni ko‘rish<ExternalLink size={14} /></a>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-[1120px]">
            {page === 'dash' && <Dashboard c={c} leads={leads} go={go} />}
            {page === 'leads' && <Leads leads={leads} setLeads={setLeads} reload={loadLeads} email={c.settings.email} />}
            {page === 'products' && (
              <ListEditor title="Mahsulotlar" sub="Katalogdagi mahsulotlar. Ko‘z belgisi bilan saytdan yashirish mumkin." addLabel="Yangi mahsulot" searchable
                filter={{ label: 'Kategoriya', key: 'cat', options: catOptions }}
                items={c.products} titleOf={(p) => uz(p.name)} metaOf={(p) => uz(c.categories.find((x) => x.id === p.cat)?.name || { uz: '—', ru: '', en: '' })} imageKey="img" visibleKey="visible"
                onSave={(products) => save({ ...c, products })}
                fields={[
                  { key: 'img', label: 'Rasm', type: 'image' },
                  { key: 'name', label: 'Nomi', type: 'l3' },
                  { key: 'cat', label: 'Kategoriya', type: 'select', options: catOptions },
                  { key: 'desc', label: 'Tavsif', type: 'l3long' },
                  { key: 'specs', label: 'Texnik xususiyatlar', type: 'specs' },
                  { key: 'visible', label: 'Saytda ko‘rinadi', type: 'bool' },
                ]} />
            )}
            {page === 'categories' && (
              <ListEditor title="Kategoriyalar" sub="Katalog bo‘limlari. Har biri saytda alohida sahifaga ega." addLabel="Kategoriya qo‘shish"
                items={c.categories} titleOf={(x) => uz(x.name)} metaOf={(x) => `${c.products.filter((p) => p.cat === x.id).length} ta mahsulot · /catalog/${x.slug}`} imageKey="img" visibleKey="visible"
                onSave={(categories) => save({ ...c, categories: categories.map((x) => ({ ...x, slug: x.slug || uz(x.name).toLowerCase().replace(/[‘’'`]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || x.id })) })}
                fields={[
                  { key: 'img', label: 'Rasm', type: 'image' },
                  { key: 'name', label: 'Nomi', type: 'l3' },
                  { key: 'spec', label: 'Qisqa izoh (kartochkada)', type: 'l3' },
                  { key: 'desc', label: 'To‘liq tavsif (kategoriya sahifasida)', type: 'l3long' },
                  { key: 'temp', label: 'Harorat oralig‘i', type: 'temp' },
                  { key: 'slug', label: 'Sahifa manzili (lotincha)', type: 'text', hint: 'Masalan: sovutish-kameralari. Bo‘sh qoldirsangiz, nomidan avtomatik yasaladi.' },
                  { key: 'visible', label: 'Saytda ko‘rinadi', type: 'bool' },
                ]} />
            )}
            {page === 'slides' && (
              <ListEditor title="Bosh sahifa slaydlari" sub="Saytning eng tepasida har 6 soniyada almashadigan rasm va matnlar." addLabel="Slayd qo‘shish"
                items={c.slides} titleOf={(x) => uz(x.title)} metaOf={(x) => `Termometr: ${x.temp}°C · ${uz(x.cap)}`} imageKey="img" onSave={(slides) => save({ ...c, slides })}
                fields={[
                  { key: 'img', label: 'Rasm', type: 'image' },
                  { key: 'title', label: 'Sarlavha', type: 'l3' },
                  { key: 'lead', label: 'Matn', type: 'l3long' },
                  { key: 'temp', label: 'Termometr ko‘rsatkichi, °C', type: 'number', hint: '−40 dan +30 gacha' },
                  { key: 'cap', label: 'Rasm ostidagi yozuv', type: 'l3' },
                  { key: 'sub', label: 'Rasm ostidagi kichik yozuv', type: 'l3' },
                ]} />
            )}
            {page === 'temp' && (
              <ListEditor title="Harorat shkalasi" sub="“Har bir harorat uchun yechim” bo‘limidagi nuqtalar." addLabel="Nuqta qo‘shish"
                items={c.tempStops} titleOf={(x) => `${x.t}°C — ${uz(x.label)}`} metaOf={(x) => uz(x.note)} imageKey="img" onSave={(tempStops) => save({ ...c, tempStops })}
                fields={[
                  { key: 't', label: 'Harorat, °C', type: 'number' },
                  { key: 'label', label: 'Nomi', type: 'l3' },
                  { key: 'note', label: 'Izoh', type: 'l3' },
                  { key: 'cat', label: '“Batafsil” qaysi kategoriyaga olib boradi', type: 'select', options: catOptions },
                  { key: 'img', label: 'Rasm', type: 'image' },
                ]} />
            )}
            {page === 'projects' && (
              <ListEditor title="Loyihalar" sub="“Bajarilgan loyihalar” bo‘limi." addLabel="Loyiha qo‘shish"
                items={c.projects} titleOf={(x) => uz(x.name)} metaOf={(x) => uz(x.place)} imageKey="img" onSave={(projects) => save({ ...c, projects })}
                fields={[
                  { key: 'img', label: 'Asosiy rasm', type: 'image' },
                  { key: 'img2', label: 'Ikkinchi rasm', type: 'image' },
                  { key: 'name', label: 'Obyekt nomi', type: 'l3' },
                  { key: 'system', label: 'Qanday tizim o‘rnatilgan', type: 'l3' },
                  { key: 'place', label: 'Manzil', type: 'l3' },
                ]} />
            )}
            {page === 'team' && (
              <ListEditor title="Jamoa" sub="“Bizning jamoa” bo‘limi. Rasmlar saytda dumaloq ko‘rinadi." addLabel="Xodim qo‘shish" round
                items={c.team} titleOf={(x) => x.name} metaOf={(x) => uz(x.role)} imageKey="photo" onSave={(team) => save({ ...c, team })}
                fields={[
                  { key: 'photo', label: 'Rasm', type: 'imageRound' },
                  { key: 'name', label: 'Ism-familiya', type: 'text' },
                  { key: 'role', label: 'Lavozimi', type: 'l3' },
                  { key: 'phone', label: 'Telefon (ixtiyoriy)', type: 'text', hint: 'Bo‘sh qoldirsangiz, saytda ko‘rinmaydi', placeholder: '+998 __ ___ __ __' },
                ]} />
            )}
            {page === 'clients' && <Clients c={c} save={save} />}
            {page === 'texts' && <Texts c={c} save={save} />}
            {page === 'settings' && <SettingsPage c={c} save={save} />}
          </div>
        </main>
      </div>
      {toast && (
        <div role="status" className={`fixed bottom-6 left-1/2 z-[60] inline-flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-3 text-[14px] font-semibold text-white shadow-lg ${toast.ok ? 'bg-ink' : 'bg-samo'}`}>
          {toast.ok ? <Check size={16} className="text-emerald-400" /> : <AlertTriangle size={16} />}{toast.msg}
        </div>
      )}
    </div>
  )
}
