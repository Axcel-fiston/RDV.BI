import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  CheckCircle2, XCircle, Clock, Building2, Mail, Phone, Globe, 
  MapPin, User, Eye, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PlatformAdminLayout from '@/components/platform/PlatformAdminLayout';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/api/apiClient';
import { useLanguage } from '@/components/LanguageContext';

const TYPE_ICONS = { bank:'🏦', hospital:'🏥', insurance:'🛡️', government:'🏛️', utility:'⚡', other:'🏢' };

const STATUS_STYLES = {
  pending: { badge: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { badge: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  rejected: { badge: 'bg-red-100 text-red-800', icon: XCircle },
};

function ApplicationCard({ app, onAction, copy }) {
  const [expanded, setExpanded] = useState(false);
  const { badge, icon: StatusIcon } = STATUS_STYLES[app.status] || STATUS_STYLES.pending;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {app.logo_url ? (
                <img src={app.logo_url} alt={app.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gray-50">
                  {TYPE_ICONS[app.type] || '🏢'}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{app.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge className={badge}><StatusIcon className="w-3 h-3 mr-1" />{app.status}</Badge>
                  {app.type && (
                    <span className="text-xs text-gray-500 capitalize">{app.type}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
            {app.contact_email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.contact_email}</span>}
            {app.contact_phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{app.contact_phone}</span>}
            {app.slug && (
              <span className="flex items-center gap-1.5 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-md">
                /booking/{app.slug}
              </span>
            )}
          </div>
        </div>

        {expanded && (
          <div className="px-5 pb-5 border-t border-gray-50 pt-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                { icon: User, label: copy.admin, value: `${app.admin_name || '—'}${app.admin_email ? ` · ${app.admin_email}` : ''}` },
                { icon: MapPin, label: copy.address, value: app.address || '—' },
                { icon: Mail, label: copy.institutionEmail, value: app.contact_email || '—' },
                { icon: Phone, label: copy.institutionPhone, value: app.contact_phone || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {app.description && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{copy.description}</p>
                <p className="text-sm text-gray-700">{app.description}</p>
              </div>
            )}
            {app.rejection_reason && (
              <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                <p className="text-xs text-red-500 mb-1">{copy.rejectionReason}</p>
                <p className="text-sm text-red-700">{app.rejection_reason}</p>
              </div>
            )}
            <p className="text-xs text-gray-400">{copy.applied} {app.created_date ? format(new Date(app.created_date), 'MMM d, yyyy') : '—'}</p>
          </div>
        )}

        {app.status === 'pending' && (
          <div className="flex gap-2 px-5 pb-5">
            <Button onClick={() => onAction(app, 'approve')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9">
              <CheckCircle2 className="w-4 h-4 mr-2" /> {copy.approve}
            </Button>
            <Button variant="outline" onClick={() => onAction(app, 'reject')}
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-9">
              <XCircle className="w-4 h-4 mr-2" /> {copy.reject}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationsContent() {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [actionTarget, setActionTarget] = useState(null); // { app, type }
  const [rejectionReason, setRejectionReason] = useState('');
  const copy = lang === 'fr'
    ? {
        institutionApplications: "Demandes d institutions",
        loadingApplications: 'Chargement des demandes...',
        fetchingApplications: "Recuperation des demandes d institution depuis l API d administration.",
        unableToLoad: "Impossible de charger les donnees de revue de la plateforme",
        apiError: "Erreur de l API d administration",
        unknownError: 'Erreur inconnue',
        apiHelp: "Cette page necessite une session PLATFORM_ADMIN valide et une requete reussie vers",
        reviewApprove: "Examinez et approuvez les nouvelles inscriptions d institutions",
        pendingCount: 'en attente',
        pending: 'En attente',
        approved: 'Approuvees',
        rejected: 'Rejetees',
        noApplications: 'Aucune demande',
        admin: 'Admin',
        address: 'Adresse',
        institutionEmail: "E-mail de l institution",
        institutionPhone: "Telephone de l institution",
        description: 'Description',
        rejectionReason: 'Motif du rejet',
        applied: 'Soumise le',
        approve: 'Approuver',
        reject: 'Rejeter',
        approveTitle: 'Approuver la demande',
        approveText: 'Approuver',
        approveWill: 'entrainera :',
        approveItems: [
          'La creation d une page institution active',
          `La publication sur /PublicBooking?slug=${actionTarget?.app?.slug}`,
          'L envoi d un e-mail de confirmation au demandeur',
        ],
        cancel: 'Annuler',
        approving: 'Approbation...',
        confirmApprove: 'Confirmer',
        rejectTitle: 'Rejeter la demande',
        rejectText: 'Vous rejetez',
        rejectOptional: 'Vous pouvez indiquer un motif :',
        rejectPlaceholder: 'Motif du rejet (optionnel, conserve en interne)...',
        confirmReject: 'Confirmer le rejet',
        toastApproved: 'Institution approuvee',
        toastApproveError: "Impossible d approuver l institution",
        toastRejected: 'Demande rejetee',
        toastRejectError: "Impossible de rejeter l institution",
      }
    : {
        institutionApplications: 'Institution Applications',
        loadingApplications: 'Loading applications...',
        fetchingApplications: 'Fetching institution applications from the platform admin API.',
        unableToLoad: 'Unable to load platform review data',
        apiError: 'Platform admin API error',
        unknownError: 'Unknown error',
        apiHelp: 'This page requires a valid PLATFORM_ADMIN session and a successful request to',
        reviewApprove: 'Review and approve new institution registrations',
        pendingCount: 'pending',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        noApplications: 'No applications',
        admin: 'Admin',
        address: 'Address',
        institutionEmail: 'Institution Email',
        institutionPhone: 'Institution Phone',
        description: 'Description',
        rejectionReason: 'Rejection Reason',
        applied: 'Applied',
        approve: 'Approve',
        reject: 'Reject',
        approveTitle: 'Approve Application',
        approveText: 'Approving',
        approveWill: 'will:',
        approveItems: [
          'Create a live institution page',
          `Publish at /PublicBooking?slug=${actionTarget?.app?.slug}`,
          'Send a confirmation email to the applicant',
        ],
        cancel: 'Cancel',
        approving: 'Approving...',
        confirmApprove: 'Confirm Approve',
        rejectTitle: 'Reject Application',
        rejectText: 'Rejecting',
        rejectOptional: 'Optionally provide a reason:',
        rejectPlaceholder: 'Reason for rejection (optional, will be stored internally)...',
        confirmReject: 'Confirm Reject',
        toastApproved: 'Institution approved',
        toastApproveError: 'Failed to approve institution',
        toastRejected: 'Application rejected',
        toastRejectError: 'Failed to reject institution',
      };

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['applications'],
    queryFn: () => api.entities.Institution.listForReview()
  });

  const approveInst = useMutation({
    mutationFn: ({ id, notes }) => api.entities.Institution.approve(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success(copy.toastApproved);
      setActionTarget(null);
    },
    onError: (error) => {
      toast.error(error?.message || copy.toastApproveError);
    }
  });

  const rejectInst = useMutation({
    mutationFn: ({ id, notes }) => api.entities.Institution.reject(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success(copy.toastRejected);
      setActionTarget(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error?.message || copy.toastRejectError);
    }
  });

  const handleAction = (app, type) => {
    setActionTarget({ app, type });
    setRejectionReason('');
  };

  const confirmApprove = async () => {
    const { app } = actionTarget;
    try {
      await approveInst.mutateAsync({ id: app.id });
    } catch {
      // Handled by the mutation onError callback.
    }
  };

  const confirmReject = async () => {
    try {
      await rejectInst.mutateAsync({ id: actionTarget.app.id, notes: rejectionReason });
    } catch {
      // Handled by the mutation onError callback.
    }
  };

  const pending = applications.filter(a => a.status === 'pending');
  const approved = applications.filter(a => a.status === 'approved');
  const rejected = applications.filter(a => a.status === 'rejected');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.institutionApplications}</h1>
          <p className="text-gray-500 mt-1">{copy.loadingApplications}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-500">
          {copy.fetchingApplications}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.institutionApplications}</h1>
          <p className="text-gray-500 mt-1">{copy.unableToLoad}</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">{copy.apiError}</p>
          <p className="mt-1 text-sm text-red-600">{error.message || copy.unknownError}</p>
          <p className="mt-3 text-xs text-red-500">
            {copy.apiHelp} <code>/api/admin/institutions</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.institutionApplications}</h1>
          <p className="text-gray-500 mt-1">{copy.reviewApprove}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
            {pending.length} {copy.pendingCount}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: copy.pending, value: pending.length, color: 'bg-amber-50', textColor: 'text-amber-700' },
          { label: copy.approved, value: approved.length, color: 'bg-green-50', textColor: 'text-green-700' },
          { label: copy.rejected, value: rejected.length, color: 'bg-red-50', textColor: 'text-red-700' },
        ].map(({ label, value, color, textColor }) => (
          <Card key={label} className={cn("border-0 shadow-sm", color)}>
            <CardContent className="p-4">
              <p className={cn("text-3xl font-bold", textColor)}>{value}</p>
              <p className={cn("text-sm mt-0.5", textColor)}>{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">{copy.pending} ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">{copy.approved} ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">{copy.rejected} ({rejected.length})</TabsTrigger>
        </TabsList>
        {['pending', 'approved', 'rejected'].map(status => (
          <TabsContent key={status} value={status} className="space-y-4 mt-4">
            {(status === 'pending' ? pending : status === 'approved' ? approved : rejected).map(app => (
              <ApplicationCard key={app.id} app={app} onAction={handleAction} copy={copy} />
            ))}
            {(status === 'pending' ? pending : status === 'approved' ? approved : rejected).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>{copy.noApplications} {status === 'pending' ? copy.pending.toLowerCase() : status === 'approved' ? copy.approved.toLowerCase() : copy.rejected.toLowerCase()}</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={actionTarget?.type === 'approve'} onOpenChange={() => setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.approveTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-gray-600">
              {copy.approveText} <strong>{actionTarget?.app?.name}</strong> {copy.approveWill}
            </p>
            <ul className="space-y-1.5 text-sm text-gray-600">
              {copy.approveItems.map(item => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>{copy.cancel}</Button>
            <Button onClick={confirmApprove} disabled={approveInst.isPending}
              className="bg-green-600 hover:bg-green-700 text-white">
              {approveInst.isPending ? copy.approving : copy.confirmApprove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={actionTarget?.type === 'reject'} onOpenChange={() => setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{copy.rejectTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">
              {copy.rejectText} <strong>{actionTarget?.app?.name}</strong>. {copy.rejectOptional}
            </p>
            <Textarea
              placeholder={copy.rejectPlaceholder}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>{copy.cancel}</Button>
            <Button onClick={confirmReject} disabled={rejectInst.isPending}
              className="bg-red-600 hover:bg-red-700 text-white">
              {copy.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InstitutionApplications({ user }) {
  return (
    <PlatformAdminLayout user={user}>
      <ApplicationsContent />
    </PlatformAdminLayout>
  );
}
