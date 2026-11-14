import React from 'react';

// Brand SVG Icons with authentic colors and geometry

export const DeviceIcons: Record<string, React.FC<{ className?: string }>> = {
  iPhone: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="1" width="14" height="22" rx="3.5" className="fill-slate-900 dark:fill-slate-950 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
      <rect x="6.5" y="2.5" width="11" height="19" rx="2" className="fill-blue-500/10 dark:fill-blue-500/20" />
      <path d="M10 2.5H14" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="12" cy="19.5" r="0.75" fill="#94A3B8" />
      {/* Apple glyph accent */}
      <path
        d="M12.4 8.7c.3-.4.5-.9.4-1.4-.4 0-.9.3-1.2.6-.3.3-.5.8-.4 1.3.4.1.9-.2 1.2-.5zm.5 1.4c-.6 0-1.1.4-1.4.4-.3 0-.8-.3-1.3-.3-.7 0-1.4.4-1.7 1.1-.8 1.4-.2 3.4.5 4.5.4.5.8 1.1 1.4 1.1.5 0 .8-.4 1.3-.4.6 0 .8.4 1.4.4.6 0 1-.5 1.3-1 .4-.6.6-1.2.6-1.2-.1 0-1.1-.4-1.1-1.7 0-1.1.9-1.6.9-1.6-.5-.8-1.3-.9-1.6-.9z"
        fill="#38BDF8"
      />
    </svg>
  ),
  iPad: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="2" width="17" height="20" rx="3" className="fill-slate-900 dark:fill-slate-950 stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" />
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" className="fill-indigo-500/10 dark:fill-indigo-500/20" />
      <circle cx="12" cy="19" r="0.75" fill="#94A3B8" />
    </svg>
  ),
  Android: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Official Android Robot Green */}
      <path
        d="M7 10v7a2 2 0 002 2h6a2 2 0 002-2v-7H7z"
        fill="#3DDC84"
      />
      <path
        d="M7.5 9h9a4.5 4.5 0 00-9 0z"
        fill="#3DDC84"
      />
      <circle cx="9.5" cy="6.8" r="0.8" fill="#0B0F19" />
      <circle cx="14.5" cy="6.8" r="0.8" fill="#0B0F19" />
      {/* Antennas */}
      <line x1="8.5" y1="4.5" x2="7" y2="2" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15.5" y1="4.5" x2="17" y2="2" stroke="#3DDC84" strokeWidth="1.5" strokeLinecap="round" />
      {/* Limbs */}
      <rect x="4.5" y="10" width="1.5" height="5" rx="0.75" fill="#3DDC84" />
      <rect x="18" y="10" width="1.5" height="5" rx="0.75" fill="#3DDC84" />
      <rect x="8.5" y="19" width="1.5" height="3" rx="0.75" fill="#3DDC84" />
      <rect x="14" y="19" width="1.5" height="3" rx="0.75" fill="#3DDC84" />
    </svg>
  ),
  Windows: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.5 4.2L10.2 3.1V11.2H2.5V4.2Z" fill="#00A4EF" />
      <path d="M11.6 2.9L21.5 1.5V11.2H11.6V2.9Z" fill="#00A4EF" />
      <path d="M2.5 12.8H10.2V20.9L2.5 19.8V12.8Z" fill="#00A4EF" />
      <path d="M11.6 12.8H21.5V22.5L11.6 21.1V12.8Z" fill="#00A4EF" />
    </svg>
  ),
  macOS: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Apple metallic silhouette */}
      <path
        d="M15.5 12.8c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6.1-3.2 1-4 2.5-1.7 3-0.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2-.1 1.7-.8 3.1-.8 1.4 0 1.9.8 3.2.7 1.3-.1 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.5-1-2.5-3.9z"
        fill="#E2E8F0"
      />
      <path
        d="M13.8 5.6c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.1 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"
        fill="#94A3B8"
      />
    </svg>
  ),
};

export const BrowserIcons: Record<string, React.FC<{ className?: string }>> = {
  Chrome: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Google Chrome official four-color emblem */}
      <circle cx="12" cy="12" r="10" fill="#EA4335" />
      <path d="M12 2C8.6 2 5.6 3.8 4 6.6L8.5 14.4H17L21.3 6.9C19.2 3.9 15.8 2 12 2Z" fill="#EA4335" />
      <path d="M21.3 6.9L12.8 21.6C16.8 21.6 20.3 19 21.7 15.2C22.2 13.9 22.4 12.5 22.3 11.1C22.1 9.6 21.6 8.2 20.7 7L21.3 6.9Z" fill="#FBBC05" />
      <path d="M12 12L4 6.6C2.7 8.2 2 10.2 2 12.3C2 17.1 5.5 21.1 10.1 21.9L14.7 14L12 12Z" fill="#34A853" />
      {/* Center White Border & Blue Core */}
      <circle cx="12" cy="12" r="5" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="4" fill="#4285F4" />
    </svg>
  ),
  Firefox: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ff-globe" cx="60%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#805AD5" />
          <stop offset="60%" stopColor="#3182CE" />
          <stop offset="100%" stopColor="#1A365D" />
        </radialGradient>
        <linearGradient id="ff-fire" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF8B00" />
          <stop offset="40%" stopColor="#FF4F00" />
          <stop offset="100%" stopColor="#D9381E" />
        </linearGradient>
      </defs>
      {/* Purple Blue Core Globe */}
      <circle cx="12" cy="12" r="8" fill="url(#ff-globe)" />
      {/* Flame Tail wrapping around */}
      <path
        d="M21.2 9.5c-.3-1.6-1.1-3-2.3-4.1-.7-.6-1.5-1.1-2.4-1.4.3.8.3 1.7.1 2.5-.2.8-.7 1.5-1.4 1.9-.3-.8-.9-1.5-1.6-2-.8-.5-1.7-.8-2.6-.7-.9.1-1.8.6-2.4 1.3-.6.7-.9 1.6-.9 2.5 0 .6.2 1.2.5 1.7-1.2.2-2.3.9-3 1.9s-.9 2.3-.6 3.5c.3 1.2 1.1 2.2 2.2 2.8s2.4.7 3.6.3c1.7-.6 3.1-1.9 3.8-3.6.4-1 .4-2.1.1-3.1 1.2 1.1 2 2.5 2.3 4.1.2 1-.1 2-.7 2.8 1.8-1.1 3-2.9 3.4-5 .4-1.6.2-3.3-.7-4.8z"
        fill="url(#ff-fire)"
      />
      <circle cx="12" cy="12" r="3" fill="#ECC94B" opacity="0.3" />
    </svg>
  ),
  Safari: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Safari blue compass disc */}
      <defs>
        <linearGradient id="safari-disc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C0FF" />
          <stop offset="100%" stopColor="#0070F3" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#safari-disc)" />
      {/* Tick Marks */}
      <circle cx="12" cy="12" r="8" stroke="#FFFFFF" strokeWidth="0.75" strokeDasharray="1 2" opacity="0.7" fill="none" />
      {/* Compass Needle: Red Top, White Bottom */}
      <polygon points="12,4 14,12 12,11 10,12" fill="#FF3B30" />
      <polygon points="12,20 14,12 12,13 10,12" fill="#FFFFFF" />
      <circle cx="12" cy="12" r="1" fill="#FFFFFF" />
    </svg>
  ),
  Edge: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="edge-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0078D7" />
          <stop offset="100%" stopColor="#00C853" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="#0078D7" opacity="0.1" />
      <path
        d="M21.5 13.8c-.4 4.3-4.1 7.7-8.6 7.7-4.8 0-8.7-3.9-8.7-8.7 0-4.6 3.6-8.4 8.2-8.7-1.9 1-3.2 2.9-3.2 5.1 0 3.2 2.6 5.8 5.8 5.8 2.4 0 4.5-1.5 5.3-3.6.8.8 1.2 1.6 1.2 2.4z"
        fill="url(#edge-blue)"
      />
      <path
        d="M17.5 10c0-3.3-2.7-6-6-6-1.5 0-2.8.5-3.9 1.4 1.1-.9 2.5-1.4 4.1-1.4 3.7 0 6.7 2.8 7 6.4-.4-.3-.8-.4-1.2-.4z"
        fill="#00BCF2"
      />
    </svg>
  ),
  Opera: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Opera Vibrant Red Ring */}
      <ellipse cx="12" cy="12" rx="9" ry="9.5" fill="#FF1B2D" />
      <ellipse cx="12" cy="12" rx="5" ry="7" fill="#0B0F19" />
    </svg>
  ),
};

export const InAppIcons: Record<string, React.FC<{ className?: string }>> = {
  Facebook: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#1877F2" />
      <path
        d="M13.5 19v-6.5h2.2l.3-2.5h-2.5V8.4c0-.7.2-1.2 1.3-1.2h1.4V5c-.2 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6V10H8.5v2.5h2.1V19h2.9z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  'Facebook Lite': ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2" />
      <circle cx="12" cy="12" r="7.5" fill="#FFFFFF" />
      <path
        d="M13 16.5v-4.5h1.5l.3-1.8H13V9c0-.5.2-.8.9-.8H15V6.6c-.2 0-.8-.1-1.5-.1-1.5 0-2.5.9-2.5 2.6v1.2H9.5v1.8H11v4.4H13z"
        fill="#1877F2"
      />
    </svg>
  ),
  Instagram: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-grad" cx="20%" cy="100%" r="130%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="25%" stopColor="#FCAF45" />
          <stop offset="50%" stopColor="#F77737" />
          <stop offset="75%" stopColor="#F56040" />
          <stop offset="85%" stopColor="#FD1D1D" />
          <stop offset="100%" stopColor="#833AB4" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
    </svg>
  ),
  Twitter: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      {/* Modern X (Twitter) black badge with white geometry */}
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000000" />
      <path
        d="M15.8 5h2.2l-4.8 5.5L18.8 19h-4.4l-3.5-4.5L7 19H4.8l5.1-5.9L4.4 5h4.5l3.1 4.2L15.8 5zm-.8 12.6h1.2L8.2 6.3H6.9l8.1 11.3z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  LinkedIn: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#0A66C2" />
      <circle cx="6.5" cy="7.5" r="1.5" fill="#FFFFFF" />
      <rect x="5" y="10.5" width="3" height="8" fill="#FFFFFF" />
      <path
        d="M10.5 10.5h2.8v1.2c.4-.7 1.3-1.4 2.8-1.4 3 0 3.5 2 3.5 4.5v3.7h-3v-3.3c0-.8 0-1.8-1.1-1.8s-1.3.8-1.3 1.7v3.4h-3v-8z"
        fill="#FFFFFF"
      />
    </svg>
  ),
  Snapchat: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#FFFC00" />
      <path
        d="M12 6c-2.3 0-3.6 1.7-3.6 3.3 0 .7.3 1.5.3 1.5s-.5.2-.7.2c-.3 0-.6-.2-.7-.2-.2 0-.4.1-.4.3 0 .5.6.8 1 .8.3 0 .5-.1.7-.2.2 1 .8 1.8 1.7 2.1-.3.2-.8.5-1.8.6-.5 0-.8.2-.8.5 0 .4.5.6 1.4.7.6 0 1.2-.1 1.7-.3.5.7 1.3 1 2.3 1s1.8-.3 2.3-1c.5.2 1.1.3 1.7.3.9-.1 1.4-.3 1.4-.7 0-.3-.3-.5-.8-.5-1-.1-1.5-.4-1.8-.6.9-.3 1.5-1.1 1.7-2.1.2.1.4.2.7.2.4 0 1-.3 1-.8 0-.2-.2-.3-.4-.3-.1 0-.4.2-.7.2s-.7-.2-.7-.2.3-.8.3-1.5C15.6 7.7 14.3 6 12 6z"
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth="0.8"
      />
    </svg>
  ),
  TikTok: ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#010101" />
      {/* Cyan offset note */}
      <path
        d="M15.5 8.2c-.7-.3-1.3-.8-1.7-1.4V14a3.8 3.8 0 11-3.8-3.8c.4 0 .7.1 1.1.2V8.1A6 6 0 1017 14V9.8c1.3.9 2.8 1.4 4.5 1.4v-2.3c-2.1 0-4-1-6-2.7z"
        fill="#00F2FE"
        transform="translate(-0.6, -0.6)"
        opacity="0.8"
      />
      {/* Pink offset note */}
      <path
        d="M15.5 8.2c-.7-.3-1.3-.8-1.7-1.4V14a3.8 3.8 0 11-3.8-3.8c.4 0 .7.1 1.1.2V8.1A6 6 0 1017 14V9.8c1.3.9 2.8 1.4 4.5 1.4v-2.3c-2.1 0-4-1-6-2.7z"
        fill="#FE0979"
        transform="translate(0.6, 0.6)"
        opacity="0.8"
      />
      {/* White center note */}
      <path
        d="M15.5 8.2c-.7-.3-1.3-.8-1.7-1.4V14a3.8 3.8 0 11-3.8-3.8c.4 0 .7.1 1.1.2V8.1A6 6 0 1017 14V9.8c1.3.9 2.8 1.4 4.5 1.4v-2.3c-2.1 0-4-1-6-2.7z"
        fill="#FFFFFF"
      />
    </svg>
  ),
};
