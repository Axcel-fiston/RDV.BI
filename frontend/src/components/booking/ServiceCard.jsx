import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, Stethoscope, FileText, Shield, Building2, 
  CreditCard, Users, Briefcase, HeartPulse, ClipboardList,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  wallet: Wallet,
  stethoscope: Stethoscope,
  file: FileText,
  shield: Shield,
  building: Building2,
  credit: CreditCard,
  users: Users,
  briefcase: Briefcase,
  heart: HeartPulse,
  clipboard: ClipboardList,
};

export default function ServiceCard({ service, selected, onClick }) {
  const Icon = iconMap[service.icon] || FileText;

  return (
    <Card 
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 border-2 hover:border-[#1e3a5f]/30",
        selected 
          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md" 
          : "border-gray-100 hover:shadow-md"
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            selected ? "bg-[#1e3a5f]" : "bg-gray-100"
          )}>
            <Icon className={cn("w-6 h-6", selected ? "text-white" : "text-gray-500")} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold",
              selected ? "text-[#1e3a5f]" : "text-gray-900"
            )}>
              {service.name}
            </h3>
            {service.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              ~{service.duration_minutes || 30} min
            </p>
          </div>
          {selected && (
            <div className="w-6 h-6 bg-[#1e3a5f] rounded-full flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
