import { useState, useEffect } from 'react';
import { db } from '../services/db';

/**
 * Forces a lightweight re-render whenever DatabaseService commits any change
 * (pool uploads, pool consumptions, payment requests, approvals, settings).
 */
export function useDbSync(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setTick(t => t + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  return tick;
}
