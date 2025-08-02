'use client'

import React from 'react';
import { 
  Users, 
  FileText, 
  FileCheck, 
  History, 
  PenTool, 
  Settings,
  Building2,
  Shield,
  Mic,
  CreditCard,
  BarChart,
  Video
} from 'lucide-react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Prescrições', href: '/', icon: FileText },
  { name: 'Prescrição por Voz', href: '/prescricoes/voice', icon: Mic },
  { name: 'Modelos', href: '/modelos', icon: FileCheck },
  { name: 'Histórico', href: '/historico', icon: History },
  { name: 'Assinaturas', href: '/assinaturas', icon: PenTool },
]

const settings = [
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
]

const adminNavigation = [
  { name: 'Clínicas', href: '/admin/clinicas', icon: Building2 },
  { name: 'Compliance', href: '/admin/compliance', icon: Shield },
  { name: 'Cobrança', href: '/admin/billing', icon: CreditCard },
  { name: 'SBIS', href: '/admin/sbis', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'EMR', href: '/admin/emr', icon: FileText },
  { name: 'Telemedicina', href: '/admin/telemedicine', icon: Video },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-24 bottom-0 w-64 bg-white shadow-sm border-r border-gray-100 z-40">
      <nav className="p-4 space-y-2 h-full overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-helena-blue text-white'
                  : 'text-helena-gray hover:bg-helena-light hover:text-helena-blue'
              }`}
            >
              <Icon 
                size={18} 
                className={`${
                  isActive ? 'text-white' : 'group-hover:text-helena-blue'
                }`} 
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
        
        <div className="pt-4 border-t border-gray-100">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer ${
                  isActive
                    ? 'bg-helena-blue text-white'
                    : 'text-helena-gray hover:bg-helena-light hover:text-helena-blue'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`${
                    isActive ? 'text-white' : 'group-hover:text-helena-blue'
                  }`} 
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
        
        <div className="pt-4 border-t border-gray-100">
          {settings.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors group cursor-pointer ${
                  isActive
                    ? 'bg-helena-blue text-white'
                    : 'text-helena-gray hover:bg-helena-light hover:text-helena-blue'
                }`}
              >
                <Icon 
                  size={18} 
                  className={`${
                    isActive ? 'text-white' : 'group-hover:text-helena-blue'
                  }`} 
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
