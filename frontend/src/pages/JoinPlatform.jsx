import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { 
  Building2, CheckCircle2, ChevronLeft, ArrowRight, 
  Loader2, Upload, Globe, Phone, Mail, MapPin, User, Briefcase
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';

const C = {
  red: '#b91c1c', green: '#15803d', gold: '#d4af6a',
  text: '#1a0a0a', textMuted: '#6b2a2a',
};

const TYPE_OPTIONS = [
  { value: 'bank', label: 'Bank', icon: '🏦' },
  { value: 'hospital', label: 'Hospital / Clinic', icon: '🏥' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'government', label: 'Government', icon: '🏛️' },
  { value: 'utility', label: 'Utility / Energy', icon: '⚡' },
  { value: 'other', label: 'Other', icon: '🏢' },
];

const STEPS = ['institution', 'admin', 'review'];

export default function JoinPlatform() {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState({
    institution_name: '', institution_type: '', slug: '',
    address: '', phone: '', email: '', website: '', description: '',
    admin_full_name: '', admin_email: '', admin_password: '', working_hours_description: '',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const copy = lang === 'fr'
    ? {
        joinInstitution: "Rejoindre en tant qu'institution",
        heroTitle: 'Inscrivez votre institution',
        heroDesc: 'Rejoignez plus de 50 institutions qui utilisent deja RDV.bi pour gerer les rendez-vous et reduire les files d attente.',
        steps: ['Infos institution', 'Compte admin', 'Validation'],
        aboutInstitution: 'A propos de votre institution',
        institutionName: "Nom de l'institution *",
        institutionType: "Type d'institution *",
        slug: 'Slug URL *',
        yourPage: 'Votre page :',
        description: 'Description',
        address: 'Adresse',
        website: 'Site web',
        logo: 'Logo',
        uploadLogo: "Telecharger le logo de l institution (optionnel)",
        continue: 'Continuer',
        adminAccount: 'Compte administrateur',
        adminFullName: "Nom complet de l administrateur *",
        institutionEmail: "E-mail de contact de l'institution *",
        adminLoginEmail: 'E-mail de connexion admin *',
        adminPassword: 'Mot de passe admin *',
        minChars: 'Au moins 8 caracteres',
        phone: 'Telephone',
        workingHours: 'Horaires',
        workingHoursPlaceholder: 'ex. Lundi-Vendredi, 7h30-16h30',
        back: 'Retour',
        review: 'Verifier',
        reviewTitle: 'Verifiez votre demande',
        bookingUrl: 'URL de reservation',
        type: 'Type',
        institutionPhone: "Telephone de l'institution",
        adminName: 'Nom admin',
        adminLogin: 'Connexion admin',
        submitAgreement: "En soumettant, vous acceptez les conditions d utilisation de RDV.bi. Votre demande sera examinee sous 1 a 2 jours ouvrables.",
        submit: 'Soumettre la demande',
        submitError: "Impossible d'envoyer la demande",
        submittedTitle: 'Demande envoyee !',
        submittedText: "Merci d avoir demande a rejoindre RDV.bi. Notre equipe examinera votre demande et vous recontactera a l adresse",
        submittedTail: 'sous 1 a 2 jours ouvrables.',
        nextSteps: 'Prochaines etapes',
        nextItems: [
          'Notre equipe examine votre demande',
          'Nous verifions les informations de votre institution',
          'Votre page est mise en ligne et les clients peuvent reserver',
        ],
      }
    : {
        joinInstitution: 'Join as an Institution',
        heroTitle: 'Register Your Institution',
        heroDesc: 'Join 50+ institutions already using RDV.bi to manage appointments and reduce queues.',
        steps: ['Institution Info', 'Admin Account', 'Review'],
        aboutInstitution: 'About Your Institution',
        institutionName: 'Institution Name *',
        institutionType: 'Institution Type *',
        slug: 'URL Slug *',
        yourPage: 'Your page:',
        description: 'Description',
        address: 'Address',
        website: 'Website',
        logo: 'Logo',
        uploadLogo: 'Upload institution logo (optional)',
        continue: 'Continue',
        adminAccount: 'Admin Account',
        adminFullName: 'Admin Full Name *',
        institutionEmail: 'Institution Contact Email *',
        adminLoginEmail: 'Admin Login Email *',
        adminPassword: 'Admin Password *',
        minChars: 'At least 8 characters',
        phone: 'Phone Number',
        workingHours: 'Working Hours',
        workingHoursPlaceholder: 'e.g. Monday-Friday, 7:30am-4:30pm',
        back: 'Back',
        review: 'Review',
        reviewTitle: 'Review Your Application',
        bookingUrl: 'Booking URL',
        type: 'Type',
        institutionPhone: 'Institution Phone',
        adminName: 'Admin Name',
        adminLogin: 'Admin Login',
        submitAgreement: "By submitting, you agree to RDV.bi's terms of service. Your application will be reviewed within 1-2 business days.",
        submit: 'Submit Application',
        submitError: 'Unable to submit the application',
        submittedTitle: 'Application Submitted!',
        submittedText: 'Thank you for applying to join RDV.bi. Our team will review your application and get back to you at',
        submittedTail: 'within 1-2 business days.',
        nextSteps: 'What happens next?',
        nextItems: [
          'Our team reviews your application',
          'We verify your institution details',
          'Your page goes live - customers can book!',
        ],
      };

  const mutation = useMutation({
    mutationFn: (data) => api.entities.Institution.create(data),
    onSuccess: () => {
      setSubmitError('');
      setSubmitted(true);
    },
    onError: (error) => {
      setSubmitError(error.message || copy.submitError);
    },
  });

  const set = (key, val) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      if (key === 'institution_name' && !slugEdited) {
        next.slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      return next;
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoUploading(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, logo_url: file_url }));
    setLogoUploading(false);
  };

  const handleSubmit = () => {
    setSubmitError('');
    mutation.mutate({
      name: form.institution_name,
      slug: form.slug,
      type: form.institution_type,
      contact_phone: form.phone,
      contact_email: form.email,
      address: form.address,
      description: form.description,
      logo_url: form.logo_url,
      admin_full_name: form.admin_full_name,
      admin_email: form.admin_email,
      admin_password: form.admin_password,
    });
  };

  const step1Valid = form.institution_name && form.institution_type && form.slug;
  const step2Valid = form.email && form.phone && form.admin_full_name && form.admin_email && form.admin_password.length >= 8;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #15803d20, #15803d30)', border: '2px solid #15803d40' }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: C.green }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: C.text }}>{copy.submittedTitle}</h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: C.textMuted }}>
            {copy.submittedText} <strong>{form.admin_email}</strong> {copy.submittedTail}
          </p>
          <div className="rounded-xl p-4 mb-6 text-left space-y-2"
            style={{ background: 'rgba(21,128,61,0.05)', border: '1px solid rgba(21,128,61,0.2)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: C.green }}>{copy.nextSteps}</p>
            {copy.nextItems.map((txt, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: C.green }}>{i + 1}</div>
                <p className="text-sm" style={{ color: C.textMuted }}>{txt}</p>
              </div>
            ))}
          </div>
          <Link to={createPageUrl('Home')}>
            <Button className="w-full text-white" style={{ background: `linear-gradient(135deg, ${C.red}, #991b1b)` }}>
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)' }}>
      {/* Header */}
      <header
        className="fixed inset-x-0 top-0 z-30 border-b"
        style={{
          background: 'rgba(255,255,255,0.58)',
          borderColor: 'rgba(185,28,28,0.1)',
          boxShadow: '0 1px 30px rgba(185,28,28,0.05)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
          <Link to={createPageUrl('Home')}>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(185,28,28,0.06)', border: '1px solid rgba(185,28,28,0.15)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: C.red }} />
            </button>
          </Link>
          <div className="flex items-center gap-2 rounded-2xl px-2 py-1.5" style={{ background: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)' }}>
            <img src="/RDV%20logo.png" alt="RDV.bi" className="h-16 w-auto object-contain mix-blend-multiply sm:h-20" />
          </div>
          <span className="ml-auto text-sm font-medium" style={{ color: C.textMuted }}>{copy.joinInstitution}</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-32">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${C.red}15, ${C.green}15)`, border: `1px solid ${C.red}20` }}>
            <Building2 className="w-8 h-8" style={{ color: C.red }} />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: C.text }}>{copy.heroTitle}</h1>
          <p className="text-sm" style={{ color: C.textMuted }}>{copy.heroDesc}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {copy.steps.map((label, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                )}
                  style={i <= step
                    ? { background: `linear-gradient(135deg, ${C.red}, ${C.green})`, color: 'white' }
                    : { background: 'rgba(185,28,28,0.08)', color: C.textMuted }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs hidden sm:block font-medium" style={{ color: i <= step ? C.text : C.textMuted }}>{label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px max-w-[40px]" style={{ background: i < step ? `linear-gradient(90deg, ${C.red}, ${C.green})` : 'rgba(185,28,28,0.15)' }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(30px)', boxShadow: '0 4px 30px rgba(185,28,28,0.06)' }}>

          {/* Step 1: Institution Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>{copy.aboutInstitution}</h2>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.institutionName}</label>
                <Input value={form.institution_name} onChange={e => set('institution_name', e.target.value)}
                  placeholder="e.g. Banque Nationale du Burundi" className="h-12" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.institutionType}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => set('institution_type', opt.value)}
                      className="flex items-center gap-2 p-3 rounded-xl text-left text-sm font-medium transition-all"
                      style={form.institution_type === opt.value
                        ? { background: `linear-gradient(135deg, ${C.red}15, ${C.green}15)`, border: `2px solid ${C.red}50`, color: C.text }
                        : { background: 'rgba(185,28,28,0.04)', border: '1.5px solid rgba(185,28,28,0.12)', color: C.textMuted }}>
                      <span>{opt.icon}</span>{opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>
                  {copy.slug}
                  <span className="ml-2 text-xs font-normal" style={{ color: C.textMuted }}>
                    {copy.yourPage} rdv.bi/booking/<strong>{form.slug || 'your-slug'}</strong>
                  </span>
                </label>
                <Input
                  value={form.slug}
                  onChange={e => { setSlugEdited(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }}
                  placeholder="e.g. my-bank"
                  className="h-12 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.description}</label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Brief description of your institution and services offered..." rows={3} />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.address}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={form.address} onChange={e => set('address', e.target.value)}
                      placeholder="Street, City" className="h-12 pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.website}</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={form.website} onChange={e => set('website', e.target.value)}
                      placeholder="https://..." className="h-12 pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.logo}</label>
                <label className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                  style={{ border: '2px dashed rgba(185,28,28,0.2)', background: 'rgba(185,28,28,0.02)' }}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  {logoUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: C.red }} />
                  ) : form.logo_url ? (
                    <img src={form.logo_url} alt="logo" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <Upload className="w-5 h-5" style={{ color: C.textMuted }} />
                  )}
                  <span className="text-sm" style={{ color: C.textMuted }}>
                    {logoFile ? logoFile.name : copy.uploadLogo}
                  </span>
                </label>
              </div>

              <Button onClick={() => setStep(1)} disabled={!step1Valid}
                className="w-full h-12 text-white font-semibold"
                style={{ background: step1Valid ? `linear-gradient(135deg, ${C.red}, #991b1b)` : undefined }}>
                {copy.continue} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Contact */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>{copy.adminAccount}</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.adminFullName}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input value={form.admin_full_name} onChange={e => set('admin_full_name', e.target.value)}
                      placeholder="Full name" className="h-12 pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.institutionEmail}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      placeholder="contact@institution.com" className="h-12 pl-10" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.adminLoginEmail}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="email" value={form.admin_email} onChange={e => set('admin_email', e.target.value)}
                      placeholder="admin@institution.com" className="h-12 pl-10" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.adminPassword}</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input type="password" value={form.admin_password} onChange={e => set('admin_password', e.target.value)}
                      placeholder={copy.minChars} className="h-12 pl-10" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+257 XX XXX XXX" className="h-12 pl-10" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.text }}>{copy.workingHours}</label>
                <Input value={form.working_hours_description} onChange={e => set('working_hours_description', e.target.value)}
                  placeholder={copy.workingHoursPlaceholder} className="h-12" />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1 h-12">{copy.back}</Button>
                <Button onClick={() => setStep(2)} disabled={!step2Valid}
                  className="flex-1 h-12 text-white font-semibold"
                  style={{ background: step2Valid ? `linear-gradient(135deg, ${C.red}, #991b1b)` : undefined }}>
                  {copy.review} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>{copy.reviewTitle}</h2>

              {submitError && (
                <div
                  className="rounded-xl border px-4 py-3 text-sm"
                  style={{ background: 'rgba(185,28,28,0.06)', borderColor: 'rgba(185,28,28,0.18)', color: C.red }}
                >
                  {submitError}
                </div>
              )}

              <div className="space-y-3">
                {[
                  { label: copy.institutionName.replace(' *', ''), value: form.institution_name },
                  { label: copy.type, value: TYPE_OPTIONS.find(o => o.value === form.institution_type)?.label },
                  { label: copy.bookingUrl, value: `rdv.bi/booking/${form.slug}` },
                  { label: copy.description, value: form.description },
                  { label: copy.address, value: form.address },
                  { label: copy.institutionEmail.replace(' *', ''), value: form.email },
                  { label: copy.institutionPhone, value: form.phone },
                  { label: copy.adminName, value: form.admin_full_name },
                  { label: copy.adminLogin, value: form.admin_email },
                  { label: copy.workingHours, value: form.working_hours_description },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4 py-2 border-b"
                    style={{ borderColor: 'rgba(185,28,28,0.08)' }}>
                    <span className="text-sm flex-shrink-0" style={{ color: C.textMuted }}>{label}</span>
                    <span className="text-sm font-medium text-right" style={{ color: C.text }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4 text-sm"
                style={{ background: 'rgba(212,175,106,0.1)', border: '1px solid rgba(212,175,106,0.3)' }}>
                <p style={{ color: C.textMuted }}>
                  {copy.submitAgreement}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">{copy.back}</Button>
                <Button onClick={handleSubmit} disabled={mutation.isPending}
                  className="flex-1 h-12 text-white font-semibold"
                  style={{ background: `linear-gradient(135deg, ${C.green}, #166534)` }}>
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {copy.submit}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
