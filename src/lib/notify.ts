import 'server-only'
import nodemailer from 'nodemailer'
import type { Lead } from './types'

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!)

function lines(lead: Lead) {
  return [
    ['Ism', lead.name],
    ['Telefon', lead.phone],
    ['Nima kerak', lead.product || '—'],
    ['Xabar', lead.message || '—'],
    ['Til', lead.lang.toUpperCase()],
    ['Sahifa', lead.page || '/'],
  ] as const
}

export async function sendLeadEmail(lead: Lead, to: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return { skipped: true }
  const port = Number(SMTP_PORT || 465)
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
  const rows = lines(lead).map(([k, v]) => `<tr><td style="padding:6px 12px;color:#4a5c6a">${k}</td><td style="padding:6px 12px;font-weight:600">${esc(v)}</td></tr>`).join('')
  await transport.sendMail({
    from: `"SAMO sayt" <${SMTP_USER}>`,
    to,
    subject: `Yangi ariza: ${lead.name} — ${lead.product || 'samobitzer.uz'}`,
    text: lines(lead).map(([k, v]) => `${k}: ${v}`).join('\n'),
    html: `<div style="font-family:Arial,sans-serif"><h2 style="color:#d0102c">Saytdan yangi ariza</h2><table>${rows}</table><p style="color:#4a5c6a">Barcha arizalar: samobitzer.uz/admin</p></div>`,
  })
  return { sent: true }
}

export async function sendLeadTelegram(lead: Lead) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return { skipped: true }
  const text = ['🆕 Saytdan yangi ariza', ...lines(lead).map(([k, v]) => `${k}: ${v}`)].join('\n')
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  })
  return { sent: true }
}
