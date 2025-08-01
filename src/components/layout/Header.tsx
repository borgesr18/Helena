'use client'

import React from 'react'
import { Stethoscope, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function Header() {
  const { profile } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-helena-blue rounded-lg flex items-center justify-center">
            <Stethoscope className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Helena</h1>
          <span className="text-xs bg-helena-blue text-white px-2 py-1 rounded-full">IA</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={handleSignOut}
              className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-4 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-helena-blue rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(profile?.nome || 'Dr').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-800">
                  {profile?.nome || 'Dr. Usuário'}
                </p>
                <p className="text-xs text-helena-gray">
                  CRM: {profile?.crm || '00000-XX'}
                </p>
              </div>
              <ChevronDown className="text-helena-gray" size={12} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
