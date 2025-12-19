import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  variant = 'default',
  subtitle 
}) => {
  const gradientClasses = {
    default: 'bg-card',
    primary: 'gradient-primary text-primary-foreground',
    success: 'gradient-success text-success-foreground',
    warning: 'gradient-warning text-warning-foreground',
    destructive: 'gradient-destructive text-destructive-foreground',
  };

  const iconBgClasses = {
    default: 'bg-muted',
    primary: 'bg-white/20',
    success: 'bg-white/20',
    warning: 'bg-white/20',
    destructive: 'bg-white/20',
  };

  return (
    <Card className={cn(
      "border-0 shadow-lg transition-transform hover:scale-105",
      gradientClasses[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "text-sm font-medium",
              variant === 'default' ? 'text-muted-foreground' : 'opacity-90'
            )}>
              {title}
            </p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className={cn(
                "mt-1 text-sm",
                variant === 'default' ? 'text-muted-foreground' : 'opacity-75'
              )}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-full p-3",
            iconBgClasses[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
