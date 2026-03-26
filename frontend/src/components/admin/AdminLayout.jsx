import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { createPageUrl } from '@/utils';
import { Menu, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/AuthContext';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoadingAuth, authError } = useAuth();

  const { data: institution } = useQuery({
    queryKey: ['myInstitution', user?.institutionId],
    queryFn: async () => {
      const publicInstitutions = await api.entities.Institution.list();
      const publicMatch = publicInstitutions.find((item) => item.id === user?.institutionId);
      if (publicMatch) return publicMatch;

      try {
        const pendingInstitutions = await api.entities.Institution.listPending();
        const pendingMatch = pendingInstitutions.find((item) => item.id === user?.institutionId);
        if (pendingMatch) return pendingMatch;
      } catch (error) {
        // Fall back to the JWT claims when the public lists are unavailable.
      }

      return user?.institutionId
        ? {
            id: user.institutionId,
            name: user.institutionName || 'Institution',
          }
        : null;
    },
    enabled: !!user?.institutionId
  });

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user || authError?.type === 'auth_required') {
      navigate(createPageUrl('AdminLogin'));
    }
  }, [authError?.type, isLoadingAuth, navigate, user]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  const content = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, { institution, user })
      : child
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f3ec] via-white to-[#eef4fb]">
      <Sidebar
        institution={institution}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/70 border-b border-white/30 px-4 py-3 backdrop-blur-xl shadow-[0_15px_40px_rgba(30,58,95,0.12)]">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-[#1e3a5f]" />
            </Button>

            <div className="flex-1 flex items-center justify-center text-center gap-2">
              <img src="/RDV_transparent.png" alt="RDV logo" className="h-8 w-auto" />
              <div>
                <p className="text-sm font-semibold text-[#1e3a5f]">{user?.fullName}</p>
                <p className="text-xs text-[#4b5563]">{copy.platformAdministrator}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a5f] to-[#2f4f78] rounded-full flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8 space-y-6">
          {content}
        </main>
      </div>
    </div>
  );
}

