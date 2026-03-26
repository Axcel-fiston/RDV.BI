import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className }) {
  return (
    <Card
      className={cn(
        "border border-white/40 bg-white/80 shadow-[0_30px_80px_rgba(30,58,95,0.15)] backdrop-blur-xl",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#8a6a4d]">
              {title}
            </p>
            <p className="text-3xl font-semibold text-[#1e3a5f] mt-2">{value}</p>
            {trend && (
              <p
                className={cn(
                  "text-sm mt-2 flex items-center gap-1 font-semibold",
                  trendUp ? "text-emerald-600" : "text-rose-600"
                )}
              >
                {trendUp ? '▲' : '▼'} {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#1e3a5f]/20 to-[#d4af6a]/20">
            <Icon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
