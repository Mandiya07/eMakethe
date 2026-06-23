import React from 'react';
import { ShieldCheck, CheckCircle, Phone } from 'lucide-react';

interface VerificationBadgeProps {
  level: 'basic' | 'verified' | 'premium';
  showText?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function VerificationBadge({ level, showText = false, showDetails = false, className = '' }: VerificationBadgeProps) {
  if (level === 'premium') {
    return (
      <div className={`flex items-center gap-1 text-amber-500 font-bold ${className}`} title="Premium: Business verified">
        <ShieldCheck size={16} className="fill-amber-100" />
        {showText && <span className="text-[10px] uppercase font-mono tracking-wider">{showDetails ? 'Premium (Business Verified)' : 'Premium'}</span>}
      </div>
    );
  }
  
  if (level === 'verified') {
    return (
      <div className={`flex items-center gap-1 text-blue-500 font-bold ${className}`} title="Verified: National ID verified">
        <CheckCircle size={16} className="fill-blue-100" />
        {showText && <span className="text-[10px] uppercase font-mono tracking-wider">{showDetails ? 'Verified (National ID)' : 'Verified'}</span>}
      </div>
    );
  }

  // basic
  return (
    <div className={`flex items-center gap-1 text-gray-500 font-bold ${className}`} title="Basic: Phone verified">
      <Phone size={14} className="text-gray-400" />
      {showText && <span className="text-[10px] uppercase font-mono tracking-wider">{showDetails ? 'Basic (Phone Verified)' : 'Basic'}</span>}
    </div>
  );
}
