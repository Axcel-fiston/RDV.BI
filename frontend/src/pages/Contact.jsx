import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, ArrowRight, Mail, MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const C = {
  red: '#b91c1c',
  green: '#15803d',
  gold: '#d4af6a',
  text: '#1a0a0a',
  textMuted: '#6b2a2a',
  bg: 'linear-gradient(150deg, #fff8f8 0%, #fff 40%, #f0fdf4 100%)',
};

const TOPICS = [
  'General Inquiry',
  'Institution Onboarding',
  'Platform Support',
  'Partnership',
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    institution: '',
    topic: TOPICS[0],
    message: '',
  });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Name, email, and message are required.');
      return;
    }

    const subject = encodeURIComponent(`RDV.BI Contact: ${form.topic}`);
    const body = encodeURIComponent(
      [
        `Name: ${form.name.trim()}`,
        `Email: ${form.email.trim()}`,
        `Institution: ${form.institution.trim() || 'N/A'}`,
        `Topic: ${form.topic}`,
        '',
        form.message.trim(),
      ].join('\n')
    );

    window.location.href = `mailto:contact@rdv.bi?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-5%] left-[-5%] w-[550px] h-[550px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(185,28,28,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(21,128,61,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-[18%] left-[38%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,106,0.08) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:px-8">
        <header className="flex items-center justify-between py-2">
          <Link to={createPageUrl('Home')} className="inline-flex items-center">
            <img src="/RDV%20logo.png" alt="RDV.bi" className="h-14 w-auto object-contain mix-blend-multiply" />
          </Link>
          <Link
            to={createPageUrl('Home')}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: C.textMuted, background: 'rgba(255,255,255,0.66)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Link>
        </header>

        <main className="pt-10 pb-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: C.textMuted }}>
              Contact Us
            </p>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight" style={{ color: C.text }}>
              A premium contact experience for institutions and platform teams.
            </h1>
            <p className="mt-5 text-base leading-8" style={{ color: C.textMuted }}>
              Send your request through the form below and we will route it to the right conversation, whether you need onboarding guidance, operational help, or partnership support.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Mail,
                title: 'General Inquiries',
                detail: 'Questions about the platform, account access, or product direction.',
              },
              {
                icon: MessageSquare,
                title: 'Institution Onboarding',
                detail: 'Need guidance before registering or preparing your booking workflow.',
              },
              {
                icon: ShieldCheck,
                title: 'Platform Support',
                detail: 'Staff, admin, or platform-level issues that need a direct response.',
              },
            ].map(({ icon: Icon, title, detail }) => (
              <div
                key={title}
                className="rounded-[1.75rem] p-6"
                style={{
                  background: 'rgba(255,255,255,0.68)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 12px 40px rgba(185,28,28,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.7)', color: C.red }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold" style={{ color: C.text }}>{title}</h2>
                <p className="mt-3 text-sm leading-7" style={{ color: C.textMuted }}>{detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section
              className="rounded-[2rem] p-8 md:p-10"
              style={{
                background: 'rgba(255,255,255,0.62)',
                border: '1px solid rgba(255,255,255,0.92)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 12px 40px rgba(185,28,28,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
              }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: C.textMuted }}>
                Best Next Step
              </p>
              <h3 className="mt-3 text-2xl font-bold" style={{ color: C.text }}>
                Want to join RDV.BI as an institution?
              </h3>
              <p className="mt-4 text-sm leading-7" style={{ color: C.textMuted }}>
                The fastest path is still the institution registration page. Use this contact form when your question is broader, operational, or partnership-related.
              </p>
              <div className="mt-6">
                <Link to={createPageUrl('InstitutionRegister')}>
                  <button
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${C.red}, #991b1b)`,
                      color: '#fff',
                      boxShadow: '0 10px 30px rgba(185,28,28,0.22)',
                    }}
                  >
                    Register Your Institution
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </section>

            <section
              className="rounded-[2rem] p-8 md:p-10"
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(255,255,255,0.94)',
                backdropFilter: 'blur(28px)',
                boxShadow: '0 16px 45px rgba(185,28,28,0.09), inset 0 1px 0 rgba(255,255,255,0.95)',
              }}
            >
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: C.textMuted }}>
                  Send A Message
                </p>
                <h3 className="mt-3 text-2xl font-bold" style={{ color: C.text }}>
                  Contact form
                </h3>
                <p className="mt-3 text-sm leading-7" style={{ color: C.textMuted }}>
                  This form opens your mail client with a pre-filled message so you can send your request immediately.
                </p>
              </div>

              {error && (
                <div
                  className="mb-5 rounded-2xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(254,242,242,0.9)', color: C.red, border: '1px solid rgba(185,28,28,0.12)' }}
                >
                  {error}
                </div>
              )}

              {submitted && !error && (
                <div
                  className="mb-5 rounded-2xl px-4 py-3 text-sm"
                  style={{ background: 'rgba(240,253,244,0.95)', color: C.green, border: '1px solid rgba(21,128,61,0.12)' }}
                >
                  Your mail app should be open now with the message pre-filled.
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: C.text }}>Full Name</label>
                    <Input
                      value={form.name}
                      onChange={handleChange('name')}
                      placeholder="Your name"
                      className="h-12 rounded-2xl border-0 shadow-none focus-visible:ring-0"
                      style={{ background: 'rgba(255,255,255,0.74)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: C.text }}>Email</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={handleChange('email')}
                      placeholder="you@institution.com"
                      className="h-12 rounded-2xl border-0 shadow-none focus-visible:ring-0"
                      style={{ background: 'rgba(255,255,255,0.74)' }}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: C.text }}>Institution</label>
                    <Input
                      value={form.institution}
                      onChange={handleChange('institution')}
                      placeholder="Institution name"
                      className="h-12 rounded-2xl border-0 shadow-none focus-visible:ring-0"
                      style={{ background: 'rgba(255,255,255,0.74)' }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium" style={{ color: C.text }}>Topic</label>
                    <Select
                      value={form.topic}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, topic: value }))}
                    >
                      <SelectTrigger
                        className="h-12 rounded-[1.2rem] border-0 bg-transparent px-4 text-sm font-medium shadow-none focus:ring-0 focus:ring-offset-0"
                        style={{
                          color: C.text,
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.72))',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 10px 30px rgba(212,175,106,0.10)',
                        }}
                      >
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-[1.4rem] border-0 p-2 shadow-2xl"
                        style={{
                          background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,244,237,0.94))',
                          backdropFilter: 'blur(28px)',
                          boxShadow: '0 18px 48px rgba(92,69,46,0.16), inset 0 1px 0 rgba(255,255,255,0.95)',
                        }}
                      >
                        {TOPICS.map((topic) => (
                          <SelectItem
                            key={topic}
                            value={topic}
                            className="rounded-xl px-3 py-3 text-sm font-medium focus:bg-white/80"
                            style={{ color: C.text }}
                          >
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: C.text }}>Message</label>
                  <Textarea
                    value={form.message}
                    onChange={handleChange('message')}
                    placeholder="Tell us what you need help with."
                    className="min-h-[180px] rounded-[1.5rem] border-0 shadow-none focus-visible:ring-0"
                    style={{ background: 'rgba(255,255,255,0.74)' }}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 rounded-2xl px-6 text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${C.red}, #991b1b)`,
                    color: '#fff',
                    boxShadow: '0 10px 30px rgba(185,28,28,0.18)',
                  }}
                >
                  <Send className="mr-2 w-4 h-4" />
                  Send Message
                </Button>
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
