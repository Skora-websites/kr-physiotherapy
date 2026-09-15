import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0b1c30] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="mb-5">
              <a href="/" className="bg-white rounded-2xl px-4 py-2.5 inline-block shadow-md border border-slate-200/50 hover:shadow-lg transition">
                <img src="/images/logo1.png" alt="KR Physiotherapy Logo" className="h-11 sm:h-12 w-auto object-contain" />
              </a>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              KR Physiotherapy &amp; Rehabilitation Clinic is a premier physiotherapy centre in Noida delivering individualized evidence-based recovery protocols, advanced electrotherapy, manual therapy, and at-home clinical care.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0084d1]/20 text-[#0084d1]">
                <span className="material-symbols-outlined text-sm">verified</span>
              </span>
              <span>Registered Healthcare Practice (MIAP)</span>
            </div>
          </div>

          {/* Col 2: Clinical Services */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 font-headline border-b border-slate-700 pb-2">
              Clinical Services
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/musculoskeletal-physiotherapy.html" className="hover:text-[#0084d1] transition">Musculoskeletal Physiotherapy</a></li>
              <li><a href="/neurological-physiotherapy.html" className="hover:text-[#0084d1] transition">Neurological Rehabilitation</a></li>
              <li><a href="/cardiorespiratory-physiotherapy.html" className="hover:text-[#0084d1] transition">Cardiorespiratory Care</a></li>
              <li><a href="/sports-physiotherapy.html" className="hover:text-[#0084d1] transition">Sports Injury Management</a></li>
              <li><a href="/geriatric-physiotherapy.html" className="hover:text-[#0084d1] transition">Geriatric Rehabilitation</a></li>
              <li><a href="/paediatric-physiotherapy.html" className="hover:text-[#0084d1] transition">Paediatric Physiotherapy</a></li>
              <li><a href="/women-health-physiotherapy.html" className="hover:text-[#0084d1] transition">Women's Health Physiotherapy</a></li>
              <li><a href="/physiotherapy-at-home.html" className="hover:text-[#f37021] font-semibold text-amber-300 transition">Physiotherapy at Home</a></li>
            </ul>
          </div>

          {/* Col 3: Noida Sector Locations */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 font-headline border-b border-slate-700 pb-2">
              Sector Clinics &amp; Coverage
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="/physiotherapy-in-noida-sector-34.html" className="hover:text-emerald-400 transition">Physiotherapy in Noida Sector 34</a></li>
              <li><a href="/physiotherapy-in-noida-sector-35.html" className="hover:text-[#0084d1] transition">Physiotherapy in Noida Sector 35</a></li>
              <li><a href="/physiotherapy-in-noida-sector-52.html" className="hover:text-[#0084d1] transition">Physiotherapy in Noida Sector 52</a></li>
              <li><a href="/physiotherapy-in-noida-sector-53.html" className="hover:text-[#0084d1] transition">Physiotherapy in Noida Sector 53</a></li>
              <li><a href="/physiotherapy-in-noida-sector-71.html" className="hover:text-[#0084d1] transition">Physiotherapy in Noida Sector 71</a></li>
              <li><a href="/doctor-neelam-sharma.html" className="hover:text-[#0084d1] transition font-medium text-slate-300">Dr. Neelam Sharma (Lead Clinician)</a></li>
              <li><a href="/doctor-anamika.html" className="hover:text-[#0084d1] transition font-medium text-slate-300">Dr. Anamika (Consultant)</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Timings */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 font-headline border-b border-slate-700 pb-2">
              Clinic Location &amp; Hours
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#f37021] text-sm mt-0.5">location_on</span>
                <span>Kisan Tower, Basement, Main Road Hosiyarpur, Sector 51, Noida, Uttar Pradesh 201304</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0084d1] text-sm">call</span>
                <a href="tel:+918595321652" className="hover:text-[#f37021] font-bold text-white transition">+91 85953 21652</a>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#0084d1] text-sm">call</span>
                <a href="tel:+917668527335" className="hover:text-[#f37021] transition">+91 76685 27335</a>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#f37021] text-sm">mail</span>
                <a href="mailto:info@krphysiotherapy.com" className="hover:text-[#0084d1] transition">info@krphysiotherapy.com</a>
              </p>
              <p className="flex items-center gap-2.5 pt-1 border-t border-slate-800">
                <span className="material-symbols-outlined text-[#0084d1] text-sm">schedule</span>
                <span className="font-semibold text-amber-300">Mon - Sun: 8:30 AM – 8:30 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} KR Physiotherapy &amp; Rehabilitation Clinic. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="/privacy-policy.html" className="hover:text-slate-300 transition">Privacy Policy</a>
            <a href="/terms-and-conditions.html" className="hover:text-slate-300 transition">Terms &amp; Conditions</a>
            <a href="/contact.html" className="hover:text-slate-300 transition">Contact Us</a>
            <a href="/admin" className="text-slate-400 hover:text-emerald-400 font-semibold transition flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lock</span> Staff Admin
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
