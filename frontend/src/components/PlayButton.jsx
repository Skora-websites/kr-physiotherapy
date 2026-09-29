import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * PlayButton — reusable "play video" affordance.
 *
 * Pure visual component (span-based) so it can sit inside any button/link.
 * Design: brand gradient disc (blue → orange), white ring, colored glow,
 * a soft pulsing halo, and a crisp SVG triangle (optically centered).
 *
 * Props:
 *  - size:  'sm' | 'md' | 'lg'  (side cards / default / hero centre)
 *  - pulse: show the pulsing halo (default true)
 *  - className: extra classes on the outer wrapper
 *
 * Hover: add `group` on the parent button/link — the disc scales up on
 * `group-hover` automatically.
 */

const SIZES = {
  sm: { box: 'w-10 h-10', icon: 'w-3.5 h-3.5', ring: 'ring-2' },
  md: { box: 'w-14 h-14', icon: 'w-5 h-5', ring: 'ring-[3px]' },
  lg: { box: 'w-16 h-16 md:w-20 md:h-20', icon: 'w-7 h-7 md:w-9 md:h-9', ring: 'ring-4' },
};

export default function PlayButton({ size = 'lg', pulse = true, className = '' }) {
  const reduced = useReducedMotion();
  const s = SIZES[size] || SIZES.lg;

  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Soft pulsing halo (disabled for reduced-motion users) */}
      {pulse && !reduced && (
        <motion.span
          aria-hidden="true"
          className={`absolute inset-0 rounded-full bg-white/40`}
          animate={{ scale: [1, 1.5], opacity: [0.45, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* Gradient disc */}
      <span
        className={`relative ${s.box} ${s.ring} rounded-full flex items-center justify-center
          bg-gradient-to-br from-[#0084d1] via-[#0ea5e9] to-[#f37021]
          ring-white/30 shadow-[0_10px_30px_rgba(0,132,209,0.5)]
          transition-transform duration-200 group-hover:scale-110`}
      >
        {/* Play triangle (SVG for crisp rendering at any size) */}
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className={`${s.icon} text-white translate-x-[1.5px] drop-shadow-sm`}
        >
          <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14z" />
        </svg>
      </span>
    </span>
  );
}
