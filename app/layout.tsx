import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Tsundoku · 積ん読',
  description: 'Track every book you own but haven't read yet — and the ones you have.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="border-t border-border mt-24 py-8 text-center text-faint text-xs font-body tracking-widest uppercase">
          積ん読 · Tsundoku · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  )
}
