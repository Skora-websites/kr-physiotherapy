import React, { useState, useEffect } from 'react';
import { SectionHeader, ContactForm, ServiceCard, TreatmentCard, SERVICE_ICONS, TREATMENT_ICONS } from '../components/Cards';
import { Reveal, Stagger, StaggerItem, MotionButton, MotionSection, useMotionPrefs, EASE } from '../components/motion-primitives';

/** Strip the leading <h2>/<img> that legacy CMS content embeds, leaving clean prose. */
function cleanClinicalHtml(html = '') {
  return html
    .replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '')
    .replace(/<img[^>]*>/i, '')
    .trim();
}

/** Split a service description into clean prose + a plain-text checklist from its first <ul>. */
function splitServiceHtml(html = '') {
  const ulMatch = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let texts = [];
  let rest = html;
  if (ulMatch) {
    const items = ulMatch[1].match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    texts = items
      .map(li => li.replace(/<i[^>]*>\s*<\/i>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    rest = html.replace(ulMatch[0], '');
    // Drop the now-orphaned lead-in paragraph (a short standalone line ending with ':')
    rest = rest.replace(/<p[^>]*>(?:(?!<\/p>)[\s\S])*?<\/p>/gi, (p) => {
      const text = p.replace(/<[^>]+>/g, '').trim();
      return text.length > 0 && text.length < 80 && text.endsWith(':') ? '' : p;
    });
  }
  rest = cleanClinicalHtml(rest);
  return { rest, texts };
}

export function ServicesListTemplate({ onBook }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => {
        if (d.success) setServices(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  

  return (
    <div className="space-y-12 pb-24 pt-24 sm:pt-28">
      {/* Page Hero */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Specialized Care"
            size="page"
            title="Physiotherapy Services in Noida"
            subtitle="Eight specialised clinical departments — from musculoskeletal and neurological rehabilitation to sports recovery and home care — delivered by MIAP-certified therapists."
            align="left"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#0084d1]">verified</span> MIAP Certified Clinic
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#f37021]">home_health</span> Home Visits Across Noida
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#16a34a]">schedule</span> Open 7 Days a Week
            </span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-16">Loading services…</div>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" gap={0.08}>
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </Stagger>
        )}
      </div>

      {/* CTA Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b1c30] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black font-headline">Not Sure Which Service You Need?</h2>
            <p className="text-sm text-slate-300">Our clinical desk will guide you to the right specialist — no obligation.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:+918595321652" className="px-6 py-3.5 bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/20 transition">
              Call +91 85953 21652
            </a>
            <button onClick={() => onBook()} className="px-6 py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95">
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TreatmentsListTemplate({ onBook }) {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/treatments')
      .then(r => r.json())
      .then(d => {
        if (d.success) setTreatments(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  

  return (
    <div className="space-y-12 pb-24 pt-24 sm:pt-28">
      {/* Page Hero */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Non-Surgical Pain Relief"
            size="page"
            title="Conditions &amp; Treatments We Treat"
            subtitle="Evidence-based physiotherapy programmes for back pain, joint injuries, neurological conditions and chronic pain — assessed first, treated second, always without surgery."
            align="left"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#0084d1]">troubleshoot</span> Root-Cause Assessment First
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#f37021]">vaccines</span> Zero Side-Effects Protocols
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#16a34a]">star</span> 5.0 · 224+ Patient Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Treatments Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-16">Loading treatments…</div>
        ) : (
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" gap={0.08}>
            {treatments.map((t) => (
              <TreatmentCard key={t.id} treatment={t} />
            ))}
          </Stagger>
        )}
      </div>

      {/* CTA Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0b1c30] to-[#0084d1] rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-black font-headline">Suffering From Persistent Pain?</h2>
            <p className="text-sm text-slate-200">Get a detailed root-cause assessment from Dr. Neelam Sharma — in-clinic or at home.</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:+918595321652" className="px-6 py-3.5 bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/20 transition">
              Call +91 85953 21652
            </a>
            <button onClick={() => onBook()} className="px-6 py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95">
              Book Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ServiceTemplate({ service, onBook }) {
  const serviceImage = service?.banner_image || '/images/services/1.jpg';
  const serviceIcon = SERVICE_ICONS[service?.slug] || service?.icon || 'medical_services';

  const [related, setRelated] = useState([]);

  

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(d => {
        if (d.success) setRelated((d.data || []).filter(s => s.slug !== service?.slug).slice(0, 3));
      })
      .catch(() => {});
  }, [service?.slug]);

  if (!service) {
    return (
      <div className="pt-40 pb-32 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">medical_services</span>
        <p className="text-sm text-slate-500">Service not found.</p>
        <a href="/services.html" className="inline-block px-6 py-3 bg-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow">
          Browse All Services
        </a>
      </div>
    );
  }

  const { rest: serviceProse, texts: benefitItems } = splitServiceHtml(service.full_description_html || '');

  return (
    <div className="pb-24 pt-24 sm:pt-28">
      {/* Split Hero: narrative left, clinical photo right */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <a href="/services.html" className="hover:text-[#0084d1] transition">Services</a>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-[#0084d1]">{service.name}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0084d1]/10 text-[#0084d1] text-[11px] font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">{serviceIcon}</span>
              Clinical Service
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              {service.name}
            </h1>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-xl">
              {service.short_description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => onBook(service.name)}
                className="px-7 py-3.5 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">calendar_month</span>
                Book This Service
              </button>
              <a href="tel:+918595321652" className="px-7 py-3.5 bg-white border border-slate-200 text-[#0b1c30] text-xs font-bold uppercase tracking-wider rounded-xl hover:border-[#0084d1] hover:text-[#0084d1] transition flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#f37021]">call</span>
                +91 85953 21652
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">verified</span> MIAP-Certified Therapists</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">schedule</span> Open 7 Days · 8:30am–8:30pm</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">home_health</span> Home Visits Across Noida</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
              <img src={serviceImage} alt={service.name} className="w-full h-72 sm:h-96 object-cover" />
            </div>
            <div className="absolute -bottom-5 left-6 bg-white rounded-2xl shadow-lg border border-slate-100 px-5 py-3.5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">{serviceIcon}</span>
              </span>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Delivery</p>
                <p className="text-xs font-bold text-[#0b1c30]">In-Clinic &amp; At Home</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          {benefitItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
              <h2 className="text-lg font-bold text-[#0b1c30] font-headline flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0084d1]">fact_check</span>
                What This Service Helps With
              </h2>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {benefitItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="material-symbols-outlined text-base text-[#16a34a] mt-0.5 shrink-0">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {serviceProse && (
            <div
              className="prose prose-sm prose-slate max-w-none bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs"
              dangerouslySetInnerHTML={{ __html: serviceProse }}
            />
          )}

          {/* Care standards strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: 'troubleshoot', title: 'Assessment First', desc: 'Root-cause diagnosis before any treatment plan' },
              { icon: 'workspace_premium', title: 'Certified Team', desc: 'MIAP-registered physiotherapists only' },
              { icon: 'medication_liquid', title: 'Zero Side-Effects', desc: 'Non-surgical, drug-free protocols' },
              { icon: 'home_health', title: 'Home Care Option', desc: 'Same protocol, delivered at your doorstep' },
            ].map((f) => (
              <div key={f.title} className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                <span className="material-symbols-outlined text-xl text-[#0084d1]">{f.icon}</span>
                <p className="mt-2.5 text-xs font-bold text-[#0b1c30]">{f.title}</p>
                <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b1c30] text-white p-8 rounded-3xl shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Fast Intake</span>
            <h3 className="text-xl font-bold font-headline">Book {service.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultations at our Sector 51 clinic or via certified home visits throughout Noida — same protocols, same team.
            </p>
            <button
              onClick={() => onBook(service.name)}
              className="w-full py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow active:scale-95"
            >
              Schedule Consultation
            </button>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Direct Helpline:</span>
              <a href="tel:+918595321652" className="text-white font-bold">+91 85953 21652</a>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
            <h4 className="text-[11px] font-bold text-[#0084d1] uppercase tracking-wider mb-4">At a Glance</h4>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Session Length</dt><dd className="font-bold text-[#0b1c30] text-right">45–60 Minutes</dd></div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><dt className="text-slate-500">Delivery</dt><dd className="font-bold text-[#0b1c30] text-right">In-Clinic &amp; Home</dd></div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><dt className="text-slate-500">Days Open</dt><dd className="font-bold text-[#0b1c30] text-right">All 7 Days</dd></div>
              <div className="flex justify-between gap-4 border-t border-slate-100 pt-3"><dt className="text-slate-500">Plan</dt><dd className="font-bold text-[#0b1c30] text-right">Structured Recovery</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Related services */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="flex items-end justify-between gap-4 mb-7">
            <h2 className="text-xl sm:text-2xl font-black text-[#0b1c30] font-headline">Explore Other Clinical Services</h2>
            <a href="/services.html" className="text-xs font-bold text-[#0084d1] hover:text-[#f37021] transition shrink-0">View all &rarr;</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

export function TreatmentTemplate({ treatment, onBook }) {
  const treatmentImage = treatment?.banner_image || '/images/back-pain.jpg';
  const treatmentIcon = TREATMENT_ICONS[treatment?.slug] || 'healing';

  const [related, setRelated] = useState([]);

  

  useEffect(() => {
    fetch('/api/treatments')
      .then(r => r.json())
      .then(d => {
        if (d.success) setRelated((d.data || []).filter(t => t.slug !== treatment?.slug).slice(0, 5));
      })
      .catch(() => {});
  }, [treatment?.slug]);

  if (!treatment) {
    return (
      <div className="pt-40 pb-32 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-slate-300">healing</span>
        <p className="text-sm text-slate-500">Treatment condition not found.</p>
        <a href="/treatments.html" className="inline-block px-6 py-3 bg-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow">
          Browse All Treatments
        </a>
      </div>
    );
  }

  const isNeuro = treatment?.category === 'Neurological Rehabilitation';
  const ctaLabel = isNeuro ? 'Start Recovery Assessment' : 'Get Pain Evaluation';
  const sidebarKicker = isNeuro ? 'Neuro Rehabilitation' : 'Non-Surgical Cure';
  const sidebarHeading = isNeuro ? 'Book Recovery Assessment' : 'Book Pain Evaluation';
  const sidebarText = isNeuro
    ? 'Dr. Neelam Sharma performs a detailed neurological and functional assessment to map your recovery path — in-clinic or at home.'
    : 'Dr. Neelam Sharma performs a detailed one-on-one assessment to identify the root trigger — in-clinic or at home.';
  const badgeLabel = isNeuro ? 'Drug-Free' : 'Non-Surgical';

  const approachHtml = cleanClinicalHtml(treatment.treatment_html || '');

  return (
    <div className="pb-24 pt-24 sm:pt-28">
      {/* Split Hero */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <a href="/treatments.html" className="hover:text-[#f37021] transition">Treatments</a>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-[#f37021]">{treatment.name}</span>
            </nav>
            {treatment.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f37021]/10 text-[#f37021] text-[11px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">{treatmentIcon}</span>
                {treatment.category}
              </span>
            )}
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-[#0b1c30] font-headline tracking-tight leading-tight">
              {treatment.name}
            </h1>
            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-xl">
              {treatment.summary}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => onBook(treatment.name)}
                className="px-7 py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">event_available</span>
                {ctaLabel}
              </button>
              <a href="tel:+918595321652" className="px-7 py-3.5 bg-white border border-slate-200 text-[#0b1c30] text-xs font-bold uppercase tracking-wider rounded-xl hover:border-[#f37021] hover:text-[#f37021] transition flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#0084d1]">call</span>
                +91 85953 21652
              </a>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">health_and_safety</span> Non-Surgical First</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">medication_liquid</span> Zero Side-Effects</span>
              <span className="inline-flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-[#16a34a]">star</span> 5.0 · 224+ Patient Reviews</span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
              <img src={treatmentImage} alt={treatment.name} className="w-full h-72 sm:h-96 object-cover" />
            </div>
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-[#f37021]">{treatmentIcon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b1c30]">{badgeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Symptoms & Causes */}
          {(treatment.symptoms_html || treatment.causes_html) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {treatment.symptoms_html && (
                <div className="bg-white rounded-3xl border border-slate-200/80 border-t-4 border-t-[#f37021] shadow-sm p-7">
                  <h2 className="text-base font-bold text-[#0b1c30] font-headline flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#f37021]">warning</span>
                    Common Symptoms
                  </h2>
                  <div
                    className="prose prose-sm prose-slate max-w-none mt-4"
                    dangerouslySetInnerHTML={{ __html: treatment.symptoms_html }}
                  />
                </div>
              )}
              {treatment.causes_html && (
                <div className="bg-white rounded-3xl border border-slate-200/80 border-t-4 border-t-[#0084d1] shadow-sm p-7">
                  <h2 className="text-base font-bold text-[#0b1c30] font-headline flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#0084d1]">troubleshoot</span>
                    Likely Root Causes
                  </h2>
                  <div
                    className="prose prose-sm prose-slate max-w-none mt-4"
                    dangerouslySetInnerHTML={{ __html: treatment.causes_html }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Treatment approach */}
          {approachHtml && (
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="material-symbols-outlined text-[#f37021]">medical_information</span>
                <h2 className="text-lg font-bold text-[#0b1c30] font-headline">Our Treatment Approach</h2>
              </div>
              <div
                className="prose prose-sm prose-slate max-w-none leading-relaxed bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs"
                dangerouslySetInnerHTML={{ __html: approachHtml }}
              />
            </div>
          )}

          {/* Recovery journey */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
            <h2 className="text-lg font-bold text-[#0b1c30] font-headline flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#0084d1]">route</span>
              Your Recovery Journey
            </h2>
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              {[
                { icon: 'troubleshoot', title: 'Root-Cause Assessment', desc: 'Posture, movement and strength testing pinpoint the true pain generator.' },
                { icon: 'handyman', title: 'Hands-On Treatment', desc: 'Mobilisation, dry needling, cupping and modalities to settle pain fast.' },
                { icon: 'fitness_center', title: 'Strengthen & Prevent', desc: 'Progressive exercises restore function and stop the pain from returning.' },
              ].map((step, i) => (
                <div key={step.title} className="relative bg-slate-50/80 rounded-2xl border border-slate-100 p-5 pt-6">
                  <span className="absolute -top-3 left-5 w-7 h-7 rounded-full bg-gradient-to-r from-[#0084d1] to-[#0284c7] text-white text-[11px] font-bold flex items-center justify-center shadow">{i + 1}</span>
                  <span className="material-symbols-outlined text-xl text-[#f37021]">{step.icon}</span>
                  <p className="mt-2 text-xs font-bold text-[#0b1c30]">{step.title}</p>
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b1c30] text-white p-8 rounded-3xl shadow-lg space-y-4">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">{sidebarKicker}</span>
            <h3 className="text-xl font-bold font-headline">{sidebarHeading}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {sidebarText}
            </p>
            <button
              onClick={() => onBook(treatment.name)}
              className="w-full py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow active:scale-95"
            >
              Consult Specialist
            </button>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Appointment Desk:</span>
              <a href="tel:+918595321652" className="text-white font-bold">+91 85953 21652</a>
            </div>
          </div>

          {related.length > 0 && (
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm">
              <h4 className="text-[11px] font-bold text-[#f37021] uppercase tracking-wider mb-4">Other Conditions We Treat</h4>
              <ul className="space-y-1">
                {related.map(t => (
                  <li key={t.id}>
                    <a href={`/${t.slug}.html`} className="group flex items-center justify-between gap-3 py-2 border-b border-slate-50 last:border-0 text-xs font-semibold text-slate-600 hover:text-[#0084d1] transition">
                      <span className="truncate">{t.name}</span>
                      <span className="material-symbols-outlined text-sm text-slate-300 group-hover:text-[#0084d1] transition shrink-0">arrow_forward</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export function DoctorTemplate({ doctor, onBook }) {
  

  if (!doctor) return <div className="pt-32 pb-20 text-center text-sm">Doctor profile not found.</div>;

  return (
    <div className="space-y-16 pb-24 pt-24 sm:pt-28">
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Practitioner Profile"
            title={doctor.name}
            subtitle={doctor.designation}
            align="left"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-md">
            <img
              src={doctor.photo_url}
              alt={doctor.name}
              className="w-full h-80 object-cover object-top rounded-2xl shadow-inner mb-5"
            />
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Experience:</span>
                <span className="font-bold text-slate-900">{doctor.experience_years}+ Years</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Registration:</span>
                <span className="font-bold text-[#0084d1]">MIAP Certified</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Phone:</span>
                <a href={`tel:${doctor.phone}`} className="font-bold text-[#0084d1]">{doctor.phone}</a>
              </div>
            </div>
            <button
              onClick={() => onBook(doctor.name)}
              className="mt-6 w-full py-3.5 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow"
            >
              Consult {doctor.name}
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div
            className="prose prose-sm prose-slate max-w-none bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs"
            dangerouslySetInnerHTML={{ __html: doctor.bio_html || '' }}
          />
        </div>
      </div>
    </div>
  );
}

export function LocationTemplate({ page, onBook }) {
  

  if (!page) return <div className="pt-32 pb-20 text-center text-sm">Location page not found.</div>;

  return (
    <div className="space-y-16 pb-24 pt-24 sm:pt-28">
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Local Sector Healthcare"
            title={page.title}
            subtitle={page.subtitle || 'Expert physiotherapy clinic and home visit care near you in Noida.'}
            align="left"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Facility Photo in Sector Page */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-64">
            <img src="/images/clinic-gym.jpg" alt="KR Physiotherapy Noida Clinic" className="w-full h-full object-cover" />
          </div>

          <div
            className="prose prose-sm prose-slate max-w-none bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs"
            dangerouslySetInnerHTML={{ __html: page.content_html || '' }}
          />
          <div className="pt-6">
            <button
              onClick={() => onBook('Local Sector Consultation')}
              className="px-8 py-4 bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition shadow-lg"
            >
              Book In-Clinic or Home Visit
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xl font-bold text-[#0b1c30] font-headline border-b border-slate-100 pb-2">
              Sector Care Access
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Serving residents with clinic visits at Sector 51 and bedside physiotherapy throughout Noida.
            </p>
            <div className="text-xs space-y-2 text-slate-700">
              <p><strong>Clinic:</strong> Kisan Tower, Hosiyarpur, Sector 51</p>
              <p><strong>Helpline:</strong> <a href="tel:+918595321652" className="text-[#0084d1] font-bold">+91 85953 21652</a></p>
              <p><strong>Hours:</strong> 8:30 AM – 8:30 PM (7 Days)</p>
            </div>
            <button
              onClick={() => onBook('Sector Clinic Booking')}
              className="w-full py-3.5 bg-gradient-to-r from-[#0084d1] to-[#0284c7] text-white font-bold text-xs rounded-xl shadow"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogListTemplate() {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/blogs').then(r => r.json()).then(d => d.success && setBlogs(d.data));
  }, []);

  const filtered = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.excerpt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-16 pb-24 pt-24 sm:pt-28">
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinical Knowledge Hub"
            size="page"
            title="Clinical Insights &amp; Blog Archive"
            subtitle="Physiotherapy guides, posture tips, and pain management articles authored by Dr. Neelam Sharma."
            align="left"
          />
          <div className="mt-6 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles by condition or symptom..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm shadow-xs focus:ring-2 focus:ring-[#0084d1] bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((b) => (
            <StaggerItem key={b.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
              {b.featured_image && (
                <div className="h-48 overflow-hidden bg-slate-100">
                  <img src={b.featured_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
              )}
              <div className="p-7 flex flex-col justify-between flex-grow">
                <div>
                  <div className="text-[11px] font-bold text-[#0084d1] uppercase tracking-wider mb-2">
                    {b.category_name || 'Physiotherapy'} • {b.published_at ? new Date(b.published_at).toLocaleDateString() : ''}
                  </div>
                  <h3 className="text-base font-bold text-[#0b1c30] font-headline mb-2.5 group-hover:text-[#0084d1] transition line-clamp-2 leading-snug">
                    <a href={`/blogs/${b.slug}/`}>{b.title}</a>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-6 font-normal">
                    {b.excerpt}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <a href={`/blogs/${b.slug}/`} className="text-xs font-bold text-[#0084d1] hover:text-[#f37021] hover:underline flex items-center gap-1 transition">
                    <span>Read Full Article</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BlogArticleTemplate({ blog }) {
  if (!blog) return <div className="pt-32 pb-20 text-center text-sm">Blog article not found.</div>;

  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!blog) return;
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        const items = d.data.filter(b => b.id !== blog.id).slice(0, 3);
        setRelated(items);
      })
      .catch(() => {});
  }, [blog?.id]);

  // Reading time estimate (avg 200 words/min)
  const wordCount = (blog.content_html || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
  const readMin = Math.max(2, Math.round(wordCount / 200));

  const formattedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="pb-24 pt-24 sm:pt-28">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-b from-slate-900 via-[#0b1c30] to-[#0b1c30] overflow-hidden">
        {blog.featured_image && (
          <div className="absolute inset-0">
            <img src={blog.featured_image} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30] via-[#0b1c30]/70 to-transparent"></div>
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <a href="/blogs/index.htm" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d1] hover:text-[#f37021] transition mb-6">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>All Clinical Articles</span>
          </a>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-headline tracking-tight leading-tight">
            {blog.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0084d1]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-[#0084d1]">person</span>
              </div>
              <span>By <strong className="text-white">{blog.author_name || 'Dr. Neelam Sharma'}</strong></span>
            </div>
            <span className="text-slate-500">•</span>
            <span>{formattedDate}</span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {readMin} min read
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div
          className="prose prose-sm sm:prose-base prose-slate max-w-none bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-lg"
          dangerouslySetInnerHTML={{ __html: blog.content_html || '' }}
        />

        {/* ── Author Card ── */}
        <div className="mt-10 bg-gradient-to-r from-slate-50 to-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#0084d1]/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl text-[#0084d1]">medical_services</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#0b1c30] font-headline">Dr. Neelam Sharma</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Senior Physiotherapist &amp; Founder of KR Physiotherapy &amp; Rehabilitation Clinic, Noida. With 12+ years of experience, Dr. Sharma specializes in musculoskeletal, neurological, and sports rehabilitation.
            </p>
            <a href="/doctors/dr-neelam-sharma.html" className="inline-flex items-center gap-1 text-xs font-bold text-[#0084d1] hover:text-[#f37021] transition">
              View Full Profile
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>

        {/* ── CTA Strip ── */}
        <div className="mt-10 bg-gradient-to-r from-[#0b1c30] via-[#0b1c30] to-[#0084d1]/90 rounded-3xl p-8 sm:p-10 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-black font-headline">Need Expert Physiotherapy Guidance?</h3>
            <p className="text-xs text-slate-300">Book a consultation with Dr. Neelam Sharma for personalized treatment.</p>
          </div>
          <a href="/contact.html" className="shrink-0 px-6 py-3 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">event_available</span>
            Book Appointment
          </a>
        </div>

        {/* ── Related Articles ── */}
        {related.length > 0 && (
          <div className="mt-14">
            <h3 className="text-lg font-black text-[#0b1c30] font-headline mb-6">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((r) => (
                <a key={r.id} href={`/blogs/${r.slug}/`} className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition overflow-hidden">
                  {r.featured_image && (
                    <div className="h-32 overflow-hidden bg-slate-100">
                      <img src={r.featured_image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h4 className="text-xs font-bold text-[#0b1c30] font-headline line-clamp-2 group-hover:text-[#0084d1] transition leading-snug">
                      {r.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactTemplate({ onBook }) {
  return (
    <div className="space-y-12 pb-24 pt-24 sm:pt-28">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-12 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinic Connectivity"
            size="page"
            title="Contact &amp; Clinic Location"
            subtitle="Call for a same-day appointment, send us a message, or simply walk in — the clinic is open 7 days a week in the centre of Sector 51, Noida."
            align="left"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#16a34a]">bolt</span> Replies within 2 hours
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#0084d1]">schedule</span> Open Mon–Sun · 8:30am–8:30pm
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200">
              <span className="material-symbols-outlined text-sm text-[#f37021]">home_health</span> Home visits across Noida
            </span>
          </div>
        </div>
      </div>

      {/* Three ways to reach us */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" gap={0.1}>
          {/* Call */}
          <StaggerItem className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl">call</span>
            </div>
            <h3 className="text-base font-bold text-[#0b1c30] font-headline">Fastest — Call the Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5 mb-5">Same-day slots, home-visit scheduling and fee questions answered instantly during clinic hours.</p>
            <div className="mt-auto space-y-2">
              <a href="tel:+918595321652" className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#0b1c30] hover:border-[#0084d1] hover:text-[#0084d1] transition">
                +91 85953 21652
                <span className="material-symbols-outlined text-sm text-[#f37021]">north_east</span>
              </a>
              <a href="tel:+917668527335" className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-[#0b1c30] hover:border-[#0084d1] hover:text-[#0084d1] transition">
                +91 76685 27335
                <span className="material-symbols-outlined text-sm text-[#f37021]">north_east</span>
              </a>
            </div>
          </StaggerItem>
          {/* Book online */}
          <StaggerItem className="bg-[#0b1c30] rounded-3xl shadow-lg p-7 flex flex-col text-white">
            <div className="w-11 h-11 rounded-xl bg-[#f37021]/20 text-[#f37021] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl">calendar_month</span>
            </div>
            <h3 className="text-base font-bold font-headline">Book an Appointment</h3>
            <p className="text-xs text-slate-300 leading-relaxed mt-1.5 mb-5">Pick your service, doctor and preferred time online — our desk confirms within 2 hours during clinic time.</p>
            <div className="mt-auto">
              <button onClick={() => onBook()} className="w-full py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">event_available</span>
                Book Appointment
              </button>
            </div>
          </StaggerItem>
          {/* Home visit */}
          <StaggerItem className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#16a34a] flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-xl">home_health</span>
            </div>
            <h3 className="text-base font-bold text-[#0b1c30] font-headline">Request a Home Visit</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5 mb-5">Bedridden, post-surgical or elderly patients get the same clinical protocol delivered at home, anywhere in Noida.</p>
            <div className="mt-auto">
              <button onClick={() => onBook('Physiotherapy at Home')} className="w-full py-3.5 bg-[#0084d1] hover:bg-[#006cb0] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">schedule_send</span>
                Schedule Home Visit
              </button>
            </div>
          </StaggerItem>
        </Stagger>
      </MotionSection>

      {/* Form + clinic info sidebar */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <aside className="lg:col-span-5 space-y-6">
          {/* Clinic info card */}
          <div className="bg-[#0b1c30] text-white p-8 rounded-3xl shadow-lg space-y-5">
            <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-amber-300">Visit the Clinic</h3>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#f37021] text-base mt-0.5">location_on</span>
              <span className="text-xs text-slate-300 leading-relaxed">Kisan Tower, Basement, Main Road, Hosiyarpur, Sector-51, Noida, Uttar Pradesh 201301</span>
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
            <button onClick={() => onBook()} className="w-full py-3.5 bg-gradient-to-r from-[#f37021] to-[#ea580c] hover:from-[#d9570c] hover:to-[#f37021] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95">
              Book Appointment
            </button>
          </div>

          {/* Map */}
          <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-64">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.7083042502684!2d77.36979201508137!3d28.578528982439396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce59f40faaaab%3A0x7ea9d107a61d157a!2sKR%20Physiotherapy%20%26%20Rehabilitation%20Clinic!5e0!3m2!1sen!2sin!4v1580198031535!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Clinic Location Map"
            ></iframe>
          </div>
        </aside>
      </MotionSection>

      {/* Good-to-know strip */}
      <MotionSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4" gap={0.08}>
          {[
            { icon: 'local_parking', title: 'Free Parking', desc: 'Complimentary on-site parking for patients.' },
            { icon: 'train', title: 'Metro Access', desc: 'Easy reach from Sector-34 Metro station.' },
            { icon: 'account_balance', title: 'ATM & Bank', desc: 'Both inside the same building as the clinic.' },
            { icon: 'event_available', title: 'Walk-ins Welcome', desc: 'Or book ahead to skip any waiting.' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0084d1]/10 text-[#0084d1] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0b1c30]">{f.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </Stagger>
      </MotionSection>
    </div>
  );
}

export function LegalTemplate({ page }) {
  if (!page) return <div className="pt-32 pb-20 text-center text-sm">Legal document not found.</div>;

  return (
    <div className="space-y-12 pb-24 pt-24 sm:pt-28">
      <div className="bg-gradient-to-b from-slate-50 via-white to-sky-50/30 py-14 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Clinic Policies"
            title={page.title}
            align="left"
          />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="prose prose-sm prose-slate max-w-none bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs"
          dangerouslySetInnerHTML={{ __html: page.content_html || '' }}
        />
      </div>
    </div>
  );
}
