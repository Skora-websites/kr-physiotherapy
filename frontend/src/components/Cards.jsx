import React, { useState } from 'react';
import { Reveal, Stagger, StaggerItem, MotionButton, FadeIn, useMotionPrefs, EASE } from './motion-primitives';

// Unified Section Header Component for Consistent Base Design
// size: 'page' (hero of a full page) | 'section' (in-page section heading)
export function SectionHeader({ badge, title, subtitle, align = 'center', ctaText, ctaLink, size = 'section', light = false }) {
  const centered = align !== 'left';
  const isPage = size === 'page';

  const titleCls = isPage
    ? 'text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12]'
    : 'text-2xl sm:text-3xl lg:text-[2rem] font-black tracking-tight leading-tight';
  const subCls = isPage
    ? 'mt-4 text-sm sm:text-base leading-relaxed'
    : 'mt-3 text-sm leading-relaxed';

  return (
    <Reveal className={`max-w-3xl mb-10 sm:mb-12 ${centered ? 'text-center mx-auto' : 'text-left'}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 bg-[#0084d1]/10 border border-[#0084d1]/20 text-[#0084d1] shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
          <span>{badge}</span>
        </div>
      )}
      <h2 className={`${titleCls} font-headline ${light ? 'text-white' : 'text-[#0b1c30]'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`${subCls} ${light ? 'text-slate-300' : 'text-slate-600'} ${centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
          {subtitle}
        </p>
      )}
      {ctaText && ctaLink && (
        <div className="mt-5">
          <a href={ctaLink} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d1] hover:text-[#f37021] hover:underline transition">
            <span>{ctaText}</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      )}
    </Reveal>
  );
}

// Slug-based clinical icon overrides (falls back to service.icon)
export const SERVICE_ICONS = {
  'musculoskeletal-physiotherapy': 'accessibility_new',
  'neurological-physiotherapy': 'psychology',
  'cardiorespiratory-physiotherapy': 'monitor_heart',
  'sports-physiotherapy': 'directions_run',
  'geriatric-physiotherapy': 'elderly',
  'paediatric-physiotherapy': 'child_care',
  'women-health-physiotherapy': 'pregnant_woman',
  'physiotherapy-at-home': 'home_health',
};

export const TREATMENT_ICONS = {
  'back-pain': 'airline_seat_recline_normal',
  'shoulder-pain': 'accessibility_new',
  'knee-pain': 'directions_walk',
  'neck-pain': 'self_improvement',
  'knee-ligament-injury': 'healing',
  'hijama-cupping-therapy': 'spa',
  'cerebral-palsy': 'child_care',
  'scoliosis': 'straighten',
  'bell-palsy': 'sentiment_satisfied',
};

export function ServiceCard({ service }) {
  const { reduced } = useMotionPrefs();
  const serviceImage = service.banner_image || `/images/services/${service.id || 1}.jpg`;
  const cardIcon = SERVICE_ICONS[service.slug] || service.icon || 'medical_services';

  return (
    <StaggerItem
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-[#0084d1]/50 shadow-[0_4px_20px_rgba(11,28,48,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,132,209,0.22)] transition-[box-shadow,border-color] duration-300 flex flex-col justify-between relative"
      whileHover={reduced ? undefined : { y: -6, transition: { duration: 0.25, ease: EASE } }}
    >
      {/* Top Accent Line matching logo dual-colors */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0084d1] via-[#f37021] to-[#0084d1] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>

      <div>
        {/* Real Clinical Photo on EVERY card */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={serviceImage}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/75 via-transparent to-transparent"></div>
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#0084d1] w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-lg">
              {cardIcon}
            </span>
          </div>
          <div className="absolute bottom-2.5 left-3 text-[10px] uppercase font-bold tracking-wider text-amber-300">
            Specialized Care
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-base font-bold text-[#0b1c30] font-headline mb-2 group-hover:text-[#0084d1] transition-colors leading-snug">
            {service.name}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-normal">
            {service.short_description || service.name}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
        <a
          href={`/${service.slug}.html`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d1] group-hover:text-[#f37021] group-hover:translate-x-1 transition-all"
        >
          <span>Clinical Protocols</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
        <span className="text-[10px] uppercase font-bold text-slate-400">KR Care</span>
      </div>
    </StaggerItem>
  );
}

export function TreatmentCard({ treatment }) {
  const { reduced } = useMotionPrefs();
  const treatmentImage = treatment.banner_image || '/images/back-pain.jpg';
  const cardIcon = TREATMENT_ICONS[treatment.slug] || 'healing';

  return (
    <StaggerItem
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 hover:border-[#0084d1]/50 shadow-[0_4px_20px_rgba(11,28,48,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(0,132,209,0.22)] transition-[box-shadow,border-color] duration-300 flex flex-col justify-between relative"
      whileHover={reduced ? undefined : { y: -6, transition: { duration: 0.25, ease: EASE } }}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f37021] via-[#0084d1] to-[#f37021] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>

      <div>
        {/* Real Condition Photo on EVERY treatment card */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={treatmentImage}
            alt={treatment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/75 via-transparent to-transparent"></div>
          <div className="absolute top-3 right-3 bg-[#f37021] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
            Non-Surgical
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-base font-bold text-[#0b1c30] font-headline mb-2 group-hover:text-[#0084d1] transition-colors leading-snug">
            {treatment.name}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-normal">
            {treatment.summary || 'Evidence-based non-invasive therapy protocols, joint decompression, and pain management.'}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 border-t border-slate-100">
        <a
          href={`/${treatment.slug}.html`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d1] group-hover:text-[#f37021] group-hover:translate-x-1 transition-all"
        >
          <span>View Treatment &amp; Recovery</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>
    </StaggerItem>
  );
}

export function DoctorCard({ doctor, onBook }) {
  const { reduced } = useMotionPrefs();
  const displayName = (doctor.name || 'Our Doctor').replace(/^Doctor\s+/i, 'Dr. ');
  const bioText = (doctor.bio_html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const bioPreview = bioText.substring(0, 200) + (bioText.length > 200 ? '…' : '');

  return (
    <StaggerItem
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_10px_30px_rgba(11,28,48,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,132,209,0.2)] transition-shadow duration-500 flex flex-col md:flex-row"
      whileHover={reduced ? undefined : { y: -4, transition: { duration: 0.25, ease: EASE } }}
    >
      {/* Portrait column */}
      <div className="md:w-5/12 relative bg-gradient-to-b from-slate-100 to-slate-200/60">
        <img
          src={doctor.photo_url || '/images/Dr-Neelam-Sharma2.jpg'}
          alt={displayName}
          className="w-full h-72 md:h-full object-cover object-top"
        />
        {doctor.experience_years ? (
          <div className="absolute top-4 left-4 bg-[#0b1c30]/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow">
            {doctor.experience_years}+ Years Experience
          </div>
        ) : null}
      </div>

      {/* Info column */}
      <div className="md:w-7/12 p-6 md:p-8 flex flex-col">
        <span className="text-[11px] font-bold text-[#0084d1] uppercase tracking-wider mb-1">
          {doctor.designation || 'Senior Consultant Physiotherapist'}
        </span>
        <h3 className="text-2xl font-black text-[#0b1c30] font-headline mb-1.5">
          {displayName}
        </h3>

        {/* Qualification + Experience chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0084d1]/10 text-[#0084d1] text-[11px] font-bold">
            <span className="material-symbols-outlined text-sm">school</span>
            {doctor.qualification || 'B.P.T, M.P.T, MIAP'}
          </span>
          {doctor.experience_years ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f37021]/10 text-[#f37021] text-[11px] font-bold">
              <span className="material-symbols-outlined text-sm">work_history</span>
              {doctor.experience_years}+ Years
            </span>
          ) : null}
        </div>

        {/* Bio preview (plain text, no raw HTML) */}
        <p className="text-xs text-slate-600 leading-relaxed mb-5 line-clamp-3">
          {bioPreview || 'Specialized physical therapist offering neuro rehabilitation, spine care, and mobility restoration in Noida.'}
        </p>

        {/* Contact info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 mb-5">
          {doctor.phone && (
            <a href={`tel:${doctor.phone.replace(/\s+/g, '')}`} className="inline-flex items-center gap-1 hover:text-[#0084d1] transition">
              <span className="material-symbols-outlined text-sm text-[#0084d1]">call</span>
              {doctor.phone}
            </a>
          )}
          {doctor.email && (
            <a href={`mailto:${doctor.email}`} className="inline-flex items-center gap-1 hover:text-[#0084d1] transition">
              <span className="material-symbols-outlined text-sm text-[#0084d1]">mail</span>
              {doctor.email}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-slate-100">
          <a
            href={`/${doctor.slug}.html`}
            className="px-4 py-2.5 text-xs font-bold text-[#0084d1] bg-[#0084d1]/10 hover:bg-[#0084d1]/20 rounded-xl transition"
          >
            Full Clinical Profile
          </a>
          <button
            onClick={() => onBook && onBook(displayName)}
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Book Consultation</span>
          </button>
        </div>
      </div>
    </StaggerItem>
  );
}

export function TestimonialCard({ testimonial }) {
  const { reduced } = useMotionPrefs();
  const initials = testimonial.patient_name
    ? testimonial.patient_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'PT';

  return (
    <StaggerItem
      className="group bg-white rounded-3xl p-7 border border-slate-200/80 shadow-[0_4px_20px_rgba(11,28,48,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(0,132,209,0.18)] transition-shadow duration-300 flex flex-col justify-between"
      whileHover={reduced ? undefined : { y: -5, transition: { duration: 0.25, ease: EASE } }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-[#f59e0b]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-sm fill-current">star</span>
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#16a34a] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-xs">verified</span>
            <span>Verified Patient</span>
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
          "{testimonial.testimonial_text}"
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0084d1] to-[#f37021] text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {initials}
        </div>
        <div>
          <h4 className="text-xs font-bold text-[#0b1c30] font-headline">
            {testimonial.patient_name}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            {testimonial.location || 'Noida'} {testimonial.condition_treated ? `• ${testimonial.condition_treated}` : ''}
          </span>
        </div>
      </div>
    </StaggerItem>
  );
}

export function RecoveryTracker() {
  const { reduced } = useMotionPrefs();
  const steps = [
    {
      title: 'Clinical Assessment',
      desc: 'Holistic diagnostic evaluation and musculoskeletal root-cause diagnosis.',
      image: '/images/about/assessment.jpg',
      tag: 'Step 01'
    },
    {
      title: 'Acute Pain Relief',
      desc: 'Targeted electrotherapy, dry needling & soothing manual decompression.',
      image: '/images/clinical-care.jpg',
      tag: 'Step 02'
    },
    {
      title: 'Mobility Rebuilding',
      desc: 'Progressive kinetic exercise protocols to restore full joint flexibility.',
      image: '/images/clinic-gym.jpg',
      tag: 'Step 03'
    },
    {
      title: 'Long-term Ergonomics',
      desc: 'Postural correction regimens to guard against recurring symptoms.',
      image: '/images/about/diagnosis.jpg',
      tag: 'Step 04'
    }
  ];

  return (
    <Reveal className="bg-gradient-to-br from-white via-slate-50/70 to-sky-50/30 border border-slate-200/80 rounded-3xl p-8 md:p-12 shadow-[0_10px_30px_rgba(11,28,48,0.04)]">
      <SectionHeader
        badge="Evidence-Based Methodology"
        title="The 4-Stage KR Recovery Pathway"
        subtitle="A structured clinical recovery framework designed to eliminate pain and restore durable biomechanical strength."
      />

      <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8" gap={0.1}>
        {steps.map((s, idx) => (
          <StaggerItem
            key={idx}
            className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-xs hover:border-[#0084d1]/50 hover:shadow-lg transition-[box-shadow,border-color] duration-300"
            whileHover={reduced ? undefined : { y: -5, transition: { duration: 0.25, ease: EASE } }}
          >
            <div className="relative h-36 w-full overflow-hidden bg-slate-100">
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/75 via-transparent to-transparent"></div>
              <div className="absolute top-3 left-3 bg-[#0084d1] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                {s.tag}
              </div>
            </div>
            <div className="p-5 flex flex-col justify-between flex-grow">
              <h4 className="text-sm font-bold text-[#0b1c30] font-headline mb-1.5 group-hover:text-[#0084d1] transition">
                {s.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {s.desc}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Reveal>
  );
}

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErr('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg(data.message || 'Thank you. We have received your inquiry.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setErr(data.message || 'Submission failed.');
      }
    } catch (e) {
      setErr('Connection error. Please call +91 85953 21652.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn className="bg-white p-8 md:p-10 rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(11,28,48,0.05)] space-y-4 text-xs">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#0084d1]">Direct Inquiry</span>
        <h3 className="text-2xl font-black text-[#0b1c30] font-headline mt-1">Send a Message</h3>
        <p className="text-xs text-slate-500 mt-1">Our clinical desk responds within 2 hours during clinic hours.</p>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">{err}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Rahul Verma"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0084d1] focus:border-[#0084d1] text-sm bg-slate-50/50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="name@domain.com"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0084d1] focus:border-[#0084d1] text-sm bg-slate-50/50"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0084d1] focus:border-[#0084d1] text-sm bg-slate-50/50"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="General Inquiry / Home Visit Booking"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0084d1] focus:border-[#0084d1] text-sm bg-slate-50/50"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Message *</label>
        <textarea
          rows="4"
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Please describe your health query or condition..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0084d1] focus:border-[#0084d1] text-sm bg-slate-50/50"
        ></textarea>
      </div>

      <MotionButton
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md disabled:opacity-50"
      >
        {loading ? 'Sending Message...' : 'Send Message'}
      </MotionButton>
    </FadeIn>
  );
}
