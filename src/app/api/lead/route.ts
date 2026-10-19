import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { getContent, saveLead } from '@/lib/store'
import { sendLeadEmail, sendLeadTelegram } from '@/lib/notify'
import { isLang } from '@/lib/i18n'
import type { Lead } from '@/lib/types'

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '')

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }

  // Honeypot: bots fill the hidden "website" field.
  if (clip(body.website, 200)) return NextResponse.json({ ok: true })

  const name = clip(body.name, 80)
  const phone = clip(body.phone, 30)
  if (!name || phone.replace(/\D/g, '').length < 7) return NextResponse.json({ error: 'name and phone required' }, { status: 422 })

  const lang = clip(body.lang, 2)
  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name, phone,
    product: clip(body.product, 120),
    message: clip(body.message, 2000),
    lang: isLang(lang) ? lang : 'uz',
    page: clip(body.page, 200),
    status: 'new',
    note: '',
  }

  try {
    await saveLead(lead)
  } catch (e) {
    console.error('saveLead failed', e)
  }

  // Notifications run after the response so the visitor is not kept waiting.
  after(async () => {
    const c = await getContent()
    const to = process.env.LEAD_EMAIL_TO || c.settings.email
    await Promise.allSettled([
      sendLeadEmail(lead, to).catch((e) => console.error('email failed', e)),
      sendLeadTelegram(lead).catch((e) => console.error('telegram failed', e)),
    ])
  })

  return NextResponse.json({ ok: true })
}
