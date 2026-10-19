'use client'
import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'

export default function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setErr('')
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) }).catch(() => null)
    if (res?.ok) { window.location.href = '/admin'; return }
    setBusy(false)
    setErr(res?.status === 503 ? 'Admin parol hali o‘rnatilmagan (Vercel sozlamalarida ADMIN_PASSWORD).' : 'Parol noto‘g‘ri. Qayta urinib ko‘ring.')
  }
  return (
    <div className="grid min-h-screen place-items-center bg-frost p-4">
      <form onSubmit={submit} className="w-full max-w-[380px] rounded-2xl border border-line bg-white p-8 shadow-sm">
        <img src="/brand/logo-red.png" alt="SAMO" className="h-12 w-auto" />
        <h1 className="mt-6 text-2xl font-bold">Boshqaruv paneli</h1>
        <p className="mt-1 text-[15px] text-steel">Saytni tahrirlash uchun parolni kiriting.</p>
        <label htmlFor="pw" className="mt-6 block text-[13px] font-semibold">Parol</label>
        <div className="relative mt-1.5">
          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" />
          <input id="pw" type="password" autoFocus autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)}
            className="h-12 w-full rounded-lg border border-line pl-10 pr-3 text-[15px] focus:border-ink focus:outline-none" />
        </div>
        {err && <p className="mt-3 text-[14px] font-medium text-samo" role="alert">{err}</p>}
        <button disabled={busy || !pw} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-samo font-semibold text-white hover:bg-samo-dark disabled:opacity-50">
          {busy && <Loader2 size={18} className="animate-spin" />}Kirish
        </button>
      </form>
    </div>
  )
}
