import React, { useState } from 'react';

export default function AppointmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    patient_name: '',
    phone: '',
    email: '',
    preferred_date: '',
    preferred_time: 'Morning (8:30 AM - 12:00 PM)',
    service_or_treatment: 'Back Pain Treatment',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errors, setErrors] = useState([]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Appointment requested successfully! Our clinical coordinator will call you to confirm your slot.');
        setFormData({
          patient_name: '',
          phone: '',
          email: '',
          preferred_date: '',
          preferred_time: 'Morning (8:30 AM - 12:00 PM)',
          service_or_treatment: 'Back Pain Treatment',
          message: ''
        });
      } else {
        setErrors(data.errors || [data.message || 'Failed to submit appointment.']);
      }
    } catch (err) {
      setErrors(['Network error. Please call +91 85953 21652 directly for immediate booking.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-surface-container-high transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0084d1] to-[#0284c7] px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f37021] to-amber-400"></div>
          <div>
            <h2 className="text-xl font-bold font-headline">Book a Consultation</h2>
            <p className="text-xs text-sky-100 mt-0.5">KR Physiotherapy &amp; Rehabilitation Clinic</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-sky-100 hover:text-white hover:bg-white/10 transition"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {successMsg ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-emerald-600 mb-2">check_circle</span>
              <h3 className="text-lg font-bold text-emerald-900 font-headline">Request Received</h3>
              <p className="text-sm text-emerald-700 mt-2">{successMsg}</p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg space-y-1">
                  {errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  name="patient_name"
                  value={formData.patient_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="patient@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Date</label>
                  <input
                    type="date"
                    name="preferred_date"
                    value={formData.preferred_date}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Slot</label>
                  <select
                    name="preferred_time"
                    value={formData.preferred_time}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                  >
                    <option>Morning (8:30 AM - 12:00 PM)</option>
                    <option>Afternoon (12:00 PM - 4:00 PM)</option>
                    <option>Evening (4:00 PM - 8:30 PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Condition or Service Needed</label>
                <select
                  name="service_or_treatment"
                  value={formData.service_or_treatment}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm bg-white"
                >
                  <optgroup label="Common Conditions / Treatments">
                    <option>Back Pain Treatment</option>
                    <option>Shoulder Pain</option>
                    <option>Knee Pain</option>
                    <option>Neck Pain</option>
                    <option>Knee Ligament Injury</option>
                    <option>Hijama Cupping Therapy</option>
                    <option>Cerebral Palsy</option>
                    <option>Scoliosis</option>
                    <option>Bell’s Palsy</option>
                  </optgroup>
                  <optgroup label="Clinical Services">
                    <option>Musculoskeletal Physiotherapy</option>
                    <option>Neurological Physiotherapy</option>
                    <option>Chronic Pain Physiotherapy</option>
                    <option>Sports Physiotherapy</option>
                    <option>Geriatric Physiotherapy</option>
                    <option>Paediatric Physiotherapy</option>
                    <option>Physiotherapy For Women’s Health</option>
                    <option>Physiotherapy at Home</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message / Symptoms Overview</label>
                <textarea
                  name="message"
                  rows="2"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Briefly describe your pain duration or condition..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0084d1] to-[#0284c7] hover:from-[#006cb0] hover:to-[#0084d1] text-white font-bold transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
