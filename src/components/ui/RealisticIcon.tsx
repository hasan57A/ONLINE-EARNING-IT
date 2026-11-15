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

// Per-tool aura colours used by the rotating premium ring + under-glow
const AURA: Record<string, [string, string]> = {
  'user-agent-generator': ['#3b82f6', '#22d3ee'],
  'lead-generator': ['#10b981', '#a3e635'],
  'text-shuffler': ['#a855f7', '#ec4899'],
  'duplicate-text-remover': ['#f59e0b', '#fb7185'],
  'number-generator': ['#06b6d4', '#6366f1'],
  'mail-generator': ['#c084fc', '#f472b6'],
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
  const sizeClass = SIZE_CLASSES[size];
  const [c1, c2] = AURA[slug] || ['#8468ff', '#c658f1'];

  if (!imgSrc) {
    return (
      <div
        className={`${sizeClass} bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 ${className}`}
      >
        {FALLBACK_ICONS[slug] || <Wrench className="w-1/2 h-1/2 text-slate-400" />}
      </div>
    );
  }

  const style = { ['--oe-c1' as string]: c1, ['--oe-c2' as string]: c2 } as React.CSSProperties;
  // Small icons stay still so sidebars and lists feel calm
  const motionOff = size === 'sm' ? { animation: 'none' } : {};

  return (
    <div
      className={`oe-icon ${sizeClass} ${className}`}
      style={{ ...style, ...motionOff }}
    >
      <div className="oe-icon-face">
        <img
          src={imgSrc}
          alt={alt || `${slug} realistic 3D icon`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Glass specular highlight */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
