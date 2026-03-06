import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Admin | Claraboia',
    template: '%s | Admin Claraboia',
  },
  robots: 'noindex, nofollow',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-moss/5">
      {children}
    </div>
  )
}
