import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { 
  Plus, Clock, Trash2, ChevronLeft, ChevronRight,
  Loader2, Ban, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { cn } from '@/lib/utils';

function ScheduleContent({ institution }) {
  const queryClient = useQueryClient();
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_time: '09:00',
    end_time: '09:30',
    capacity: 1
  });
  const [blockData, setBlockData] = useState({
    slot_id: null,
    reason: ''
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const { data: timeSlots = [] } = useQuery({
    queryKey: ['timeSlots', institution?.id, format(currentWeekStart, 'yyyy-MM-dd')],
    queryFn: async () => {
      const slots = await api.entities.TimeSlot.filter({ 
        institution_id: institution?.id 
      });
      return slots.filter(s => {
        const slotDate = parseISO(s.date);
        return slotDate >= currentWeekStart && slotDate <= addDays(currentWeekStart, 6);
      });
    },
    enabled: !!institution?.id
  });

  const createSlot = useMutation({
    mutationFn: (data) => api.entities.TimeSlot.create({
      ...data,
      institution_id: institution.id
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeSlots']);
      setDialogOpen(false);
    }
  });

  const updateSlot = useMutation({
    mutationFn: ({ id, data }) => api.entities.TimeSlot.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['timeSlots']);
      setBlockDialogOpen(false);
    }
  });

  const deleteSlot = useMutation({
    mutationFn: (id) => api.entities.TimeSlot.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['timeSlots'])
  });

  const generateDefaultSlots = useMutation({
    mutationFn: async (date) => {
      const slots = [];
      for (let hour = 8; hour < 17; hour++) {
        for (let min = 0; min < 60; min += 30) {
          const start = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          const endHour = min === 30 ? hour + 1 : hour;
          const endMin = min === 30 ? 0 : 30;
          const end = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
          
          slots.push({
            institution_id: institution.id,
            date: format(date, 'yyyy-MM-dd'),
            start_time: start,
            end_time: end,
            capacity: 1
          });
        }
      }
      await api.entities.TimeSlot.bulkCreate(slots);
    },
    onSuccess: () => queryClient.invalidateQueries(['timeSlots'])
  });

  const getSlotsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeSlots.filter(s => s.date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const handleAddSlot = (date) => {
    setSelectedDate(date);
    setFormData({
      start_time: '09:00',
      end_time: '09:30',
      capacity: 1
    });
    setDialogOpen(true);
  };

  const handleCreateSlot = () => {
    createSlot.mutate({
      date: format(selectedDate, 'yyyy-MM-dd'),
      ...formData
    });
  };

  const handleBlockSlot = (slot) => {
    setBlockData({ slot_id: slot.id, reason: '' });
    setBlockDialogOpen(true);
  };

  const handleConfirmBlock = () => {
    updateSlot.mutate({
      id: blockData.slot_id,
      data: { is_blocked: true, block_reason: blockData.reason }
    });
  };

  const handleUnblockSlot = (slot) => {
    updateSlot.mutate({
      id: slot.id,
      data: { is_blocked: false, block_reason: null }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule & Time Slots</h1>
          <p className="text-gray-500 mt-1">Manage your available appointment times</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold text-gray-900">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
            </h3>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {weekDays.map((day) => {
          const daySlots = getSlotsForDate(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const isPast = day < new Date() && !isToday;

          return (
            <Card 
              key={day.toISOString()} 
              className={cn(
                "border-0 shadow-sm",
                isToday && "ring-2 ring-[#1e3a5f]",
                isPast && "opacity-60"
              )}
            >
              <CardHeader className="p-3 pb-0">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</p>
                  <p className={cn(
                    "text-lg font-semibold",
                    isToday ? "text-[#1e3a5f]" : "text-gray-900"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                {daySlots.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {daySlots.map((slot) => (
                      <div 
                        key={slot.id}
                        className={cn(
                          "p-2 rounded-lg text-xs flex items-center justify-between group",
                          slot.is_blocked 
                            ? "bg-red-50 text-red-700"
                            : slot.booked_count >= slot.capacity
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-50 text-gray-700"
                        )}
                      >
                        <span className="font-medium">{slot.start_time}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {slot.is_blocked ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUnblockSlot(slot)}
                            >
                              <Clock className="w-3 h-3" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-orange-600"
                              onClick={() => handleBlockSlot(slot)}
                            >
                              <Ban className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-red-600"
                            onClick={() => deleteSlot.mutate(slot.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-2">No slots</p>
                )}

                {!isPast && (
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleAddSlot(day)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                    {daySlots.length === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        onClick={() => generateDefaultSlots.mutate(day)}
                        disabled={generateDefaultSlots.isPending}
                      >
                        {generateDefaultSlots.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <Calendar className="w-3 h-3 mr-1" />
                            Auto
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Bookings</Label>
              <Input
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 1 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateSlot}
              disabled={createSlot.isPending}
              className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            >
              {createSlot.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block Slot Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Block Time Slot</DialogTitle>
            <DialogDescription>
              This will make the slot unavailable for booking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={blockData.reason}
                onChange={(e) => setBlockData({ ...blockData, reason: e.target.value })}
                placeholder="e.g., Staff unavailable"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmBlock}
              disabled={updateSlot.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateSlot.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Block Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Schedule() {
  return (
    <AdminLayout>
      <ScheduleContent />
    </AdminLayout>
  );
}

