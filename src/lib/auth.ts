// Signed-cookie session for the single admin account. Uses Web Crypto so it also runs in middleware.
export const SESSION_COOKIE = 'samo_admin'
const MAX_AGE = 60 * 60 * 24 * 14 // 14 days

const enc = new TextEncoder()

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ''
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  return { value: `${exp}.${await hmac(String(exp))}`, maxAge: MAX_AGE }
}

export async function verifySession(value: string | undefined): Promise<boolean> {
  if (!value || !process.env.ADMIN_PASSWORD) return false
  const [exp, sig] = value.split('.')
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false
  return safeEqual(sig, await hmac(exp))
}

export async function checkPassword(pw: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD
  if (!real) return false
  // Compare digests so timing does not leak the password length.
  return safeEqual(await hmac(`pw:${pw}`), await hmac(`pw:${real}`))
}
