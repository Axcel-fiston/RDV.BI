import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, Server, Shield } from 'lucide-react';

const STOPLIGHT_STYLE_ID = 'stoplight-local-styles';
const STOPLIGHT_SCRIPT_ID = 'stoplight-local-script';

export default function Docs() {
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;

    if (!document.getElementById(STOPLIGHT_STYLE_ID)) {
      const link = document.createElement('link');
      link.id = STOPLIGHT_STYLE_ID;
      link.rel = 'stylesheet';
      link.href = '/stoplight/styles.min.css';
      document.head.appendChild(link);
    }

    const existingScript = document.getElementById(STOPLIGHT_SCRIPT_ID);
    if (existingScript) {
      setIsReady(true);
      return () => {
        active = false;
      };
    }

    const script = document.createElement('script');
    script.id = STOPLIGHT_SCRIPT_ID;
    script.src = '/stoplight/web-components.min.js';
    script.async = true;
    script.onload = () => {
      if (active) {
        setIsReady(true);
      }
    };
    script.onerror = () => {
      if (active) {
        setLoadError('Failed to load local Stoplight assets');
      }
    };
    document.body.appendChild(script);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isReady && !loadError) {
        setLoadError('Stoplight did not finish initializing');
      }
    }, 10000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isReady, loadError]);

  useEffect(() => {
    const host = document.getElementById('stoplight-host');
    if (!host || !isReady) return undefined;

    host.innerHTML = '';
    const element = document.createElement('elements-api');
    element.setAttribute('apiDescriptionUrl', '/openapi.yaml');
    element.setAttribute('router', 'hash');
    element.setAttribute('layout', 'sidebar');
    element.setAttribute('tryItCredentialsPolicy', 'same-origin');
    host.appendChild(element);

    return () => {
      if (host.contains(element)) {
        host.removeChild(element);
      }
    };
  }, [isReady]);

  useEffect(() => {
    const stoplightErrorHandler = (event) => {
      const message = event?.error?.message || event?.message;
      if (message) {
        setLoadError(message);
      }
    };

    window.addEventListener('error', stoplightErrorHandler);
    return () => {
      window.removeEventListener('error', stoplightErrorHandler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7efe4_0%,#fff9f1_38%,#f3f8f5_100%)] text-slate-900">
      <div className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <Link
                to="/Home"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to site</span>
              </Link>
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#173b30] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                  <BookOpen className="h-3.5 w-3.5" />
                  RDV.BI API Docs
                </p>
                <h1 className="max-w-3xl font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Stoplight documentation for booking, queue, and institution management
                </h1>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#173b30]/15 bg-white/90 px-4 py-3 shadow-sm">
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#173b30]/10 text-[#173b30]">
                  <Server className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Server</p>
                <p className="text-sm font-medium text-slate-900">http://localhost:4000</p>
              </div>
              <div className="rounded-2xl border border-[#8b2e1f]/15 bg-white/90 px-4 py-3 shadow-sm">
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#8b2e1f]/10 text-[#8b2e1f]">
                  <Shield className="h-4 w-4" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Auth</p>
                <p className="text-sm font-medium text-slate-900">Bearer JWT</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Source</p>
                <p className="text-sm font-medium text-slate-900">/openapi.yaml</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          {loadError ? (
            <div className="flex min-h-[320px] items-start gap-3 p-8 text-[#8b2e1f]">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-none" />
              <div>
                <p className="font-semibold">Stoplight failed to load</p>
                <p className="mt-2 text-sm text-slate-700">{loadError}</p>
                <p className="mt-2 text-sm text-slate-700">
                  The OpenAPI file is still available at <code>/openapi.yaml</code>.
                </p>
              </div>
            </div>
          ) : (
            <div
              id="stoplight-host"
              className="min-h-[320px]"
            >
              {!isReady ? (
                <div className="flex min-h-[320px] items-center justify-center text-sm font-medium text-slate-500">
                  Loading API documentation...
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
