export interface CountryGeoConfig {
  name: string;
  code: string;
  flag: string;
  dial: string;
  locale: string;
  languageName: string;
  domain: string;
  samplePhone: string;
}

export const ALL_COUNTRIES_OPTION: CountryGeoConfig = {
  name: 'All Countries',
  code: 'ALL',
  flag: '🌐',
  dial: 'Global',
  locale: 'All GEO Languages',
  languageName: 'Multi-Language / Global',
  domain: 'example.com',
  samplePhone: '+1 / +44 / +880 ...',
};

export const GLOBAL_COUNTRIES: CountryGeoConfig[] = [
  { name: 'United States', code: 'US', flag: '🇺🇸', dial: '+1', locale: 'en-US', languageName: 'English (US)', domain: 'example.com', samplePhone: '+1 (555) 019-XXXX' },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', dial: '+44', locale: 'en-GB', languageName: 'English (UK)', domain: 'example.co.uk', samplePhone: '+44 7700 900XXX' },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', dial: '+1', locale: 'en-CA', languageName: 'English / French (CA)', domain: 'example.ca', samplePhone: '+1 (555) 018-XXXX' },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', dial: '+49', locale: 'de-DE', languageName: 'German (Deutsch)', domain: 'example.de', samplePhone: '+49 152 2888XXXX' },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', dial: '+61', locale: 'en-AU', languageName: 'English (AU)', domain: 'example.com.au', samplePhone: '+61 491 570 XXX' },
  { name: 'France', code: 'FR', flag: '🇫🇷', dial: '+33', locale: 'fr-FR', languageName: 'French (Français)', domain: 'example.fr', samplePhone: '+33 6 12 34 XX XX' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', dial: '+31', locale: 'nl-NL', languageName: 'Dutch (Nederlands)', domain: 'example.nl', samplePhone: '+31 6 1234 XXXX' },
  { name: 'Poland', code: 'PL', flag: '🇵🇱', dial: '+48', locale: 'pl-PL', languageName: 'Polish (Polski)', domain: 'example.pl', samplePhone: '+48 512 345 XXX' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', dial: '+39', locale: 'it-IT', languageName: 'Italian (Italiano)', domain: 'example.it', samplePhone: '+39 312 345 XXXX' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', dial: '+34', locale: 'es-ES', languageName: 'Spanish (Español)', domain: 'example.es', samplePhone: '+34 612 34 5X XX' },
  { name: 'Bangladesh', code: 'BD', flag: '🇧🇩', dial: '+880', locale: 'bn-BD', languageName: 'Bengali (বাংলা)', domain: 'example.com.bd', samplePhone: '+880 17XX-XXXXXX' },
  { name: 'India', code: 'IN', flag: '🇮🇳', dial: '+91', locale: 'hi-IN', languageName: 'Hindi / English (IN)', domain: 'example.in', samplePhone: '+91 98XXX XXXXX' },
  { name: 'Pakistan', code: 'PK', flag: '🇵🇰', dial: '+92', locale: 'ur-PK', languageName: 'Urdu (اردو)', domain: 'example.pk', samplePhone: '+92 300 XXXXXXX' },
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', dial: '+971', locale: 'ar-AE', languageName: 'Arabic (UAE)', domain: 'example.ae', samplePhone: '+971 50 XXX XXXX' },
  { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦', dial: '+966', locale: 'ar-SA', languageName: 'Arabic (SA)', domain: 'example.sa', samplePhone: '+966 5X XXX XXXX' },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', dial: '+55', locale: 'pt-BR', languageName: 'Portuguese (BR)', domain: 'example.com.br', samplePhone: '+55 11 9XXXX-XXXX' },
  { name: 'Mexico', code: 'MX', flag: '🇲🇽', dial: '+52', locale: 'es-MX', languageName: 'Spanish (MX)', domain: 'example.mx', samplePhone: '+52 55 XXXX XXXX' },
  { name: 'Argentina', code: 'AR', flag: '🇦🇷', dial: '+54', locale: 'es-AR', languageName: 'Spanish (AR)', domain: 'example.com.ar', samplePhone: '+54 9 11 XXXX-XXXX' },
  { name: 'Colombia', code: 'CO', flag: '🇨🇴', dial: '+57', locale: 'es-CO', languageName: 'Spanish (CO)', domain: 'example.co', samplePhone: '+57 300 XXX XXXX' },
  { name: 'Chile', code: 'CL', flag: '🇨🇱', dial: '+56', locale: 'es-CL', languageName: 'Spanish (CL)', domain: 'example.cl', samplePhone: '+56 9 XXXX XXXX' },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', dial: '+81', locale: 'ja-JP', languageName: 'Japanese (日本語)', domain: 'example.jp', samplePhone: '+81 90-XXXX-XXXX' },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', dial: '+82', locale: 'ko-KR', languageName: 'Korean (한국어)', domain: 'example.kr', samplePhone: '+82 10-XXXX-XXXX' },
  { name: 'China', code: 'CN', flag: '🇨🇳', dial: '+86', locale: 'zh-CN', languageName: 'Chinese Simplified', domain: 'example.cn', samplePhone: '+86 138 XXXX XXXX' },
  { name: 'Taiwan', code: 'TW', flag: '🇹🇼', dial: '+886', locale: 'zh-TW', languageName: 'Chinese Traditional', domain: 'example.tw', samplePhone: '+886 9XX XXX XXX' },
  { name: 'Hong Kong', code: 'HK', flag: '🇭🇰', dial: '+852', locale: 'zh-HK', languageName: 'Cantonese / English', domain: 'example.hk', samplePhone: '+852 9XXX XXXX' },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', dial: '+65', locale: 'en-SG', languageName: 'English (SG)', domain: 'example.sg', samplePhone: '+65 8XXX XXXX' },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', dial: '+60', locale: 'ms-MY', languageName: 'Malay (Bahasa)', domain: 'example.my', samplePhone: '+60 12-XXX XXXX' },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', dial: '+62', locale: 'id-ID', languageName: 'Indonesian', domain: 'example.id', samplePhone: '+62 812-XXXX-XXXX' },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', dial: '+66', locale: 'th-TH', languageName: 'Thai (ไทย)', domain: 'example.th', samplePhone: '+66 8X XXX XXXX' },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', dial: '+84', locale: 'vi-VN', languageName: 'Vietnamese', domain: 'example.vn', samplePhone: '+84 9X XXX XXXX' },
  { name: 'Philippines', code: 'PH', flag: '🇵🇭', dial: '+63', locale: 'en-PH', languageName: 'English / Filipino', domain: 'example.ph', samplePhone: '+63 917 XXX XXXX' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', dial: '+90', locale: 'tr-TR', languageName: 'Turkish (Türkçe)', domain: 'example.tr', samplePhone: '+90 5XX XXX XX XX' },
  { name: 'Russia', code: 'RU', flag: '🇷🇺', dial: '+7', locale: 'ru-RU', languageName: 'Russian (Русский)', domain: 'example.ru', samplePhone: '+7 9XX XXX-XX-XX' },
  { name: 'Ukraine', code: 'UA', flag: '🇺🇦', dial: '+380', locale: 'uk-UA', languageName: 'Ukrainian', domain: 'example.ua', samplePhone: '+380 67 XXX XX XX' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', dial: '+41', locale: 'de-CH', languageName: 'German / French (CH)', domain: 'example.ch', samplePhone: '+41 79 XXX XX XX' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', dial: '+43', locale: 'de-AT', languageName: 'German (AT)', domain: 'example.at', samplePhone: '+43 664 XXXXXXX' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', dial: '+32', locale: 'nl-BE', languageName: 'Dutch / French (BE)', domain: 'example.be', samplePhone: '+32 470 XX XX XX' },
  { name: 'Sweden', code: 'SE', flag: '🇸🇪', dial: '+46', locale: 'sv-SE', languageName: 'Swedish (Svenska)', domain: 'example.se', samplePhone: '+46 70 XXX XX XX' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', dial: '+47', locale: 'nb-NO', languageName: 'Norwegian (Norsk)', domain: 'example.no', samplePhone: '+47 4XX XX XXX' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', dial: '+45', locale: 'da-DK', languageName: 'Danish (Dansk)', domain: 'example.dk', samplePhone: '+45 20 XX XX XX' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮', dial: '+358', locale: 'fi-FI', languageName: 'Finnish (Suomi)', domain: 'example.fi', samplePhone: '+358 40 XXX XXXX' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', dial: '+351', locale: 'pt-PT', languageName: 'Portuguese (PT)', domain: 'example.pt', samplePhone: '+351 91X XXX XXX' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', dial: '+353', locale: 'en-IE', languageName: 'English (IE)', domain: 'example.ie', samplePhone: '+353 87 XXX XXXX' },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', dial: '+64', locale: 'en-NZ', languageName: 'English (NZ)', domain: 'example.co.nz', samplePhone: '+64 21 XXX XXXX' },
  { name: 'Greece', code: 'GR', flag: '🇬🇷', dial: '+30', locale: 'el-GR', languageName: 'Greek (Ελληνικά)', domain: 'example.gr', samplePhone: '+30 69X XXX XXXX' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', dial: '+420', locale: 'cs-CZ', languageName: 'Czech (Čeština)', domain: 'example.cz', samplePhone: '+420 601 XXX XXX' },
  { name: 'Romania', code: 'RO', flag: '🇷🇴', dial: '+40', locale: 'ro-RO', languageName: 'Romanian (Română)', domain: 'example.ro', samplePhone: '+40 7XX XXX XXX' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺', dial: '+36', locale: 'hu-HU', languageName: 'Hungarian (Magyar)', domain: 'example.hu', samplePhone: '+36 20 XXX XXXX' },
  { name: 'South Africa', code: 'ZA', flag: '🇿🇦', dial: '+27', locale: 'en-ZA', languageName: 'English (ZA)', domain: 'example.co.za', samplePhone: '+27 82 XXX XXXX' },
  { name: 'Egypt', code: 'EG', flag: '🇪🇬', dial: '+20', locale: 'ar-EG', languageName: 'Arabic (Egypt)', domain: 'example.eg', samplePhone: '+20 10X XXX XXXX' },
  { name: 'Nigeria', code: 'NG', flag: '🇳🇬', dial: '+234', locale: 'en-NG', languageName: 'English (NG)', domain: 'example.com.ng', samplePhone: '+234 80X XXX XXXX' },
  { name: 'Kenya', code: 'KE', flag: '🇰🇪', dial: '+254', locale: 'en-KE', languageName: 'English / Swahili', domain: 'example.co.ke', samplePhone: '+254 7XX XXX XXX' },
  { name: 'Morocco', code: 'MA', flag: '🇲🇦', dial: '+212', locale: 'ar-MA', languageName: 'Arabic / French', domain: 'example.ma', samplePhone: '+212 6XX-XXXXXX' },
  { name: 'Israel', code: 'IL', flag: '🇮🇱', dial: '+972', locale: 'he-IL', languageName: 'Hebrew (עברית)', domain: 'example.co.il', samplePhone: '+972 5X-XXX-XXXX' },
  { name: 'Qatar', code: 'QA', flag: '🇶🇦', dial: '+974', locale: 'ar-QA', languageName: 'Arabic (QA)', domain: 'example.qa', samplePhone: '+974 5XXX XXXX' },
  { name: 'Kuwait', code: 'KW', flag: '🇰🇼', dial: '+965', locale: 'ar-KW', languageName: 'Arabic (KW)', domain: 'example.kw', samplePhone: '+965 5XXX XXXX' },
  { name: 'Oman', code: 'OM', flag: '🇴🇲', dial: '+968', locale: 'ar-OM', languageName: 'Arabic (OM)', domain: 'example.om', samplePhone: '+968 9XXX XXXX' },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', dial: '+94', locale: 'si-LK', languageName: 'Sinhala / Tamil', domain: 'example.lk', samplePhone: '+94 71 XXX XXXX' },
  { name: 'Nepal', code: 'NP', flag: '🇳🇵', dial: '+977', locale: 'ne-NP', languageName: 'Nepali (नेपाली)', domain: 'example.com.np', samplePhone: '+977 98XXXXXXXX' },
];

export const ALL_COUNTRIES_WITH_GLOBAL: CountryGeoConfig[] = [
  ALL_COUNTRIES_OPTION,
  ...GLOBAL_COUNTRIES,
];

export function findCountryGeo(nameOrCode: string): CountryGeoConfig {
  if (!nameOrCode || nameOrCode === 'All Countries' || nameOrCode === 'Any') {
    return ALL_COUNTRIES_OPTION;
  }
  const found = GLOBAL_COUNTRIES.find(
    c => c.name.toLowerCase() === nameOrCode.toLowerCase() || c.code.toLowerCase() === nameOrCode.toLowerCase()
  );
  return found || ALL_COUNTRIES_OPTION;
}
