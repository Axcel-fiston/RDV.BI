import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import {
    Building2, Save, Plus, Trash2, Monitor,
    Loader2, Upload, Globe
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';

function AdminSettingsContent({ institution, user }) {
    const { lang, switchLang, t } = useLanguage();
    const queryClient = useQueryClient();
    const [institutionForm, setInstitutionForm] = useState({
        name: '',
        slug: '',
        type: 'bank',
        address: '',
        phone: '',
        email: '',
        logo_url: ''
    });
    const [counterDialogOpen, setCounterDialogOpen] = useState(false);
    const [counterForm, setCounterForm] = useState({
        number: '',
        staff_name: '',
        is_active: true
    });
    const [staffDialogOpen, setStaffDialogOpen] = useState(false);
    const [staffForm, setStaffForm] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'STAFF',
        active: true
    });
    const [staffError, setStaffError] = useState('');

    const { data: counters = [] } = useQuery({
        queryKey: ['counters', institution?.id],
        queryFn: () => api.entities.Counter.filter({ institution_id: institution?.id }),
        enabled: !!institution?.id
    });
    const { data: staffUsers = [] } = useQuery({
        queryKey: ['staffUsers', institution?.id],
        queryFn: () => api.entities.User.list(),
        enabled: !!institution?.id && user?.role === 'ADMIN'
    });

    const canManageStaff = Boolean(institution?.id && user?.role === 'ADMIN');

    useEffect(() => {
        if (institution) {
            setInstitutionForm({
                name: institution.name || '',
                slug: institution.slug || '',
                type: institution.type || 'bank',
                address: institution.address || '',
                phone: institution.phone || '',
                email: institution.email || '',
                logo_url: institution.logo_url || ''
            });
        }
    }, [institution]);

    const updateInstitution = useMutation({
        mutationFn: (data) => api.entities.Institution.update(institution.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['myInstitutions']);
            toast.success('Settings saved successfully');
        }
    });

    const createInstitution = useMutation({
        mutationFn: (data) => api.entities.Institution.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['myInstitutions']);
            toast.success('Institution created successfully');
        }
    });

    const createCounter = useMutation({
        mutationFn: (data) => api.entities.Counter.create({
            ...data,
            institution_id: institution.id,
            status: 'available'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['counters', institution?.id] });
            setCounterDialogOpen(false);
            setCounterForm({ number: '', staff_name: '', is_active: true });
            toast.success('Counter added successfully');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to add counter');
        }
    });

    const deleteCounter = useMutation({
        mutationFn: (id) => api.entities.Counter.delete(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['counters', institution?.id] }),
        onError: (error) => {
            toast.error(error?.message || 'Failed to delete counter');
        }
    });
    const createStaff = useMutation({
        mutationFn: (data) => api.entities.User.create({
            ...data,
            role: data.role || 'STAFF'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staffUsers', institution?.id] });
            setStaffDialogOpen(false);
            setStaffForm({
                full_name: '',
                email: '',
                password: '',
                role: 'STAFF',
                active: true
            });
            toast.success('Staff member added');
            setStaffError('');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to add staff');
            setStaffError(((error?.message || '').replace(/^HTTP \d+\s*/, '')) || 'Failed to add staff');
        }
    });
    const deleteStaff = useMutation({
        mutationFn: (id) => api.entities.User.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staffUsers', institution?.id] });
            toast.success('Staff removed');
        },
        onError: (error) => {
            toast.error(error?.message || 'Failed to remove staff');
        }
    });

    const handleSaveInstitution = () => {
        if (institution) {
            updateInstitution.mutate(institutionForm);
        } else {
            createInstitution.mutate({ ...institutionForm, is_active: true });
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { file_url } = await api.integrations.Core.UploadFile({ file });
            setInstitutionForm({ ...institutionForm, logo_url: file_url });
        } catch (error) {
            toast.error('Failed to upload logo');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
                <p className="text-gray-500 mt-1">Manage your institution settings</p>
            </div>

            <Tabs defaultValue="institution">
            <TabsList className="mb-6">
                <TabsTrigger value="institution">Institution</TabsTrigger>
                <TabsTrigger value="counters">Counters</TabsTrigger>
                {canManageStaff && <TabsTrigger value="staff">Staff</TabsTrigger>}
                <TabsTrigger value="language">
                    <Globe className="w-4 h-4 mr-1.5" />Language
                </TabsTrigger>
            </TabsList>
            {!canManageStaff && (
                <p className="text-sm text-gray-500 mb-4">
                    Staff management is available only to institution admins.
                </p>
            )}

                {/* Institution Settings */}
                <TabsContent value="institution">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Institution Details</CardTitle>
                            <CardDescription>
                                Update your institution information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Logo */}
                            <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                    {institutionForm.logo_url ? (
                                        <img
                                            src={institutionForm.logo_url}
                                            alt="Logo"
                                            className="w-20 h-20 rounded-xl object-cover border"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                                            <Building2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                            id="logo-upload"
                                        />
                                        <Label htmlFor="logo-upload" className="cursor-pointer">
                                            <Button variant="outline" asChild>
                                                <span>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload Logo
                                                </span>
                                            </Button>
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Institution Name</Label>
                                    <Input
                                        value={institutionForm.name}
                                        onChange={(e) => setInstitutionForm({ ...institutionForm, name: e.target.value })}
                                        placeholder="e.g., Bancobu"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>URL Slug</Label>
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-500 mr-2">rdv.bi/</span>
                                        <Input
                                            value={institutionForm.slug}
                                            onChange={(e) => setInstitutionForm({
                                                ...institutionForm,
                                                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                            })}
                                            placeholder="bank"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={institutionForm.type}
                                        onValueChange={(v) => setInstitutionForm({ ...institutionForm, type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="hospital">Hospital</SelectItem>
                                            <SelectItem value="insurance">Insurance</SelectItem>
                                            <SelectItem value="government">Government</SelectItem>
                                            <SelectItem value="utility">Utility</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={institutionForm.phone}
                                        onChange={(e) => setInstitutionForm({ ...institutionForm, phone: e.target.value })}
                                        placeholder="+257 XX XXX XXX"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={institutionForm.email}
                                        onChange={(e) => setInstitutionForm({ ...institutionForm, email: e.target.value })}
                                        placeholder="contact@institution.bi"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Address</Label>
                                    <Textarea
                                        value={institutionForm.address}
                                        onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                                        placeholder="Physical address"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleSaveInstitution}
                                disabled={updateInstitution.isPending || createInstitution.isPending}
                                className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                            >
                                {(updateInstitution.isPending || createInstitution.isPending) && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Counters Settings */}
                <TabsContent value="counters">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Service Counters</CardTitle>
                                <CardDescription>
                                    Manage your service counters
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setCounterDialogOpen(true)}
                                className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Counter
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {counters.map((counter) => (
                                    <div
                                        key={counter.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-[#1e3a5f] rounded-xl flex items-center justify-center text-white font-bold">
                                                {counter.number}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Counter {counter.number}</p>
                                                <p className="text-sm text-gray-500">{counter.staff_name || 'Unassigned'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteCounter.mutate(counter.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}

                                {counters.length === 0 && (
                                    <div className="text-center py-12">
                                        <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No counters configured</p>
                                        <p className="text-sm text-gray-400 mt-1">Add counters to manage the queue</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Staff Settings */}
            {canManageStaff && (
                <TabsContent value="staff">
                <Card className="border-0 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Staff Access</CardTitle>
                                <CardDescription>
                                    Invite staff members and assign roles
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => setStaffDialogOpen(true)}
                                className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {staffUsers.map((staff) => {
                                    const isCurrent = user?.id === staff.id;
                                    return (
                                        <div
                                            key={staff.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{staff.full_name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {staff.email} · {staff.role}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                disabled={isCurrent}
                                                onClick={() => {
                                                    if (isCurrent) return;
                                                    if (!window.confirm(`Remove ${staff.full_name || staff.email}?`)) return;
                                                    deleteStaff.mutate(staff.id);
                                                }}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    );
                                })}

                                {staffUsers.length === 0 && (
                                    <div className="text-center py-12">
                                        <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No staff invited yet</p>
                                        <p className="text-sm text-gray-400 mt-1">Add staff to manage bookings</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            )}

                {/* Language Tab */}
                <TabsContent value="language">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Language / Langue</CardTitle>
                            <CardDescription>
                                Choose the display language for the entire system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4 max-w-md">
                                {[
                                    { code: 'en', label: 'English', flag: '🇬🇧', desc: 'Use English across the system' },
                                    { code: 'fr', label: 'Français', flag: '🇫🇷', desc: 'Utiliser le français partout' },
                                ].map(({ code, label, flag, desc }) => (
                                    <button
                                        key={code}
                                        onClick={() => switchLang(code)}
                                        className="flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                                        style={{
                                            borderColor: lang === code ? '#1e3a5f' : '#e5e7eb',
                                            background: lang === code ? '#f0f5ff' : 'white',
                                        }}
                                    >
                                        <span className="text-3xl">{flag}</span>
                                        <div>
                                            <p className="font-semibold text-gray-900">{label}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                        </div>
                                        {lang === code && (
                                            <div className="ml-auto w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500">
                                ✨ Language changes apply immediately across admin and public pages.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Counter Dialog */}
            <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Counter</DialogTitle>
                        <DialogDescription>
                            Create a new service counter
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Counter Number</Label>
                            <Input
                                value={counterForm.number}
                                onChange={(e) => setCounterForm({ ...counterForm, number: e.target.value })}
                                placeholder="e.g., 1, A, or A1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Staff Name (optional)</Label>
                            <Input
                                value={counterForm.staff_name}
                                onChange={(e) => setCounterForm({ ...counterForm, staff_name: e.target.value })}
                                placeholder="e.g., John Doe"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Active</Label>
                                <p className="text-sm text-gray-500">Counter is available for service</p>
                            </div>
                            <Switch
                                checked={counterForm.is_active}
                                onCheckedChange={(v) => setCounterForm({ ...counterForm, is_active: v })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCounterDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createCounter.mutate(counterForm)}
                            disabled={!counterForm.number || createCounter.isPending}
                            className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                        >
                            {createCounter.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Counter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Add Staff Member</DialogTitle>
                        <DialogDescription>
                            Create a login for a staff or admin user
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <div className="space-y-2">
                            <Label>Full Name*</Label>
                            <Input
                                value={staffForm.full_name}
                                onChange={(e) => {
                                    setStaffForm({ ...staffForm, full_name: e.target.value });
                                    setStaffError('');
                                }}
                                placeholder="e.g., Alice Dupont"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email*</Label>
                            <Input
                                type="email"
                                value={staffForm.email}
                                onChange={(e) => {
                                    setStaffForm({ ...staffForm, email: e.target.value });
                                    setStaffError('');
                                }}
                                placeholder="staff@institution.bi"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password*</Label>
                            <Input
                                type="password"
                                value={staffForm.password}
                                onChange={(e) => {
                                    setStaffForm({ ...staffForm, password: e.target.value });
                                    setStaffError('');
                                }}
                                placeholder="Create a password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={staffForm.role} onValueChange={(v) => setStaffForm({ ...staffForm, role: v })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STAFF">Staff</SelectItem>
                                    <SelectItem value="ADMIN">Institution Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Active</Label>
                                <p className="text-sm text-gray-500">Enable login immediately</p>
                            </div>
                            <Switch
                                checked={staffForm.active}
                                onCheckedChange={(v) => setStaffForm({ ...staffForm, active: v })}
                            />
                        </div>
                    </div>
                    {staffError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                            {staffError}
                        </p>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStaffDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => createStaff.mutate(staffForm)}
                            disabled={!staffForm.full_name || !staffForm.email || !staffForm.password || createStaff.isPending}
                            className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
                        >
                            {createStaff.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Add Staff
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function AdminSettings() {
    return (
        <AdminLayout>
            <AdminSettingsContent />
        </AdminLayout>
    );
}

