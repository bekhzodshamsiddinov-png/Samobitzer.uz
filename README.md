# SAMO — samobitzer.uz

Website of SAMO Cold & Ventilation (UZ / RU / EN) with an admin panel.

- **Stack:** Next.js 15 (App Router), Tailwind CSS v4, Vercel Blob for content, images and leads.
- **Site:** `/uz`, `/ru`, `/en`, catalog pages at `/{lang}/catalog/{slug}`.
- **Admin:** `/admin` — password from `ADMIN_PASSWORD`.
- **Leads:** stored in Blob, emailed to `LEAD_EMAIL_TO` (default: settings e-mail) via SMTP, optional Telegram.

## Environment variables
See `.env.example`.

## Local development
```bash
npm install
LOCAL_DATA_DIR=.data ADMIN_PASSWORD=dev SESSION_SECRET=dev-secret npm run dev
```
