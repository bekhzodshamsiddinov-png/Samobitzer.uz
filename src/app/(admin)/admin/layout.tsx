import type { Metadata } from 'next'
import '../../globals.css'

export const metadata: Metadata = { title: 'SAMO — Boshqaruv paneli', robots: { index: false, follow: false }, icons: { icon: '/brand/logo-red.png' } }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
