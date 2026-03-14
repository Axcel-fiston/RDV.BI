import React from 'react';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle2, Users } from 'lucide-react';

export default function TimeSlotGrid({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="space-y-5">
        {['Morning', 'Afternoon'].map(label => (
          <div key={label}>
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-3" />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="font-medium text-gray-500">No available slots for this date</p>
        <p className="text-sm text-gray-400 mt-1">Try selecting another day</p>
      </div>
    );
  }

  const parseHour = (time) => parseInt(time?.split(':')[0] || '0', 10);

  const morning = slots.filter(s => parseHour(s.start_time) < 12);
  const afternoon = slots.filter(s => parseHour(s.start_time) >= 12 && parseHour(s.start_time) < 17);
  const evening = slots.filter(s => parseHour(s.start_time) >= 17);

  const sections = [
    { label: '🌅 Morning', slots: morning },
    { label: '☀️ Afternoon', slots: afternoon },
    { label: '🌆 Evening', slots: evening },
  ].filter(s => s.slots.length > 0);

  return (
    <div className="space-y-6">
      {sections.map(({ label, slots: sectionSlots }) => (
        <div key={label}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {sectionSlots.map((slot) => {
              const capacity = slot.capacity ?? slot.max_bookings ?? 1;
              const bookedCount = slot.booked_count ?? slot.current_bookings ?? 0;
              const isAvailable = !slot.is_blocked && bookedCount < capacity;
              const isSelected = selectedSlot?.id === slot.id;
              const spotsLeft = capacity - bookedCount;
              const almostFull = isAvailable && spotsLeft <= 2 && capacity > 1;

              return (
                <button
                  key={slot.id}
                  onClick={() => isAvailable && onSelect(slot)}
                  disabled={!isAvailable}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-2xl py-3 px-2 text-sm font-semibold transition-all duration-200 border-2",
                    isSelected
                      ? "bg-[#1e3a5f] text-white border-[#1e3a5f] shadow-lg shadow-[#1e3a5f]/25 scale-[1.03]"
                      : isAvailable
                        ? "bg-white text-gray-700 border-gray-200 hover:border-[#1e3a5f] hover:text-[#1e3a5f] hover:shadow-md hover:scale-[1.02] cursor-pointer"
                        : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                  )}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 absolute top-1.5 right-1.5 text-white/80" />
                  )}

                  {/* Time */}
                  <span className="text-sm font-bold leading-none">{slot.start_time}</span>

                  {/* Availability hint */}
                  {isAvailable && !isSelected && (
                    <span className={cn(
                      "text-[10px] mt-1 font-medium leading-none",
                      almostFull ? "text-amber-500" : "text-green-500"
                    )}>
                      {almostFull ? `${spotsLeft} left` : 'Open'}
                    </span>
                  )}

                  {isSelected && (
                    <span className="text-[10px] mt-1 text-white/70 font-medium leading-none">Selected</span>
                  )}

                  {!isAvailable && (
                    <span className="text-[10px] mt-1 text-gray-300 font-medium leading-none">Full</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/15">
          <CheckCircle2 className="w-4 h-4 text-[#1e3a5f] flex-shrink-0" />
          <p className="text-sm font-medium text-[#1e3a5f]">
            Time slot <strong>{selectedSlot.start_time}</strong> selected
            {selectedSlot.end_time && ` – ${selectedSlot.end_time}`}
          </p>
        </div>
      )}
    </div>
  );
}
