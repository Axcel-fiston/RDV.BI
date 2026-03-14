import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, ClipboardList, LogOut, Menu, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/api/apiClient';

const navItems = [
  { label: 'Applications', path: '/InstitutionApplications', icon: ClipboardList },
];

export default function PlatformAdminLayout({ children, user }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    api.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">RDV.bi</p>
                  <p className="text-xs text-slate-500">Platform Admin</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Signed in as</p>
              <p className="font-medium text-slate-900">{user?.fullName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition-all hover:bg-slate-50"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500">Platform administrator</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-medium text-white">
                {user?.fullName?.charAt(0) || 'P'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
