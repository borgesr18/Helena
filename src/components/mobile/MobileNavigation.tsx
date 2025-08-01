'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: 'fas fa-home' },
    { href: '/pacientes', label: 'Pacientes', icon: 'fas fa-users' },
    { href: '/prescricoes', label: 'Prescrições', icon: 'fas fa-prescription' },
    { href: '/prescricoes/contextual', label: 'IA Contextual', icon: 'fas fa-brain' },
    { href: '/modelos', label: 'Modelos', icon: 'fas fa-file-medical' },
    { href: '/historico', label: 'Histórico', icon: 'fas fa-history' },
    { href: '/configuracoes', label: 'Configurações', icon: 'fas fa-cog' },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleSignOut = async () => {
    const { signOut } = await import('@/lib/auth');
    await signOut();
    router.push('/login');
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden mobile-overlay"
          onClick={onClose}
        />
      )}
      
      {/* Mobile Sidebar */}
      <div className={`fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full safe-area-top safe-area-bottom">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-helena-blue rounded-lg flex items-center justify-center">
                <i className="fas fa-stethoscope text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Helena</h1>
                <span className="text-xs bg-helena-blue text-white px-2 py-1 rounded-full">IA</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 touch-target"
            >
              <i className="fas fa-times text-gray-600"></i>
            </button>
          </div>

          {/* User Info */}
          {profile && (
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-helena-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {(profile.nome || 'Dr').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {profile.nome || 'Dr. Usuário'}
                  </p>
                  <p className="text-xs text-helena-gray truncate">
                    CRM: {profile.crm || '00000-XX'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center space-x-4 px-4 py-4 rounded-lg transition-colors touch-target ${
                  pathname === item.href
                    ? 'bg-helena-blue text-white'
                    : 'text-helena-gray hover:bg-helena-light hover:text-helena-blue'
                }`}
              >
                <i className={`${item.icon} text-lg`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <button
              onClick={() => handleNavigation('/assinaturas')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-helena-gray hover:bg-helena-light hover:text-helena-blue transition-colors touch-target"
            >
              <i className="fas fa-signature text-lg"></i>
              <span className="font-medium">Assinaturas</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/admin/clinicas')}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-helena-gray hover:bg-helena-light hover:text-helena-blue transition-colors touch-target"
            >
              <i className="fas fa-building text-lg"></i>
              <span className="font-medium">Clínicas</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-4 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors touch-target"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
