import 'server-only'
import { put, list, head } from '@vercel/blob'
import { unstable_cache, revalidateTag } from 'next/cache'
import { seed } from './seed'
import type { Content, Lead } from './types'

/**
 * Storage: Vercel Blob in production. For local development and testing, setting
 * LOCAL_DATA_DIR stores the same files on disk instead.
 */
const LOCAL = !process.env.BLOB_READ_WRITE_TOKEN && process.env.LOCAL_DATA_DIR
const enabled = () => !!process.env.BLOB_READ_WRITE_TOKEN || !!LOCAL

type Backend = {
  getJson<T>(path: string): Promise<T | null>
  putJson(path: string, data: unknown, opts?: { unique?: boolean }): Promise<void>
  listJson<T>(prefix: string): Promise<T[]>
  putFile(path: string, data: ArrayBuffer, contentType: string): Promise<string>
}

const blobBackend: Backend = {
  async getJson<T>(path: string) {
    try {
      const meta = await head(path)
      const res = await fetch(`${meta.url}?v=${new Date(meta.uploadedAt).getTime()}`, { cache: 'no-store' })
      return res.ok ? ((await res.json()) as T) : null
    } catch { return null }
  },
  async putJson(path, data, opts) {
    await put(path, JSON.stringify(data), {
      access: 'public', contentType: 'application/json', cacheControlMaxAge: 60,
      ...(opts?.unique ? { addRandomSuffix: true } : { addRandomSuffix: false, allowOverwrite: true }),
    })
  },
  async listJson<T>(prefix: string) {
    const out: T[] = []
    let cursor: string | undefined
    do {
      const page = await list({ prefix, cursor, limit: 1000 })
      const items = await Promise.all(page.blobs.map(async (b) => {
        const r = await fetch(`${b.url}?v=${new Date(b.uploadedAt).getTime()}`, { cache: 'no-store' }).catch(() => null)
        return r?.ok ? ((await r.json()) as T) : null
      }))
      items.forEach((x) => x && out.push(x))
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)
    return out
  },
  async putFile(path, data, contentType) {
    return (await put(path, data, { access: 'public', addRandomSuffix: true, contentType })).url
  },
}

const localBackend: Backend = {
  async getJson<T>(path: string) {
    const fs = await import('node:fs/promises')
    try { return JSON.parse(await fs.readFile(`${LOCAL}/${path}`, 'utf8')) as T } catch { return null }
  },
  async putJson(path, data, opts) {
    const fs = await import('node:fs/promises')
    const p = opts?.unique ? path.replace(/\.json$/, `-${Date.now()}.json`) : path
    await fs.mkdir(`${LOCAL}/${p.split('/').slice(0, -1).join('/')}`, { recursive: true })
    await fs.writeFile(`${LOCAL}/${p}`, JSON.stringify(data))
  },
  async listJson<T>(prefix: string) {
    const fs = await import('node:fs/promises')
    const dir = `${LOCAL}/${prefix}`
    const files = await fs.readdir(dir).catch(() => [] as string[])
    return Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(`${dir}/${f}`, 'utf8')) as T))
  },
  async putFile(_path, data, contentType) {
    // Local mode: inline as a data URL so no static file server is needed.
    return `data:${contentType};base64,${Buffer.from(data).toString('base64')}`
  },
}

const db: Backend = LOCAL ? localBackend : blobBackend

/* ---------------- Content ---------------- */
const CONTENT = 'content.json'

/** Fill any keys newer code expects but older saved content lacks. */
function withDefaults(c: Partial<Content>): Content {
  return {
    ...seed, ...c,
    settings: { ...seed.settings, ...(c.settings || {}) },
    seo: { ...seed.seo, ...(c.seo || {}) },
    texts: { ...seed.texts, ...(c.texts || {}) },
  } as Content
}

async function loadContent(): Promise<Content> {
  if (!enabled()) return seed
  const c = await db.getJson<Content>(CONTENT)
  return c ? withDefaults(c) : seed
}

export const getContent = unstable_cache(loadContent, ['site-content'], { tags: ['content'], revalidate: 3600 })

/** Uncached read for the admin panel; creates the stored copy on first use. */
export async function getContentFresh(): Promise<Content> {
  if (!enabled()) return seed
  const c = await db.getJson<Content>(CONTENT)
  if (c) return withDefaults(c)
  const initial = await initialContent()
  await saveContent(initial)
  return initial
}

/** First run: copy client logos from the old site so they survive the domain switch. */
async function initialContent(): Promise<Content> {
  const c: Content = JSON.parse(JSON.stringify(seed))
  if (LOCAL) return c
  await Promise.all(c.clients.map(async (cl) => {
    try {
      const res = await fetch(`https://samobitzer.uz/${cl.id}.png`, { cache: 'no-store' })
      if (res.ok) cl.logo = await db.putFile(`media/clients/${cl.id}.png`, await res.arrayBuffer(), 'image/png')
    } catch { /* keep default path */ }
  }))
  return c
}

export async function saveContent(c: Content) {
  if (!enabled()) throw new Error('Storage is not configured (BLOB_READ_WRITE_TOKEN)')
  await db.putJson(CONTENT, c)
  // Keep a dated backup of every save so mistakes can be undone.
  await db.putJson(`backups/content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`, c, { unique: true })
  revalidateTag('content')
}

export async function uploadMedia(name: string, data: ArrayBuffer, contentType: string) {
  const safe = name.toLowerCase().replace(/[^a-z0-9.\-]+/g, '-').slice(-60) || 'image'
  return db.putFile(`media/${safe}`, data, contentType)
}

/* ---------------- Leads ---------------- */
const leadPath = (id: string) => `leads/${id}.json`

export async function saveLead(lead: Lead) {
  if (!enabled()) return
  await db.putJson(leadPath(lead.id), lead)
}

export async function listLeads(): Promise<Lead[]> {
  if (!enabled()) return []
  return (await db.listJson<Lead>('leads/')).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function updateLead(id: string, patch: Partial<Pick<Lead, 'status' | 'note'>>) {
  const lead = await db.getJson<Lead>(leadPath(id))
  if (!lead) throw new Error('not found')
  const next = { ...lead, ...patch }
  await saveLead(next)
  return next
}
