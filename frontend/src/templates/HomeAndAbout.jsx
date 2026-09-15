import React, { useEffect, useState } from 'react';
import { SectionHeader, ServiceCard, TreatmentCard, TestimonialCard, RecoveryTracker } from '../components/Cards';
import { Reveal, Stagger, MotionButton, FloatBadge, MotionSection } from '../components/motion-primitives';

export function HomeTemplate({ onBook }) {
  const [services, setServices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(d => d.success && setServices(d.data));
    fetch('/api/treatments').then(r => r.json()).then(d => d.success && setTreatments(d.data));
    fetch('/api/testimonials').then(r => r.json()).then(d => d.success && setTestimonials(d.data));
  }, []);

  useEffect(() => {
  }, [services, treatments]);

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Elevated Classy Hero Section - Dual Blue & Orange Theme */}
      <MotionSection className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/30 pt-28 sm:pt-32 pb-20 border-b border-slate-200/80">
        {/* Ambient Glow Orbs matching logo Cerulean Blue & Vitality Orange */}
        <div className="absolute -top-32 right-0 w-[550px] h-[550px] bg-[#0084d1]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
        <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] bg-[#f37021]/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Narrative */}
            <div className="lg:col-span-7 space-y-7" >
              {/* Live Availability Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-xs text-xs font-semibold text-slate-700">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0084d1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0084d1]"></span>
                </span>
                <span className="tracking-wide uppercase text-[11px] font-bold text-slate-800">
                  Leading Physiotherapy &amp; Rehabilitation Clinic in Noida
                </span>
              </div>

              {/* Display Headline themed to logo dual colors */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0b1c30] font-headline tracking-tight leading-[1.12]">
                Physiotherapy, Rehabilitation and{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0084d1] via-[#0284c7] to-[#f37021]">
                  Physiotherapy at Home
                </span>{' '}
                in Noida
              </h1>

              {/* Subheading / Value Proposition */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
                Personalized physical rehabilitation under senior specialist <strong className="text-slate-900 font-semibold">Dr. Neelam Sharma</strong>. Restoring pain-free joint movement, spinal mobility, and neurological recovery with non-surgical protocols.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <MotionButton
                  onClick={() => onBook()}
                 className="px-8 py-4 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-[0_10px_25px_rgba(0,132,209,0.3)] hover:shadow-[0_15px_35px_rgba(0,132,209,0.4)] transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Book Consultation</span>
                </MotionButton>
                <a
                  href="/physiotherapy-at-home.html"
                  className="px-7 py-4 bg-white/90 hover:bg-white text-[#0b1c30] hover:text-[#0084d1] border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs hover:shadow-md transition flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-[#f37021]">home_health</span>
                  <span>Request Home Visit</span>
                </a>
              </div>

              {/* Stats Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80">
                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-black text-[#0084d1] font-headline">12+</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Years Experience</div>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-black text-[#0084d1] font-headline">5,000+</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Recoveries</div>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-black text-[#f37021] font-headline">5.0 ★</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">224+ Reviews</div>
                </div>
                <div className="p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-slate-100">
                  <div className="text-2xl sm:text-3xl font-black text-[#16a34a] font-headline">7 Days</div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Active Clinic</div>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Interactive Hero Visual */}
            <div className="lg:col-span-5 relative" >
              <div className="tilt-3d relative rounded-3xl p-3 bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(11,28,48,0.15)]">
                <div className="rounded-2xl overflow-hidden relative">
                  <img
                    src="/images/clinic-gym.jpg"
                    alt="KR Physiotherapy Rehabilitation Centre"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Modern Rehabilitation Center</span>
                    <h3 className="text-base font-bold font-headline mt-0.5">Kisan Tower, Sector 51 Noida</h3>
                  </div>
                </div>

                {/* Floating Badge 1: Top Right */}
                <div className="absolute -top-5 -right-5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0084d1] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0b1c30]">MIAP Certified</div>
                    <div className="text-[10px] text-slate-500 font-medium">Registered Practice</div>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Left */}
                <div className="absolute -bottom-5 -left-5 bg-[#0b1c30]/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f37021]/20 text-[#f37021] flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">star</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">5.0 Star Rating</div>
                    <div className="text-[10px] text-slate-400">224+ Patient Reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* 2. Visual Center Facilities Showcase Strip */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { title: 'Rehab Gymnasium', sub: 'Kinetic Rebuilding', img: '/images/clinic-gym.jpg' },
            { title: 'Manual Therapy Suite', sub: 'Spinal Alignment', img: '/images/clinical-care.jpg' },
            { title: 'Traction & Electrotherapy', sub: 'Pain Decompression', img: '/images/about/electrotherapy.jpg' },
            { title: 'Neuro Recovery Bay', sub: 'Paralysis & Stroke Care', img: '/images/about/neuro-rehab.jpg' }
          ].map((item, idx) => (
            <div key={idx} className="tilt-3d group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200">
              <div className="h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/90 via-[#0b1c30]/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase font-bold text-[#f37021] tracking-wider">{item.sub}</span>
                <h4 className="text-xs sm:text-sm font-bold font-headline mt-0.5">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </MotionSection>

      {/* 3. Services — 4 featured + why-it-works panel */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Specialized Care"
          title="Comprehensive Clinical Physiotherapy"
          subtitle="Engineered protocols across sports, neuro, orthopaedic and post-surgical rehabilitation."
          ctaText="View All 8 Clinical Services"
          ctaLink="/services.html"
        />
        <Stagger gap={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </Stagger>

        {/* Why our approach works — narrative, not another card row */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-[#0b1c30] font-headline">Treatment That Targets the Cause, Not Just the Symptom</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Most recurring pain returns because only the symptoms were treated. Every KR plan begins with a biomechanical assessment that finds the true source — then combines hands-on therapy with the right technology and a progressive exercise programme.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              You leave every session knowing what was treated, why it worked, and exactly what to do next — at the clinic or at home.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: 'troubleshoot', title: 'Assessment First', desc: '45-minute root-cause evaluation before any treatment plan.' },
              { icon: 'handyman', title: 'Hands-On Therapy', desc: 'Mobilisation, dry needling and cupping by certified therapists.' },
              { icon: 'monitor_heart', title: 'Measured Progress', desc: 'Re-assessed every 4 sessions — you see the improvement.' },
              { icon: 'home_health', title: 'Home Continuity', desc: 'Same protocol continues at home when travel is difficult.' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-base">{f.icon}</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0b1c30]">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* 4. 4-Stage Recovery Pathway - With real clinical photos */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RecoveryTracker />
      </MotionSection>

      {/* 5. Treatments — 3 featured + conditions content + CTA strip */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Targeted Interventions"
          title="Non-Surgical Pain Management"
          subtitle="Effective treatment for severe musculoskeletal disorders and chronic acute pain syndromes."
          ctaText="Explore All Conditions"
          ctaLink="/treatments.html"
        />
        <Stagger gap={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {treatments.slice(0, 3).map((t) => (
            <TreatmentCard key={t.id} treatment={t} />
          ))}
        </Stagger>

        {/* What we treat — compact two-column condition index */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-10">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-[#0b1c30] font-headline">Conditions We Treat Every Day</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              From a nagging stiff neck to long-standing sciatica, most painful conditions respond fully to structured physiotherapy — without injections or surgery. We treat the joint, the muscle and the nerve together, because pain rarely comes from just one of them.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Not sure where your pain fits? A single evaluation session gives you a clear diagnosis and an honest recovery estimate — before you commit to any programme.
            </p>
            <button onClick={() => onBook()} className="mt-2 px-7 py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Book Your Evaluation
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 self-center">
            {[
              'Back pain & sciatica', 'Neck & shoulder stiffness', 'Knee pain & ligament injuries',
              'Frozen shoulder', 'Slipped disc & nerve pain', 'Sports & gym injuries',
              'Post-fracture stiffness', 'Stroke & paralysis rehab', "Bell's palsy & facial palsy",
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 py-1 border-b border-slate-100">
                <span className="material-symbols-outlined text-sm text-[#16a34a]">check_circle</span>
                {c}
              </div>
            ))}
          </div>
        </div>
      </MotionSection>

      {/* 7. Facility + booking CTA panel (compact gallery) */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Compact gallery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
              <div className="h-40 sm:h-52 overflow-hidden">
                <img src="/images/slider/slider-1.jpg" alt="Clinical assessment bay at KR Physiotherapy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm group mt-6">
              <div className="h-40 sm:h-52 overflow-hidden">
                <img src="/images/slider/slider-2.jpg" alt="Electrotherapy suites at KR Physiotherapy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm group -mt-3">
              <div className="h-40 sm:h-52 overflow-hidden">
                <img src="/images/slider/slider-3.jpg" alt="Rehabilitation gymnasium at KR Physiotherapy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              </div>
            </div>
            <div className="rounded-2xl bg-[#0b1c30] text-white p-5 flex flex-col justify-center gap-2 shadow-sm">
              <div className="text-2xl font-black text-[#f37021] font-headline">8:30–8:30</div>
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Open Mon–Sun</div>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">Kisan Tower, Sector 51 — free parking, ATM in building, near Sector-34 Metro.</p>
            </div>
          </div>

          {/* Booking panel */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0b1c30] p-8 sm:p-10 text-white flex flex-col justify-center">
            <div className="absolute inset-0 z-0">
              <img src="/images/clinic-gym.jpg" alt="" className="w-full h-full object-cover opacity-15" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#0b1c30] via-[#0b1c30]/90 to-[#0084d1]/40"></div>
            </div>
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-950/60 border border-amber-600/50">
                <span className="material-symbols-outlined text-sm">alarm</span>
                Same-Day Appointments
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-headline tracking-tight leading-tight">Start Recovery This Week</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                Call for a same-day slot, or book online and our desk confirms within 2 hours during clinic time. Transparent fees — no package pressure.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button onClick={() => onBook()} className="px-7 py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">calendar_month</span>
                  Book Appointment
                </button>
                <a href="tel:+918595321652" className="px-7 py-3.5 bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/20 transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">call</span>
                  +91 85953 21652
                </a>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* 8. Authentic Testimonials Section */}
      <MotionSection className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Patient Outcomes"
            title="Real Patient Testimonials"
            subtitle="Verified reviews from patients treated for back stiffness, neuro rehabilitation, and mobility recovery."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((tm) => (
              <TestimonialCard key={tm.id} testimonial={tm} />
            ))}
          </div>
        </div>
      </MotionSection>

      {/* 9. High-Impact Visual Clinic Booking Banner */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 text-white shadow-2xl border border-slate-800">
          {/* Real Clinic Backdrop Photograph */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/slider/slider-1.jpg"
              alt="KR Physiotherapy Clinic Background"
              className="w-full h-full object-cover brightness-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30]/95 via-[#0b1c30]/85 to-[#0084d1]/70"></div>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-600/50">
                <span className="material-symbols-outlined text-sm">alarm</span>
                <span>Immediate Consultation Available</span>
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-headline tracking-tight leading-tight">
                Experience Relief From Chronic Pain Today
              </h2>
              <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
                Visit our central clinic in Sector 51 Noida or request specialized home physiotherapy. Transparent fees, compassionate doctors, zero waiting lines.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-3 text-xs sm:text-sm">
                <a href="tel:+918595321652" className="flex items-center gap-2 text-amber-300 font-bold hover:underline">
                  <span className="material-symbols-outlined text-lg">call</span>
                  <span>+91 85953 21652</span>
                </a>
                <span className="text-slate-400">•</span>
                <span className="text-slate-200">Open Mon - Sun: 8:30am - 8:30pm</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                onClick={() => onBook()}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 whitespace-nowrap"
              >
                Book Appointment Now
              </button>
            </div>
          </div>
        </div>
      </MotionSection>
    </div>
  );
}

export function AboutTemplate({ page, onBook }) {
  const isAboutPage = page?.path === '/about.html' || page?.slug === 'about';

  return (
    <div className="space-y-16 pb-20 pt-28">

      {/* ═══════════════════════════════════════════════════════
          HERO — Split layout: narrative left, team visual right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left: Narrative */}
            <div className="lg:col-span-7 space-y-6 ">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#0084d1] bg-[#0084d1]/10 border border-[#0084d1]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                About KR Physiotherapy
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b1c30] font-headline tracking-tight leading-[1.15]">
                {page?.title || 'About KR Physiotherapy & Rehabilitation Clinic'}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
                {page?.subtitle || 'Noida Sector 51\u2019s trusted centre for non-surgical pain relief, neuro recovery & home care.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
                  <span className="material-symbols-outlined text-sm text-[#0084d1]">schedule</span> Mon–Sun: 8:30am – 8:30pm
                </span>
                <a href="tel:+918595321652" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0084d1]">
                  <span className="material-symbols-outlined text-sm">call</span> +91 85953 21652
                </a>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
                  <span className="material-symbols-outlined text-sm text-[#f37021]">location_on</span> Sector-51, Noida
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <MotionButton onClick={() => onBook()}className="px-7 py-3.5 bg-[#0084d1] hover:bg-[#006cb0] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#0084d1]/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_month</span>
                  Consult Our Specialists
                </MotionButton>
                <a href="/physiotherapy-at-home.html" className="px-7 py-3.5 bg-white border border-slate-200 text-[#0b1c30] text-xs font-bold uppercase tracking-wider rounded-xl hover:border-[#0084d1] hover:text-[#0084d1] transition flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#f37021]">home_health</span>
                  Request Home Visit
                </a>
              </div>
            </div>

            {/* Right: Team Visual with floating badges */}
            <div className="lg:col-span-5 relative ">
              <div className="rounded-3xl relative" >
                <img
                  src="/images/about/welcome-team.jpg"
                  alt="Dr. Neelam Sharma and the KR Physiotherapy team"
                  className="w-full h-[420px] object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-transparent to-transparent rounded-3xl"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Senior Physiotherapist &amp; Team</span>
                  <h2 className="text-base font-bold font-headline mt-0.5">Dr. Neelam Sharma · Sector 51, Noida</h2>
                </div>
              </div>

              {/* Floating badge: certification */}
              <div className="absolute -top-5 -right-3 sm:-right-5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0084d1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">verified</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0b1c30]">MIAP Certified</div>
                  <div className="text-[10px] text-slate-500 font-medium">Registered Practice</div>
                </div>
              </div>

              {/* Floating badge: rating */}
              <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-[#0b1c30]/95 backdrop-blur-xl border border-slate-700/80 text-white rounded-2xl p-3.5 shadow-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f37021]/20 text-[#f37021] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">star</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white">5.0 Star Rating</div>
                  <div className="text-[10px] text-slate-400">224+ Patient Reviews</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: '12+', label: 'Years Experience', icon: 'history', color: 'text-[#0084d1]', bg: 'bg-[#0084d1]/10' },
            { val: '5,000+', label: 'Patients Recovered', icon: 'groups', color: 'text-[#16a34a]', bg: 'bg-[#16a34a]/10' },
            { val: '5.0 ★', label: 'Google Rating', icon: 'star', color: 'text-[#f37021]', bg: 'bg-[#f37021]/10' },
            { val: '7 Days', label: 'Open Every Day', icon: 'calendar_month', color: 'text-[#7c3aed]', bg: 'bg-[#7c3aed]/10' },
          ].map((s, i) => (
            <div key={i} className={`bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow`}>
              <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <div>
                <p className={`text-xl sm:text-2xl font-black font-headline ${s.color}`}>{s.val}</p>
                <p className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          WELCOME — Visual collage left, icon-card copy right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Collage */}
          <Reveal x={40} className="relative mb-8 lg:mb-10">
            <div className="rounded-2xl" >
              <img
                src="/images/about/therapy-session.jpg"
                alt="One-on-one physiotherapy session at KR Physiotherapy Noida"
                className="w-full h-[360px] object-cover rounded-2xl"
              />
            </div>
            <div className="img-reveal rounded-2xl absolute -bottom-10 -right-3 sm:-right-6 w-44 sm:w-52 border-4 border-white shadow-2xl overflow-hidden">
              <img
                src="/images/about/assessment.jpg"
                alt="Clinical assessment at KR Physiotherapy"
                className="w-full h-36 sm:h-40 object-cover"
              />
            </div>
            <div className="absolute -top-5 -left-3 sm:-left-5 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl px-4 py-3 shadow-xl">
              <div className="text-xl font-black text-[#0084d1] font-headline leading-none">12+</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Years of Care</div>
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal x={-40} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0084d1]/10 text-[11px] font-bold uppercase tracking-widest text-[#0084d1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              Welcome
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              Welcome to KR Physiotherapy &amp; Rehabilitation Clinic
            </h2>
            <p className="text-[15px] text-slate-600 leading-[1.8]">
              Physiotherapy — popularly known as medical therapy — helps patients rehabilitate from disease, injury, disability and chronic pain. Our physiotherapists have a deep understanding of how the body works, and how to restore it when it stops working properly.
            </p>
            <div className="space-y-3 pt-1">
              {[
                { icon: 'healing', title: 'Recover From Pain & Injury', desc: 'Ligament injuries, post-surgical rehab and musculoskeletal conditions.' },
                { icon: 'psychology', title: 'Neurological Recovery', desc: 'Stroke, paralysis and nerve-related conditions with dedicated protocols.' },
                { icon: 'monitor_heart', title: 'Chronic & Acute Care', desc: 'Long-standing pain as well as sudden acute problems, for all ages.' },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow`}>
                  <div className="w-10 h-10 rounded-lg bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1c30] font-headline">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          BEST SERVICE — Dark visual band with metric cards
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal y={0} scale={0.96} className="relative overflow-hidden rounded-3xl bg-[#0b1c30] p-8 sm:p-12 text-white shadow-2xl">
          {/* Backdrop photograph */}
          <div className="absolute inset-0 z-0">
            <img src="/images/about/doctor-consult.jpg" alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30] via-[#0b1c30]/90 to-[#0b1c30]/70"></div>
          </div>

          <div className="relative z-10">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f37021]/15 border border-[#f37021]/30 text-[11px] font-bold uppercase tracking-widest text-[#f37021]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
                Why Patients Choose Us
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tight">Best Physiotherapy Service in Noida</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Highly qualified therapists, honest guidance and treatment that works — for people of all ages, from children to seniors.
              </p>
            </div>

            <Stagger gap={0.1} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: 'school', title: 'Qualified Specialists', desc: 'MIAP-certified physiotherapists with deep hands-on clinical experience.' },
                { icon: 'troubleshoot', title: 'Assessment-First Approach', desc: 'We know how each body part works — and exactly how to restore it.' },
                { icon: 'diversity_3', title: 'Care for Every Age', desc: 'Managing pain and preventing disease across every stage of life.' },
              ].map((c, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#f37021]/20 text-[#f37021] flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-lg">{c.icon}</span>
                  </div>
                  <h3 className="text-sm font-bold font-headline">{c.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{c.desc}</p>
                </div>
              ))}
            </Stagger>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-start gap-3 max-w-3xl">
              <span className="material-symbols-outlined text-[#f37021] text-2xl">format_quote</span>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed italic">
                Proper assessment, knowledge and experience — that is what makes physiotherapy truly effective.
              </p>
            </div>
          </div>
        </Reveal>
      </MotionSection>


      {/* ═════════════════════════════════════════════════════
          MEET THE TEAM — Dedicated section for each doctor
      ═════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Clinical Leadership"
          title="Meet Our Physiotherapists"
          subtitle="Two dedicated clinicians, one standard of care — accurate diagnosis, honest guidance and hands-on treatment that works."
        />
        <div className="space-y-10">
          {/* ── Dr. Neelam Sharma ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(11,28,48,0.05)] overflow-hidden">
            {/* Portrait */}
            <div className="lg:col-span-4 relative min-h-[320px]">
              <img src="/images/Dr-Neelam-Sharma2.jpg" alt="Dr. Neelam Sharma, Senior Consultant Physiotherapist" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#0b1c30]/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">12+ Years Experience</span>
                <span className="bg-white/95 backdrop-blur-md text-[#0084d1] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow flex items-center gap-1.5"><span className="material-symbols-outlined text-xs">verified</span> MIAP Certified</span>
              </div>
            </div>
            {/* Profile */}
            <div className="lg:col-span-8 p-7 sm:p-9 flex flex-col">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-[#0b1c30] font-headline">Dr. Neelam Sharma</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Senior Consultant Physiotherapist &amp; Clinical Director</p>
                </div>
                <a href="/doctor-neelam-sharma.html" className="px-4 py-2 text-xs font-bold text-[#0084d1] bg-[#0084d1]/10 hover:bg-[#0084d1]/20 rounded-xl transition shrink-0">Full Profile →</a>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                Specialising in orthopaedic, neurological, geriatric and paediatric rehabilitation, Dr. Neelam Sharma leads the clinic with modern, evidence-based treatment — and personally trains the team that works under her guidance.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Manual Therapy', 'Dry Needling', 'Cupping / Hijama', 'Chiropractic', 'Electrotherapy (US, IFT, TENS, Laser)', 'Kinesio Taping'].map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 rounded-full">{t}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {[{ v: 'B.P.T, M.P.T (Neuro)', l: 'Qualification' }, { v: '5,000+', l: 'Patients Treated' }, { v: '5.0 ★', l: 'Google Rating' }].map((s, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div className="text-sm font-black text-[#0084d1] font-headline truncate">{s.v}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => onBook('Dr. Neelam Sharma')} className="px-6 py-3 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">calendar_month</span> Book with Dr. Neelam</button>
                <a href="tel:+918595321652" className="px-5 py-3 bg-white border border-slate-200 text-xs font-bold text-[#0b1c30] rounded-xl hover:border-[#0084d1] hover:text-[#0084d1] transition flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#f37021]">call</span> +91 85953 21652</a>
              </div>
            </div>
          </div>
          {/* ── Dr. Anamika ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(11,28,48,0.05)] overflow-hidden">
            {/* Profile (text-first, mirrored layout) */}
            <div className="lg:col-span-8 p-7 sm:p-9 flex flex-col order-2 lg:order-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-black text-[#0b1c30] font-headline">Dr. Anamika</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Consultant Physiotherapist — Orthopaedic &amp; Sports Rehab</p>
                </div>
                <a href="/doctor-anamika.html" className="px-4 py-2 text-xs font-bold text-[#0084d1] bg-[#0084d1]/10 hover:bg-[#0084d1]/20 rounded-xl transition shrink-0">Full Profile →</a>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mt-4">
                A Bachelor of Physiotherapy graduate from one of Delhi NCR’s leading colleges, Dr. Anamika brings sharp clinical assessment skills and a patient-first approach to every session.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Manual Therapy', 'Physiotherapy Modalities', 'Kinesio Taping', 'Post-Surgical Rehab', 'Sports Injury Care'].map((t, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 rounded-full">{t}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                {[{ v: 'B.P.T', l: 'Qualification' }, { v: '8+', l: 'Years Experience' }, { v: 'M.P.T (Ortho)', l: 'Specialisation' }].map((s, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <div className="text-sm font-black text-[#f37021] font-headline truncate">{s.v}</div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6 flex flex-wrap items-center gap-3">
                <button onClick={() => onBook('Dr. Anamika')} className="px-6 py-3 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">calendar_month</span> Book with Dr. Anamika</button>
                <a href="tel:+918595321652" className="px-5 py-3 bg-white border border-slate-200 text-xs font-bold text-[#0b1c30] rounded-xl hover:border-[#f37021] hover:text-[#f37021] transition flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#0084d1]">call</span> +91 85953 21652</a>
              </div>
            </div>
            {/* Portrait */}
            <div className="lg:col-span-4 relative min-h-[320px] order-1 lg:order-2">
              <img src="/images/Dr-anamika.png" alt="Dr. Anamika, Consultant Physiotherapist" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="bg-[#0b1c30]/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow">8+ Years Experience</span>
                <span className="bg-white/95 backdrop-blur-md text-[#0084d1] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow flex items-center gap-1.5"><span className="material-symbols-outlined text-xs">verified</span> MIAP Certified</span>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      {/* ═══════════════════════════════════════════════════════
          OUR MISSION — Dark split panel with 3 pillars
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-[#0b1c30] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">

          {/* Mission copy */}
          <Reveal x={40} className="p-8 sm:p-12 text-white space-y-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f37021]/15 border border-[#f37021]/30 text-[11px] font-bold uppercase tracking-widest text-[#f37021] self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              Our Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-black font-headline tracking-tight leading-tight">
              Restoring Movement.<br />Restoring Life.
            </h2>
            <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
              KR Physiotherapy &amp; Rehabilitation Clinic aims to optimise the work and well-being of every patient — so they can return to their chosen lifestyle activities.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: 'home', label: 'Return Home' },
                { icon: 'work', label: 'Return to Work' },
                { icon: 'self_improvement', label: 'Return to Leisure' },
              ].map((p, i) => (
                <div key={i} className={`flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl text-center`}>
                  <div className="w-10 h-10 rounded-full bg-[#f37021]/20 text-[#f37021] flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">{p.icon}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">{p.label}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Mission visual */}
          <Reveal x={-40} className="relative min-h-[280px] lg:min-h-full">
            <img
              src="/images/about/mission.jpg"
              alt="Helping patients return to an active life — KR Physiotherapy mission"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b1c30]/60 via-transparent to-transparent lg:bg-gradient-to-r"></div>          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          WHAT WE DO — 4-step visual cards
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="What We Do"
          title="From Accurate Diagnosis to Full Recovery"
          subtitle="Our patients deserve the absolute best in assessment, diagnosis and treatment — explained in plain language, with a plan that leads to full recovery."
        />
        <Stagger gap={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Clinical Assessment', desc: 'Holistic evaluation to find the true root cause of your pain.', img: '/images/about/assessment.jpg', tag: '01' },
            { title: 'Personalised Plan', desc: 'A step-by-step treatment roadmap built around your goals.', img: '/images/about/recovery-plan.jpg', tag: '02' },
            { title: 'Hands-On Therapy', desc: 'Skilled spinal mobilisation, manipulation and advanced modalities.', img: '/images/about/spine-care.jpg', tag: '03' },
            { title: 'Patient Education', desc: 'Real, easy-to-understand explanations at every stage of recovery.', img: '/images/about/diagnosis.jpg', tag: '04' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-[#0084d1]/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/75 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-[#0084d1] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                  Step {s.tag}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold text-[#0b1c30] font-headline mb-1.5 group-hover:text-[#0084d1] transition">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </Stagger>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          WHY CHOOSE US — Icon list left, photo right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <Reveal x={40} className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f37021]/10 text-[11px] font-bold uppercase tracking-widest text-[#f37021]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0084d1]"></span>
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              What Sets Us<br />Apart
            </h2>
            <div className="space-y-4">
              {[
                { icon: 'biotech', title: 'Evidence-Based Protocols', desc: 'Every treatment plan follows internationally validated clinical rehabilitation guidelines.' },
                { icon: 'engineering', title: 'Advanced Equipment', desc: 'State-of-the-art electrotherapy, ultrasound, traction, and laser therapy stations.' },
                { icon: 'handshake', title: 'Hands-On Manual Therapy', desc: 'Skilled spinal mobilisation, joint manipulation and dry needling by MIAP-certified therapists.' },
                { icon: 'home_health', title: 'Physiotherapy at Home', desc: 'On-call therapist visits across Noida for bedridden, post-surgical & elderly patients.' },
              ].map((f, i) => (
                <div key={i} className={`flex items-start gap-4 group`}>
                  <div className="w-11 h-11 rounded-xl bg-[#0084d1]/10 text-[#0084d1] group-hover:bg-[#0084d1] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300">
                    <span className="material-symbols-outlined text-lg">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1c30] font-headline">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          {/* Image */}
          <Reveal x={-40} className="rounded-2xl order-1 lg:order-2">
            <img src="/images/about/patient-care.jpg" alt="Patient Care at KR Physiotherapy" className="w-full h-[420px] object-cover rounded-2xl" />
          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          OUR JOURNEY — Image left, timeline right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <Reveal x={40} className="rounded-2xl">
            <img src="/images/about/rehab-gym.jpg" alt="KR Physiotherapy Journey" className="w-full h-[400px] object-cover rounded-2xl" />
          </Reveal>
          {/* Timeline */}
          <Reveal x={-40} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0084d1]/10 text-[11px] font-bold uppercase tracking-widest text-[#0084d1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              Our Journey
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              A Decade of Healing
            </h2>
            <div className="relative pl-8 space-y-6">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[#0084d1] via-[#f37021] to-[#0084d1]"></div>
              {[
                { year: '2013', title: 'Clinic Founded', desc: 'Established in Sector 51, Noida with a vision for evidence-based rehab.' },
                { year: '2016', title: 'Facility Expansion', desc: 'Upgraded to a full-scale rehabilitation centre with dedicated recovery bays.' },
                { year: '2020', title: 'Home Care Launch', desc: 'Introduced bedside physiotherapy services across Noida.' },
                { year: '2024', title: '5,000+ Recoveries', desc: 'Crossed 5,000 successful recoveries with 5.0 Google rating.' },
              ].map((m, i) => (
                <div key={i} className={`relative`}>
                  {/* Dot */}
                  <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-white border-[3px] border-[#0084d1] z-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-[#0084d1]">{i === 0 ? 'flag' : i === 1 ? 'apartment' : i === 2 ? 'home_health' : 'emoji_events'}</span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 bg-[#0084d1]/10 text-[#0084d1] text-[10px] font-bold uppercase tracking-wider rounded mb-1">{m.year}</span>
                  <h3 className="text-base font-bold text-[#0b1c30] font-headline">{m.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          FACILITY TOUR — Copy left, 4-photo collage right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <Reveal x={40} className="space-y-5 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0084d1]/10 text-[11px] font-bold uppercase tracking-widest text-[#0084d1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              Our Facility
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              Inside Our Clinic
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              A modern, fully equipped rehabilitation facility in Sector 51, Noida — designed for clinical excellence and patient comfort.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: 'fitness_center', label: 'Rehab Gymnasium' },
                { icon: 'healing', label: 'Manual Therapy' },
                { icon: 'electric_bolt', label: 'Electrotherapy' },
                { icon: 'psychology', label: 'Neuro Recovery' },
              ].map((f, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100`}>
                  <span className="material-symbols-outlined text-lg text-[#0084d1]">{f.icon}</span>
                  <span className="text-xs font-bold text-[#0b1c30]">{f.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
          {/* Image collage */}
          <Reveal x={-40} className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl" >
                <img src="/images/about/clinic-interior.jpg" alt="Clinic Interior" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <div className="img-reveal rounded-2xl mt-6">
                <img src="/images/about/equipment.jpg" alt="Equipment" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <div className="img-reveal rounded-2xl -mt-3">
                <img src="/images/about/manual-therapy.jpg" alt="Manual Therapy" className="w-full h-48 object-cover rounded-2xl" />
              </div>
              <div className="img-reveal rounded-2xl mt-3">
                <img src="/images/about/electrotherapy.jpg" alt="Electrotherapy" className="w-full h-48 object-cover rounded-2xl" />
              </div>
            </div>
          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          AMENITIES — Photo left, benefit cards right
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <Reveal x={40} className="rounded-2xl">
            <img src="/images/about/wellness.jpg" alt="Patient Wellness" className="w-full h-[400px] object-cover rounded-2xl" />
          </Reveal>
          {/* Cards */}
          <Reveal x={-40} className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0084d1]/10 text-[11px] font-bold uppercase tracking-widest text-[#0084d1]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f37021]"></span>
              Amenities
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              Patient Conveniences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: 'medical_services', title: 'Advanced Equipment', text: 'Latest electrotherapy, ultrasound & diagnostic stations.', color: 'bg-blue-50 text-[#0084d1]' },
                { icon: 'pan_tool', title: 'Manual Therapy', text: 'Spinal mobilisation, manipulation & dry needling.', color: 'bg-amber-50 text-[#f37021]' },
                { icon: 'local_parking', title: 'Free Parking', text: 'Complimentary on-site parking for all patients.', color: 'bg-green-50 text-[#16a34a]' },
                { icon: 'train', title: 'Near Metro', text: 'Easy access from Sector-34 Metro station.', color: 'bg-purple-50 text-[#7c3aed]' },
                { icon: 'account_balance', title: 'ATM & Banking', text: 'ATM and bank in the same building.', color: 'bg-rose-50 text-[#e11d48]' },
                { icon: 'home_health', title: 'Home Visits', text: 'On-call therapist for bedside care.', color: 'bg-sky-50 text-[#0284c7]' },
              ].map((a, i) => (
                <div key={i} className={`anim-delay-${Math.min(i + 1, 5)} group bg-white p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-300 flex items-start gap-3`}>
                  <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <span className="material-symbols-outlined text-lg">{a.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#0b1c30] font-headline">{a.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{a.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          CREDENTIALS + CLINIC INFO
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clinic Info */}
          <Reveal x={40} className="bg-[#0b1c30] text-white p-7 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-slate-300">Clinic Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#f37021] text-base mt-0.5">location_on</span>
                <span className="text-slate-300 text-xs leading-relaxed">Kisan Tower, Basement, Main Road, Hosiyarpur, Sector-51, Noida, UP 201301</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#f37021] text-base mt-0.5">call</span>
                <div className="text-xs">
                  <a href="tel:+918595321652" className="font-bold text-white hover:underline block">+91 85953 21652</a>
                  <a href="tel:+917668527335" className="text-slate-400 hover:underline block">+91 76685 27335</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#f37021] text-base mt-0.5">mail</span>
                <a href="mailto:info@krphysiotherapy.com" className="text-xs text-slate-300 hover:text-white hover:underline">info@krphysiotherapy.com</a>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#f37021] text-base mt-0.5">schedule</span>
                <span className="text-xs text-slate-300">Open 7 days a week<br />8:30am – 8:30pm</span>
              </div>
            </div>
            <button onClick={() => onBook()} className="w-full py-3 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg">
              Book Appointment
            </button>
          </Reveal>

          {/* Credentials */}
          <Reveal x={-40} className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0b1c30] font-headline uppercase tracking-wider">Clinical Credentials</h3>
            <div className="space-y-3">
              {[
                { icon: 'verified', text: 'MIAP Certified Indian Association of Physiotherapists' },
                { icon: 'biotech', text: 'Evidence-Based Clinical Rehabilitation Protocols' },
                { icon: 'electric_bolt', text: 'Advanced Electrotherapy, Ultrasound & Traction' },
                { icon: 'home_health', text: 'Physiotherapy At-Home Visits Throughout Noida' },
                { icon: 'star', text: '5.0 Google Rating from 224+ Verified Patients' },
              ].map((c, i) => (
                <div key={i} className={`flex items-center gap-3 text-xs text-slate-600 p-2.5 rounded-lg hover:bg-slate-50 transition`}>
                  <span className="w-8 h-8 rounded-lg bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">{c.icon}</span>
                  </span>
                  {c.text}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </MotionSection>


      {/* ═══════════════════════════════════════════════════════
          FALLBACK PROSE — Only for non-about pages routed here
      ═══════════════════════════════════════════════════════ */}
      {!isAboutPage && page?.content_html && (
        <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="prose prose-slate max-w-none bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm text-slate-600 leading-relaxed
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0b1c30] [&_h2]:mt-6 [&_h2:first-child]:mt-0
              [&_img]:hidden [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-[#0084d1] [&_a]:font-semibold"
            dangerouslySetInnerHTML={{ __html: page.content_html }}
          />
        </MotionSection>
      )}


      {/* ═══════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════ */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal y={0} scale={0.96} className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800 bg-gradient-to-r from-[#0b1c30] via-[#0b1c30] to-[#0084d1]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-tight">Experience Relief From Chronic Pain Today</h2>
              <p className="text-sm text-slate-200 max-w-2xl leading-relaxed">Visit our Sector-51 clinic or request home physiotherapy. Transparent fees, compassionate doctors, zero waiting lines.</p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button onClick={() => onBook()} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#f37021] to-[#ea580c] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl transition active:scale-95 whitespace-nowrap">
                Book Appointment Now
              </button>
            </div>
          </div>
        </Reveal>
      </MotionSection>

    </div>
  );
}
