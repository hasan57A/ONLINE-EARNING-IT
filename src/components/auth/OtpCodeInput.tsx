import React, { useRef } from 'react';

interface OtpCodeInputProps {
  value: string;
  onChange: (nextValue: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export const OtpCodeInput: React.FC<OtpCodeInputProps> = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  autoFocus = true,
}) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const focusIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(5, index));
    inputRefs.current[clamped]?.focus();
    inputRefs.current[clamped]?.select();
  };

  const handleDigitChange = (index: number, raw: string) => {
    if (disabled) return;
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    if (cleaned.length > 1) {
      const merged = (value.slice(0, index) + cleaned).slice(0, 6);
      onChange(merged);
      focusIndex(Math.min(5, index + cleaned.length));
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    onChange(next.join(''));
    if (index < 5) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const next = [...digits];
        next[index - 1] = '';
        onChange(next.join(''));
        focusIndex(index - 1);
      } else if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      focusIndex(Math.min(5, pasted.length));
    }
  };

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5" role="group" aria-label="6-digit OTP code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={el => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          value={digit}
          onChange={e => handleDigitChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          aria-label={`OTP digit ${index + 1}`}
          className={`h-12 sm:h-14 w-full text-center font-mono text-xl sm:text-2xl font-extrabold tabular-nums rounded-xl bg-slate-950 border transition-all outline-none ${
            hasError
              ? 'border-rose-500/70 text-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/25'
              : digit
              ? 'border-violet-500/70 text-slate-100 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30'
              : 'border-slate-800 text-slate-100 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
};
