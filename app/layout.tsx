import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: '積ん読 · Tsundoku',
  description: "记录每一本你拥有的书，以及每一本你读过的书。网文、轻小说、文学、漫画全收录。",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <Navbar />
        <main style={{ minHeight: '100vh' }}>{children}</main>
        <footer style={{ borderTop: '1px solid #252535', marginTop: 96, padding: '32px 0', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Noto Sans SC', fontSize: 11, color: '#3a3550', letterSpacing: '0.15em' }}>
            積ん読 · TSUNDOKU · {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  )
}
