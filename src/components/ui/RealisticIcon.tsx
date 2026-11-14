import React from 'react';
import iconUserAgent from '../../assets/images/icon_user_agent_1794213289859.jpg';
import iconLead from '../../assets/images/icon_lead_generator_1794213311213.jpg';
import iconShuffler from '../../assets/images/icon_text_shuffler_1794213326622.jpg';
import iconDuplicate from '../../assets/images/icon_duplicate_remover_1794213341654.jpg';
import iconNumber from '../../assets/images/icon_number_generator_1794213361914.jpg';
import iconMail from '../../assets/images/icon_mail_generator_1794213378554.jpg';
import { Smartphone, Users, Shuffle, Filter, PhoneCall, Mail, Wrench } from 'lucide-react';

export const TOOL_REALISTIC_IMAGES: Record<string, string> = {
  'user-agent-generator': iconUserAgent,
  'lead-generator': iconLead,
  'text-shuffler': iconShuffler,
  'duplicate-text-remover': iconDuplicate,
  'number-generator': iconNumber,
  'mail-generator': iconMail,
};

const GLOW_COLORS: Record<string, string> = {
  'user-agent-generator': 'shadow-[0_8px_25px_-4px_rgba(59,130,246,0.5)] border-blue-500/40',
  'lead-generator': 'shadow-[0_8px_25px_-4px_rgba(16,185,129,0.5)] border-emerald-500/40',
  'text-shuffler': 'shadow-[0_8px_25px_-4px_rgba(139,92,246,0.5)] border-purple-500/40',
  'duplicate-text-remover': 'shadow-[0_8px_25px_-4px_rgba(245,158,11,0.5)] border-amber-500/40',
  'number-generator': 'shadow-[0_8px_25px_-4px_rgba(6,182,212,0.5)] border-cyan-500/40',
  'mail-generator': 'shadow-[0_8px_25px_-4px_rgba(168,85,247,0.5)] border-purple-500/40',
};

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  'user-agent-generator': <Smartphone className="w-1/2 h-1/2 text-blue-400" />,
  'lead-generator': <Users className="w-1/2 h-1/2 text-emerald-400" />,
  'text-shuffler': <Shuffle className="w-1/2 h-1/2 text-purple-400" />,
  'duplicate-text-remover': <Filter className="w-1/2 h-1/2 text-amber-400" />,
  'number-generator': <PhoneCall className="w-1/2 h-1/2 text-cyan-400" />,
  'mail-generator': <Mail className="w-1/2 h-1/2 text-purple-400" />,
};

interface RealisticIconProps {
  slug: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-16 h-16 rounded-2xl',
  xl: 'w-24 h-24 rounded-3xl',
};

export const RealisticToolIcon: React.FC<RealisticIconProps> = ({
  slug,
  size = 'md',
  className = '',
  alt,
}) => {
  const imgSrc = TOOL_REALISTIC_IMAGES[slug];
  const glow = GLOW_COLORS[slug] || 'shadow-[0_8px_25px_-4px_rgba(59,130,246,0.3)] border-slate-700';
  const sizeClass = SIZE_CLASSES[size];

  if (!imgSrc) {
    return (
      <div
        className={`${sizeClass} bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${className}`}
      >
        {FALLBACK_ICONS[slug] || <Wrench className="w-1/2 h-1/2 text-slate-400" />}
      </div>
    );
  }

  return (
    <div
      className={`relative group shrink-0 overflow-hidden border p-0.5 bg-slate-950/80 transition-all duration-300 hover:scale-105 ${sizeClass} ${glow} ${className}`}
    >
      <img
        src={imgSrc}
        alt={alt || `${slug} realistic 3D icon`}
        className="w-full h-full object-cover rounded-[inherit]"
        loading="lazy"
      />
      {/* Glossy top specular reflection */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent pointer-events-none rounded-[inherit]" />
    </div>
  );
};
