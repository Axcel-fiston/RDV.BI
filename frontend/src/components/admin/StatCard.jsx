import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, icon: Icon, trend, trendUp, className }) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <p className={cn(
                "text-sm mt-2",
                trendUp ? "text-green-600" : "text-red-600"
              )}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
