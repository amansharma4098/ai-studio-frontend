'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuthStore } from '@/store/authStore'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login')
  }, [])

  return (
    <div className="flex min-h-screen" style={{ background: '#f8fafc' }}>
      <Sidebar />
      <main className="pt-14 lg:ml-[240px] lg:pt-0 flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
