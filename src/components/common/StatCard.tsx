'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    text: string;
    isPositive: boolean;
  };
  colorTheme?: 'wood' | 'forest' | 'amber' | 'blue' | 'purple' | 'rose';
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorTheme = 'wood',
  onClick,
}: StatCardProps) {
  const themeClasses = {
    wood: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-red-300',
      iconBg: 'bg-gradient-to-tr from-red-600 to-red-700 text-white shadow-red-600/20',
      accent: 'text-red-600',
    },
    forest: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-red-300',
      iconBg: 'bg-gradient-to-tr from-zinc-900 to-black text-white shadow-zinc-900/20',
      accent: 'text-zinc-900',
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-amber-300',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-amber-500/20',
      accent: 'text-amber-600',
    },
    blue: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-blue-300',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-blue-500/20',
      accent: 'text-blue-600',
    },
    purple: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-purple-300',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-purple-500 text-white shadow-purple-500/20',
      accent: 'text-purple-600',
    },
    rose: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-rose-300',
      iconBg: 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-rose-500/20',
      accent: 'text-rose-600',
    },
  }[colorTheme];

  return (
    <div
      onClick={onClick}
      className={`${themeClasses.bg} border ${themeClasses.border} rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 leading-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
          )}
        </div>

        <div
          className={`p-3 rounded-2xl shadow-lg flex items-center justify-center ${themeClasses.iconBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-bold ${
              trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
}
