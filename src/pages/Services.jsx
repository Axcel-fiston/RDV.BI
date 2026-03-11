import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { 
  Plus, Pencil, Trash2, Layers, Clock, MoreVertical,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import AdminLayout from '@/components/admin/AdminLayout';

const ICONS = ['wallet', 'stethoscope', 'file', 'shield', 'building', 'credit', 'users', 'briefcase', 'heart', 'clipboard'];

function ServicesContent({ institution }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    icon: 'file',
    prefix: 'A',
    is_active: true
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services', institution?.id],
    queryFn: () => api.entities.Service.filter({ institution_id: institution?.id }),
    enabled: !!institution?.id
  });

  const createService = useMutation({
    mutationFn: (data) => api.entities.Service.create({
      ...data,
      institution_id: institution.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setDialogOpen(false);
      resetForm();
    }
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }) => api.entities.Service.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setDialogOpen(false);
      resetForm();
    }
  });

  const deleteService = useMutation({
    mutationFn: (id) => api.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setDeleteDialogOpen(false);
      setSelectedService(null);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 30,
      icon: 'file',
      prefix: 'A',
      is_active: true
    });
    setSelectedService(null);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      duration_minutes: service.duration_minutes || 30,
      icon: service.icon || 'file',
      prefix: service.prefix || 'A',
      is_active: service.is_active !== false
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (selectedService) {
      updateService.mutate({ id: selectedService.id, data: formData });
    } else {
      createService.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-500 mt-1">Manage the services you offer</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
          className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                    <Layers className="w-6 h-6 text-[#1e3a5f]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <Badge className="mt-1" variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(service)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedService(service);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {service.description && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{service.description}</p>
              )}

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {service.duration_minutes || 30} min
                </div>
                <div className="text-sm text-gray-500">
                  Prefix: <span className="font-medium text-gray-900">{service.prefix || 'A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-12">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No services yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first service to get started</p>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            <DialogDescription>
              {selectedService ? 'Update service details' : 'Create a new service for customers to book'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Account Opening"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the service"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Ticket Prefix</Label>
                <Input
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  maxLength={2}
                  placeholder="A"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select 
                value={formData.icon} 
                onValueChange={(v) => setFormData({ ...formData, icon: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Active</Label>
                <p className="text-sm text-gray-500">Service is available for booking</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || createService.isPending || updateService.isPending}
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            >
              {(createService.isPending || updateService.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {selectedService ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteService.mutate(selectedService.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Services() {
  return (
    <AdminLayout>
      <ServicesContent />
    </AdminLayout>
  );
}

