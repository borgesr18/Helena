'use client'

import React, { useEffect } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-helena-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-helena-blue rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-helena-gray">Carregando Helena...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="bg-helena-light min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-64 pt-30 p-12">
        {children}
      </main>
    </div>
  )
}
