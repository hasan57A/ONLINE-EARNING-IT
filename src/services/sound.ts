// Subtle Web Audio synthesizer for interactive UI feedback
export type SoundEffectType = 'click' | 'generate' | 'copy' | 'notification';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playUiSound(type: SoundEffectType, forceVolume?: number): void {
  try {
    const rawPrefs = localStorage.getItem('oe_user_preferences_v2');
    const prefs = rawPrefs ? JSON.parse(rawPrefs) : null;
    if (prefs && prefs.soundEnabled === false && forceVolume === undefined) return;
    if (prefs && forceVolume === undefined) {
      if (type === 'click' && prefs.buttonClickSound === false) return;
      if (type === 'generate' && prefs.generateSound === false) return;
      if (type === 'copy' && prefs.copySound === false) return;
      if (type === 'notification' && prefs.notificationSound === false) return;
    }

    const volume = Math.min(1, Math.max(0.02, (forceVolume ?? prefs?.soundVolume ?? 30) / 100)) * 0.16;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      gain.gain.setValueAtTime(volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === 'copy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.05);
      gain.gain.setValueAtTime(volume * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'generate') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.setValueAtTime(987.77, now + 0.07);
      gain.gain.setValueAtTime(volume * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.19);
    }
  } catch {
    // Audio playback is optional
  }
}
