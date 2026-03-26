import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/components/LanguageContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const copy = lang === 'fr'
    ? {
        emailError: "Incluez le symbole @ dans l'adresse e-mail.",
        loginFailed: 'Échec de la connexion',
        premiumAccess: 'Accès Premium',
        heroTitle: "Heureux de vous revoir dans l'espace des opérations.",
        heroDesc: "Connectez-vous pour gérer les files, les rendez-vous, les validations d'institutions et les opérations du personnel depuis une seule interface.",
        protectedWorkspace: 'Espace Protégé',
        protectedDesc: "L'accès est limité au personnel, aux administrateurs et aux administrateurs plateforme via un routage basé sur les rôles après connexion.",
        adminPortal: 'Portail Admin',
        adminStaffLogin: 'Connexion Admin / Personnel',
        assignedCredentials: 'Utilisez les identifiants qui vous ont été attribués pour accéder au tableau de bord.',
        email: 'E-mail',
        password: 'Mot de passe',
        signIn: 'Se connecter',
        signingIn: 'Connexion...',
        logoHint: "Cliquez sur le logo ci-dessus à tout moment pour revenir à l'accueil.",
      }
    : {
        emailError: 'Include the @ in the email address.',
        loginFailed: 'Login failed',
        premiumAccess: 'Premium Access',
        heroTitle: 'Welcome back to the operations suite.',
        heroDesc: 'Sign in to manage queues, appointments, institution approvals, and staff operations from a single control surface.',
        protectedWorkspace: 'Protected Workspace',
        protectedDesc: 'Access is limited to staff, admins, and platform administrators with role-based routing after sign-in.',
        adminPortal: 'Admin Portal',
        adminStaffLogin: 'Admin / Staff Login',
        assignedCredentials: 'Use your assigned account credentials to enter the dashboard.',
        email: 'Email',
        password: 'Password',
        signIn: 'Sign in',
        signingIn: 'Signing in…',
        logoHint: 'Click the logo above any time to return to the home page.',
      };

  const triggerShake = () => {
    setIsShaking(false);
    window.requestAnimationFrame(() => {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 360);
    });
  };

  const validateEmailTransition = () => {
    if (email.trim() && !email.includes('@')) {
      setEmailError(copy.emailError);
      triggerShake();
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmailTransition()) {
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email, password);
      const next = location.state?.from || (user?.role === 'PLATFORM_ADMIN' ? '/InstitutionApplications' : '/Dashboard');
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message || copy.loginFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        background:
          'linear-gradient(135deg, #fef7f1 0%, #fffdf9 28%, #f6efe6 58%, #f4f7fb 100%)',
      }}
    >
      <style>{`
        @keyframes rdv-login-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(9px); }
          60% { transform: translateX(-7px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-24 left-[-8%] h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(193,154,107,0.20) 0%, transparent 68%)' }}
        />
        <div
          className="absolute right-[-10%] top-[12%] h-[30rem] w-[30rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(112,82,56,0.14) 0%, transparent 72%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[30%] h-[26rem] w-[26rem] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.20) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.75) 48%, transparent 62%)',
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 py-2 sm:py-4">
          <Link to={createPageUrl('Home')} className="inline-flex items-center">
            <img
              src="/RDV_transparent.png"
              alt="RDV.bi"
              className="h-14 w-auto object-contain sm:h-20"
            />
          </Link>
          <LanguageSwitcher variant="outline" />
        </header>

        <main className="flex flex-1 items-center justify-center py-6">
          <div
            className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border shadow-2xl lg:grid-cols-[1.1fr_0.9fr]"
            style={{
              background: 'rgba(255,255,255,0.40)',
              borderColor: 'rgba(255,255,255,0.45)',
              boxShadow: '0 30px 80px rgba(92, 69, 46, 0.18), inset 0 1px 0 rgba(255,255,255,0.55)',
              backdropFilter: 'blur(26px)',
              animation: isShaking ? 'rdv-login-shake 360ms ease-in-out' : 'none',
            }}
          >
            <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-10 lg:flex">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,0.32) 0%, rgba(197,168,126,0.18) 40%, rgba(79,98,122,0.16) 100%)',
                }}
              />
              <div
                className="absolute right-[-8%] top-[-10%] h-64 w-64 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.34) 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-[-8%] left-[-10%] h-72 w-72 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(193,154,107,0.22) 0%, transparent 72%)' }}
              />

              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em]"
                  style={{
                    background: 'rgba(255,255,255,0.34)',
                    color: '#6f553f',
                    border: '1px solid rgba(255,255,255,0.38)',
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {copy.premiumAccess}
                </div>
                <h1 className="mt-8 max-w-md text-5xl font-semibold leading-tight text-[#24160d]">
                  {copy.heroTitle}
                </h1>
                <p className="mt-5 max-w-lg text-base leading-7 text-[#5e4b3b]">
                  {copy.heroDesc}
                </p>
              </div>

              <div className="relative grid gap-4">
                <div
                  className="rounded-[1.5rem] p-5"
                  style={{
                    background: 'rgba(255,255,255,0.28)',
                    border: '1px solid rgba(255,255,255,0.36)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-white/45 p-3 text-[#5f4634]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a6049]">{copy.protectedWorkspace}</p>
                      <p className="mt-2 text-sm leading-6 text-[#4f3f31]">
                        {copy.protectedDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="p-5 sm:p-10 lg:p-12">
              <div className="mx-auto max-w-md">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a6a4d]">
                    {copy.adminPortal}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-[#20150d] sm:text-3xl">{copy.adminStaffLogin}</h2>
                  <p className="mt-3 text-sm leading-6 text-[#6b5847]">
                    {copy.assignedCredentials}
                  </p>
                </div>

                {error && (
                  <div
                    className="mb-5 flex items-start gap-3 rounded-2xl p-4 text-sm"
                    style={{
                      color: '#b42318',
                      background: 'rgba(255,245,245,0.82)',
                      border: '1px solid rgba(254,205,211,0.9)',
                    }}
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#3e2f24]">{copy.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7a5c]" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        onBlur={validateEmailTransition}
                        onKeyDown={(e) => {
                          if ((e.key === 'Tab' || e.key === 'Enter') && !validateEmailTransition()) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="you@institution.com"
                        className="h-14 rounded-2xl border-0 pl-11 text-[15px] shadow-none focus-visible:ring-0"
                        style={{
                          background: 'rgba(255,255,255,0.55)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 25px rgba(103,74,49,0.06)',
                        }}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="mt-2 text-sm" style={{ color: '#b42318' }}>
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#3e2f24]">{copy.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a7a5c]" />
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-14 rounded-2xl border-0 pl-11 text-[15px] shadow-none focus-visible:ring-0"
                        style={{
                          background: 'rgba(255,255,255,0.55)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 10px 25px rgba(103,74,49,0.06)',
                        }}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl text-sm font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #7b5a3f 0%, #c59a6b 55%, #f0d4b0 100%)',
                      color: '#20150d',
                      boxShadow: '0 18px 40px rgba(123,90,63,0.24)',
                    }}
                    disabled={submitting}
                  >
                    <span>{submitting ? copy.signingIn : copy.signIn}</span>
                    {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>

                <div className="mt-6 rounded-2xl border border-white/40 bg-white/24 px-4 py-3 text-xs leading-6 text-[#6d5845]">
                  {copy.logoHint}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
