import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';

/**
 * Shared Framer Motion primitives — one consistent motion language:
 * fast, subtle, ease-out, fully reduced-motion aware.
 */

export const EASE = [0.22, 1, 0.36, 1]; // signature ease-out curve used across the site

/* ------------------------------------------------------------------ */
/* Reduced-motion context (media query + in-app toggle for /admin)     */
/* ------------------------------------------------------------------ */

const MotionPrefsContext = createContext({ reduced: false, setReduced: () => {} });

export function MotionPrefsProvider({ children }) {
  const media = useReducedMotion(); // reacts to prefers-reduced-motion
  const [manual, setManual] = useState(false);

  const value = {
    reduced: Boolean(media) || manual,
    setReduced: setManual,
    isManual: manual,
    mediaReduced: Boolean(media),
  };

  return <MotionPrefsContext.Provider value={value}>{children}</MotionPrefsContext.Provider>;
}

export function useMotionPrefs() {
  return useContext(MotionPrefsContext);
}

/* ------------------------------------------------------------------ */
/* Core variants                                                       */
/* ------------------------------------------------------------------ */

const makeVariants = (reduced, y = 28, x = 0, scale) => ({
  hidden: reduced
    ? { opacity: 0 }
    : {
        opacity: 0,
        ...(y ? { y } : {}),
        ...(x ? { x } : {}),
        ...(scale ? { scale } : {}),
      },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    ...(scale ? { scale: 1 } : {}),
    transition: { duration: reduced ? 0.2 : 0.55, ease: EASE },
  },
});

/* ------------------------------------------------------------------ */
/* Reveal — the workhorse scroll-triggered entrance                    */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  as = 'div',
  className,
  delay = 0,
  y = 28,
  x = 0,
  scale,
  once = true,
  amount = 0.18,
  style,
  ...rest
}) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.div;
  const variants = makeVariants(reduced, y, x, scale);

  return (
    <Comp
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay: reduced ? 0 : delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------ */
/* Stagger — orchestrates children entrances                           */
/* ------------------------------------------------------------------ */

export function Stagger({
  children,
  className,
  as = 'div',
  gap = 0.08,
  delayChildren = 0.05,
  amount = 0.15,
  once = true,
  ...rest
}) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : gap,
            delayChildren: reduced ? 0 : delayChildren,
          },
        },
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/* Item inside a <Stagger> */
export function StaggerItem({ children, as = 'div', className, y = 24, x = 0, scale, ...rest }) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.div;
  const variants = makeVariants(reduced, y, x, scale);

  return (
    <Comp className={className} variants={variants} {...rest}>
      {children}
    </Comp>
  );
}

/* ------------------------------------------------------------------ */
/* Hover / tap primitives                                              */
/* ------------------------------------------------------------------ */

const HOVER_LIFT = { y: -6, transition: { duration: 0.25, ease: EASE } };
const TAP_PRESS = { scale: 0.96 };

/** Buttons: subtle lift + press. Pass className for styling. */
export function MotionButton({ children, className, as = 'button', ...rest }) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.button;
  return (
    <Comp
      className={className}
      whileHover={reduced ? undefined : HOVER_LIFT}
      whileTap={reduced ? undefined : TAP_PRESS}
      transition={{ duration: 0.2, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Cards/images: gentle lift on hover. */
export function HoverLift({ children, className, as = 'div', lift = 6, ...rest }) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      className={className}
      whileHover={reduced ? undefined : { y: -lift, transition: { duration: 0.25, ease: EASE } }}
      transition={{ duration: 0.25, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Image zoom frame: image scales gently on hover inside overflow-hidden frame. */
export function ZoomFrame({ children, className, amount = 1.06, ...rest }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.div
      className={`overflow-hidden ${className || ''}`}
      {...rest}
    >
      <motion.div
        whileHover={reduced ? undefined : { scale: amount }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ height: '100%' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* AnimatePresence helpers                                             */
/* ------------------------------------------------------------------ */

export { AnimatePresence, motion };

export function FadeIn({ children, className, duration = 0.25, ...rest }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: reduced ? 0.15 : duration, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Floating ambient badge (replaces .float-badge CSS). */
export function FloatBadge({ children, className, amount = 8, duration = 4 }) {
  const { reduced } = useMotionPrefs();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [-amount / 2, -amount, -amount / 2] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Standard page <section>: scroll-triggered fade-up for the whole block.
 * Drop-in replacement for <section className="max-w-7xl mx-auto px-4...">.
 */
export function MotionSection({ children, className, as = 'section', amount = 0.06, ...rest }) {
  const { reduced } = useMotionPrefs();
  const Comp = motion[as] || motion.section;
  return (
    <Comp
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: reduced ? 0.2 : 0.6, ease: EASE }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
