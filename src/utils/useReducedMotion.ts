import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Tracks the OS "reduce motion" setting so heavy looping animations can
 *  fall back to a calm static state for users who ask for less movement. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      // @ts-ignore older RN returns void from addEventListener
      sub?.remove?.();
    };
  }, []);
  return reduced;
}
