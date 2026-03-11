import React, { useEffect } from 'react';
import { api } from '@/api/apiClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Calendar, Building2, Loader2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await api.auth.isAuthenticated();
      if (isAuth) {
        navigate(createPageUrl('Dashboard'));
      }
      setChecking(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = () => {
    api.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1e3a5f] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">RDV.bi</h1>
            <p className="text-gray-500 mt-2">Admin Dashboard</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#1e3a5f]" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Appointments</p>
                <p className="text-sm text-gray-500">View and manage all bookings</p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            className="w-full h-14 text-lg bg-[#1e3a5f] hover:bg-[#2d4a6f]"
          >
            Sign In to Dashboard
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Contact your administrator if you need access
          </p>
        </div>
      </div>
    </div>
  );
}

