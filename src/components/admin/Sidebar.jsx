import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Calendar, Users, Settings, BarChart3,
  Clock, Layers, LogOut, X, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/api/apiClient';
import { useLanguage } from '../LanguageContext';

export default function Sidebar({ institution, open, onClose }) {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, page: 'Dashboard' },
    { key: 'appointments', icon: Calendar, page: 'Appointments' },
    { key: 'queue', icon: Users, page: 'QueueManagement' },
    { key: 'services', icon: Layers, page: 'Services' },
    { key: 'schedule', icon: Clock, page: 'Schedule' },
    { key: 'analytics', icon: BarChart3, page: 'Analytics' },
    { key: 'settings', icon: Settings, page: 'AdminSettings' },
  ];

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-[#1e3a5f]">RDV.bi</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {institution && (
              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Institution</p>
                <p className="font-medium text-gray-900 truncate">{institution.name}</p>
              </div>
            )}

          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.page);
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isActive 
                      ? "bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

