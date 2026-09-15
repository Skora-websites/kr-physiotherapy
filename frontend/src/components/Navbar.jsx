import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE, MotionButton, useMotionPrefs } from './motion-primitives';

const NAV_LINKS = [
  { label: 'Home', href: '/', match: (p) => p === '/' || p === '/index.htm' },
  { label: 'About Us', href: '/about.html', match: (p) => p.startsWith('/about') },
];



export default function Navbar({ onOpenBooking }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { reduced } = useMotionPrefs();

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  const isActive = (link) => link.match && link.match(currentPath);

  const linkClass = (active) =>
    `relative px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
      active ? 'text-[#0084d1]' : 'text-slate-700 hover:text-[#0084d1]'
    }`;

  return (
    <motion.header
      initial={reduced ? { opacity: 0 } : { y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding,border-color] duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(11,28,48,0.12)] py-2.5 border-b border-slate-200/80'
          : 'bg-white py-4 border-b border-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="/"
            className="flex items-center shrink-0"
            aria-label="KR Physiotherapy Home"
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <img
              src="/images/logo1.png"
              alt="KR Physiotherapy Logo"
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </motion.a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className={linkClass(isActive(link))}>
                {link.label}
                {isActive(link) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0084d1] to-[#f37021]"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </a>
            ))}

            {/* Services */}
            <a href="/services.html" className={linkClass(currentPath.startsWith('/services'))}>
              Services
              {currentPath.startsWith('/services') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0084d1] to-[#f37021]"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </a>

            {/* Treatments */}
            <a href="/treatments.html" className={linkClass(currentPath.startsWith('/treatments'))}>
              Treatments
              {currentPath.startsWith('/treatments') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0084d1] to-[#f37021]"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </a>

            <a
              href="/blogs/index.htm"
              className={linkClass(currentPath.startsWith('/blogs'))}
            >
              Blogs
              {currentPath.startsWith('/blogs') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0084d1] to-[#f37021]"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </a>
            <a
              href="/contact.html"
              className={linkClass(currentPath.startsWith('/contact'))}
            >
              Contact
              {currentPath.startsWith('/contact') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#0084d1] to-[#f37021]"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </a>
          </nav>

          {/* Right actions */}
          <div className="hidden sm:flex items-center gap-3">
            <motion.a
              href="tel:+918595321652"
              className="flex items-center gap-2 text-xs font-bold text-[#0084d1] bg-[#0084d1]/10 hover:bg-[#0084d1]/15 px-3.5 py-2 rounded-xl transition-colors"
              whileHover={reduced ? undefined : { y: -2 }}
              whileTap={reduced ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              <span className="material-symbols-outlined text-[17px]">phone_in_talk</span>
              <span>+91 85953 21652</span>
            </motion.a>
            <MotionButton
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide shadow-[0_4px_14px_rgba(0,132,209,0.3)] hover:shadow-[0_8px_22px_rgba(0,132,209,0.4)]"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>Book Appointment</span>
              </span>
            </MotionButton>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenBooking}
              className="bg-[#0084d1] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow"
            >
              Book
            </button>
            <MotionButton
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 hover:text-[#0084d1] rounded-lg focus:outline-none"
              aria-label="Toggle Menu"
              aria-expanded={mobileMenuOpen}
            >
              <motion.span
                className="material-symbols-outlined text-2xl block"
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                {mobileMenuOpen ? 'close' : 'menu'}
              </motion.span>
            </MotionButton>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-drawer"
            initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.3, ease: EASE }}
            className="lg:hidden bg-white border-t border-slate-200 overflow-hidden shadow-2xl"
          >
            <motion.div
              variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }}
              initial="hidden"
              animate="visible"
              className="px-5 pt-3 pb-6"
            >
              {[
                { label: 'Home', href: '/' },
                { label: 'About Us', href: '/about.html' },
                { label: 'Our Services', href: '/services.html' },
                { label: 'Conditions & Treatments', href: '/treatments.html' },
                { label: 'Clinical Blogs', href: '/blogs/index.htm' },
                { label: 'Contact Clinic', href: '/contact.html' },
              ].map((l) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0, transition: { duration: 0.25, ease: EASE } },
                  }}
                  className={`block py-3 text-xs font-bold border-b border-slate-100 ${
                    currentPath === l.href ? 'text-[#0084d1]' : 'text-slate-800'
                  }`}
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
                }}
                className="pt-4"
              >
                <a
                  href="tel:+918595321652"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#0084d1]/10 text-[#0084d1] font-bold text-xs rounded-xl"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  <span>Call Helpline: +91 85953 21652</span>
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
