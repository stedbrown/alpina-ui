import type { ReactNode } from 'react'
import 'alpina-ui/styles.css'

export const metadata = { title: 'Billing preferences' }

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" data-al-theme="auto"><body>{children}</body></html>
}
