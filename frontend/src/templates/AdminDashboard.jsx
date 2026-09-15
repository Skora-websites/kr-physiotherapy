import React, { useState, useEffect, useRef } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('kr_admin_token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activePage, setActivePage] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [services, setServices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [siteSettings, setSiteSettings] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalEntity, setModalEntity] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Per-list UI state: search text, status filter, current page
  const [listState, setListState] = useState({
    bookings: { search: '', status: '', page: 1 },
    inquiries: { search: '', status: '', page: 1 },
    blogs: { search: '', status: '', page: 1 },
  });
  const [pagination, setPagination] = useState({ bookings: null, inquiries: null, blogs: null });

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const modalTimerRef = useRef(null);

  const blankService = { slug: '', name: '', short_description: '', full_description_html: '', icon: '', banner_image: '', sort_order: 0, status: 'published' };
  const blankTreatment = { slug: '', name: '', category: '', summary: '', symptoms_html: '', causes_html: '', treatment_html: '', banner_image: '', sort_order: 0, status: 'published' };
  const blankBlog = { slug: '', title: '', excerpt: '', content_html: '', featured_image: '', author_name: '', status: 'published' };
  const blankTestimonial = { patient_name: '', location: '', condition_treated: '', rating: 5, testimonial_text: '', doctor_name: '', is_featured: false };
  const blankDoctor = { slug: '', name: '', designation: '', qualification: '', experience_years: 0, bio_html: '', photo_url: '', phone: '', email: '', sort_order: 0, status: 'published' };

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
    Cancelled: 'bg-red-100 text-red-800',
    Rejected: 'bg-red-100 text-red-800',
    New: 'bg-blue-100 text-blue-800',
    Read: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    published: 'bg-green-100 text-green-800',
    draft: 'bg-yellow-100 text-yellow-800',
    Replied: 'bg-green-100 text-green-800',
    Archived: 'bg-gray-100 text-gray-600',
    Unread: 'bg-blue-100 text-blue-800',
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'bookings', label: 'Bookings', icon: 'calendar_month' },
    { id: 'inquiries', label: 'Inquiries', icon: 'mail' },
    { id: 'services', label: 'Services', icon: 'medical_services' },
    { id: 'treatments', label: 'Treatments', icon: 'healing' },
    { id: 'blogs', label: 'Blogs', icon: 'post_add' },
    { id: 'testimonials', label: 'Testimonials', icon: 'reviews' },
    { id: 'doctors', label: 'Doctors', icon: 'stethoscope' },
    { id: 'settings', label: 'Site Settings', icon: 'settings' },
  ];

  const apiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('kr_admin_token')}`
  });

  const handleUnauthorized = () => {
    localStorage.removeItem('kr_admin_token');
    setIsAuthenticated(false);
  };

  // Parse YYYY-MM-DD as a local calendar date (new Date() treats it as UTC midnight,
  // which shifts the displayed day back one in negative-UTC-offset timezones)
  const formatBookingDate = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString();
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  const jfetch = async (url) => {
    const res = await fetch(url, { headers: apiHeaders() });
    if (res.status === 401) {
      handleUnauthorized();
      throw new Error('unauthorized');
    }
    return res.json();
  };



  const updateListState = (entity, patch) => {
    setListState(prev => ({ ...prev, [entity]: { ...prev[entity], ...patch } }));
  };

  const LIST_ENDPOINTS = {
    bookings: '/api/admin/appointments',
    inquiries: '/api/admin/contacts',
    blogs: '/api/admin/blogs',
  };

  // Fetch a single paginated list and store its rows + pagination metadata
  const fetchList = async (entity) => {
    try {
      const ls = listState[entity];
      const qs = new URLSearchParams();
      if (ls.search) qs.set('search', ls.search);
      if (ls.status) qs.set('status', ls.status);
      qs.set('page', ls.page);
      qs.set('limit', 10);
      const data = await jfetch(`${LIST_ENDPOINTS[entity]}?${qs.toString()}`);
      if (data.success) {
        if (entity === 'bookings') setAppointments(data.data);
        else if (entity === 'inquiries') setContacts(data.data);
        else if (entity === 'blogs') setBlogs(data.data);
      }
      setPagination(prev => ({ ...prev, [entity]: data.pagination || null }));
    } catch (e) {
      if (e.message !== 'unauthorized') console.error(e);
    }
  };

  const fetchLists = () => { fetchList('bookings'); fetchList('inquiries'); fetchList('blogs'); };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      fetchLists();
    }
  }, [isAuthenticated, activePage]);

  // Debounced refetch when a list's search/status/page changes
  // (signature-compare avoids refetching on unrelated renders)
  const lastListSig = useRef('');
  useEffect(() => {
    if (!isAuthenticated) return;
    const sig = JSON.stringify({ b: listState.bookings, i: listState.inquiries, g: listState.blogs, p: activePage });
    if (sig === lastListSig.current) return;
    lastListSig.current = sig;
    const h = setTimeout(fetchLists, 300);
    return () => clearTimeout(h);
  }, [listState, activePage, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, svRes, trRes, teRes, drRes] = await Promise.all([
        jfetch('/api/admin/stats'),
        jfetch('/api/admin/services'),
        jfetch('/api/admin/treatments'),
        jfetch('/api/admin/testimonials'),
        jfetch('/api/admin/doctors'),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (svRes.success) setServices(svRes.data);
      if (trRes.success) setTreatments(trRes.data);
      if (teRes.success) setTestimonials(teRes.data);
      if (drRes.success) setDoctors(drRes.data);
    } catch (e) {
      if (e.message !== 'unauthorized') console.error('Load error:', e);
    }
    setLoading(false);
  };

  const loadSiteSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await jfetch('/api/admin/site-settings');
      if (data.success) setSiteSettings(data.data);
    } catch (e) {
      if (e.message !== 'unauthorized') console.error(e);
    }
    setSettingsLoading(false);
  };

  useEffect(() => {
    if (activePage === 'settings') loadSiteSettings();
  }, [activePage]);

  useEffect(() => {
    // Clear any pending modal auto-close timer on unmount
    return () => { if (modalTimerRef.current) clearTimeout(modalTimerRef.current); };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('kr_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch {
      setLoginError('Server connection error.');
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('kr_admin_token');
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm(`Delete this ${entity}?`)) return;
    try {
      const res = await fetch(`/api/admin/${entity}/${id}`, { method: 'DELETE', headers: apiHeaders() });
      if (res.ok) {
        loadData();
        if (['appointments', 'contacts', 'blogs'].includes(entity)) fetchLists();
        if (entity === 'site-settings') loadSiteSettings();
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ status })
      });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      fetchList('bookings'); // keep server-filtered view accurate (e.g. status filter)
    } catch {
      alert('Failed to update');
    }
  };

  const handleUpdateContactStatus = async (id, status) => {
    try {
      await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ status })
      });
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      fetchList('inquiries'); // keep server-filtered view accurate
    } catch {
      alert('Failed to update');
    }
  };

  const openCreateModal = (entity) => {
    if (modalTimerRef.current) { clearTimeout(modalTimerRef.current); modalTimerRef.current = null; }
    setModalEntity(entity);
    setModalMode('create');
    setEditItem(null);
    if (entity === 'services') setFormData({ ...blankService });
    else if (entity === 'treatments') setFormData({ ...blankTreatment });
    else if (entity === 'blogs') setFormData({ ...blankBlog });
    else if (entity === 'testimonials') setFormData({ ...blankTestimonial });
    else if (entity === 'doctors') setFormData({ ...blankDoctor });
    setModalOpen(true);
    setSaveMsg('');
  };

  const openEditModal = (entity, item) => {
    if (modalTimerRef.current) { clearTimeout(modalTimerRef.current); modalTimerRef.current = null; }
    setModalEntity(entity);
    setModalMode('edit');
    setEditItem(item);
    setFormData({ ...item });
    setModalOpen(true);
    setSaveMsg('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      let res;
      if (modalMode === 'create') {
        res = await fetch(`/api/admin/${modalEntity}`, {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch(`/api/admin/${modalEntity}/${editItem.id}`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify(formData)
        });
      }
      const data = await res.json();
      if (res.ok) {
        setSaveMsg('Saved successfully');
        if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
        modalTimerRef.current = setTimeout(() => { setModalOpen(false); setSaveMsg(''); }, 800);
        loadData();
        if (modalEntity === 'blogs') fetchList('blogs');
      } else {
        setSaveMsg(data.message || 'Save failed');
      }
    } catch {
      setSaveMsg('Network error');
    }
    setSaving(false);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify({ settings: siteSettings })
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg('Settings saved successfully');
        setTimeout(() => setSaveMsg(''), 3000);
        loadSiteSettings();
      } else {
        setSaveMsg(data.message || 'Save failed');
      }
    } catch {
      setSaveMsg('Network error');
    }
    setSaving(false);
  };

  const updateSetting = (key, value) => {
    setSiteSettings(prev => prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const logoutConfirm = () => {
    if (window.confirm('Are you sure you want to logout?')) handleLogout();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0b1c30] flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <img src="/images/logo1.png" alt="KR Physiotherapy" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#0b1c30] font-headline">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">KR Physiotherapy & Rehabilitation Clinic</p>
          </div>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{loginError}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] focus:border-transparent outline-none transition"
                placeholder="admin@krphysiotherapy.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] focus:border-transparent outline-none transition"
                placeholder="Enter password"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#0084d1] hover:bg-[#006bb0] text-white font-bold text-sm rounded-lg shadow transition disabled:opacity-60"
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#0084d1] hover:underline font-semibold">&larr; Back to Website</a>
          </div>
        </div>
      </div>
    );
  }

  const renderFormField = (label, key, type = 'text', options = {}) => {
    const { multiline, placeholder, required } = options;
    if (multiline) {
      return (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
          <textarea
            rows={4}
            value={formData[key] || ''}
            onChange={e => setFormData({ ...formData, [key]: e.target.value })}
            required={required}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none"
            placeholder={placeholder || ''}
          />
        </div>
      );
    }
    if (type === 'select') {
      return (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
          <select
            value={formData[key] || ''}
            onChange={e => setFormData({ ...formData, [key]: e.target.value })}
            required={required}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none bg-white"
          >
            {options.choices.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      );
    }
    if (type === 'checkbox') {
      return (
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!formData[key]}
            onChange={e => setFormData({ ...formData, [key]: e.target.checked })}
            className="w-4 h-4 text-[#0084d1] rounded"
          />
          <label className="text-xs font-semibold text-gray-700">{label}</label>
        </div>
      );
    }
    if (type === 'number') {
      return (
        <div key={key}>
          <label className="block text-xs font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
          <input
            type="number"
            value={formData[key] || 0}
            onChange={e => setFormData({ ...formData, [key]: parseInt(e.target.value) || 0 })}
            required={required}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none"
          />
        </div>
      );
    }
    return (
      <div key={key}>
        <label className="block text-xs font-semibold text-gray-700 mb-1">{label} {required && '*'}</label>
        <input
          type={type}
          value={formData[key] || ''}
          onChange={e => setFormData({ ...formData, [key]: e.target.value })}
          required={required}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none"
          placeholder={placeholder || ''}
        />
      </div>
    );
  };

  const renderModal = () => {
    if (!modalOpen) return null;
    const title = `${modalMode === 'create' ? 'Create' : 'Edit'} ${modalEntity.charAt(0).toUpperCase() + modalEntity.slice(1, -1)}`;

    let fields = [];
    if (modalEntity === 'services') {
      fields = [
        renderFormField('Name', 'name', 'text', { required: true }),
        renderFormField('Slug', 'slug'),
        renderFormField('Short Description', 'short_description', 'text', { multiline: true }),
        renderFormField('Full Description (HTML)', 'full_description_html', 'text', { multiline: true }),
        renderFormField('Icon', 'icon'),
        renderFormField('Banner Image URL', 'banner_image'),
        renderFormField('Sort Order', 'sort_order', 'number'),
        renderFormField('Status', 'status', 'select', { choices: ['active', 'inactive'] }),
      ];
    } else if (modalEntity === 'treatments') {
      fields = [
        renderFormField('Name', 'name', 'text', { required: true }),
        renderFormField('Slug', 'slug'),
        renderFormField('Category', 'category'),
        renderFormField('Summary', 'summary', 'text', { multiline: true }),
        renderFormField('Symptoms (HTML)', 'symptoms_html', 'text', { multiline: true }),
        renderFormField('Causes (HTML)', 'causes_html', 'text', { multiline: true }),
        renderFormField('Treatment (HTML)', 'treatment_html', 'text', { multiline: true }),
        renderFormField('Banner Image URL', 'banner_image'),
        renderFormField('Sort Order', 'sort_order', 'number'),
        renderFormField('Status', 'status', 'select', { choices: ['active', 'inactive'] }),
      ];
    } else if (modalEntity === 'blogs') {
      fields = [
        renderFormField('Title', 'title', 'text', { required: true }),
        renderFormField('Slug', 'slug'),
        renderFormField('Author Name', 'author_name'),
        renderFormField('Excerpt', 'excerpt', 'text', { multiline: true }),
        renderFormField('Featured Image URL', 'featured_image'),
        renderFormField('Content (HTML)', 'content_html', 'text', { multiline: true }),
        renderFormField('Status', 'status', 'select', { choices: ['published', 'draft'] }),
      ];
    } else if (modalEntity === 'testimonials') {
      fields = [
        renderFormField('Patient Name', 'patient_name', 'text', { required: true }),
        renderFormField('Location', 'location'),
        renderFormField('Condition Treated', 'condition_treated'),
        renderFormField('Rating (1-5)', 'rating', 'number'),
        renderFormField('Testimonial Text', 'testimonial_text', 'text', { multiline: true, required: true }),
        renderFormField('Doctor Name', 'doctor_name'),
        renderFormField('Featured', 'is_featured', 'checkbox'),
      ];
    } else if (modalEntity === 'doctors') {
      fields = [
        renderFormField('Name', 'name', 'text', { required: true }),
        renderFormField('Slug', 'slug'),
        renderFormField('Designation', 'designation'),
        renderFormField('Qualification', 'qualification'),
        renderFormField('Experience (Years)', 'experience_years', 'number'),
        renderFormField('Bio (HTML)', 'bio_html', 'text', { multiline: true }),
        renderFormField('Photo URL', 'photo_url'),
        renderFormField('Phone', 'phone'),
        renderFormField('Email', 'email'),
        renderFormField('Sort Order', 'sort_order', 'number'),
        renderFormField('Status', 'status', 'select', { choices: ['published', 'draft'] }),
      ];
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 className="text-lg font-bold text-[#0b1c30] font-headline">{title}</h3>
            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {saveMsg && (
              <div className={`p-3 rounded-lg text-sm ${saveMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saveMsg}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-[#0084d1] hover:bg-[#006bb0] text-white text-sm font-bold rounded-lg shadow transition disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const SEARCH_PLACEHOLDERS = {
    bookings: 'Search patient, phone, email, service…',
    inquiries: 'Search name, email, subject…',
    blogs: 'Search title, slug, author…',
  };

  const STATUS_OPTIONS = {
    bookings: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    inquiries: ['New', 'Read', 'Replied', 'Archived'],
    blogs: ['published', 'draft'],
  };

  const renderListToolbar = (entity) => {
    const ls = listState[entity];
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <span className="material-symbols-outlined text-base text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">search</span>
          <input
            type="text"
            value={ls.search}
            onChange={e => updateListState(entity, { search: e.target.value, page: 1 })}
            placeholder={SEARCH_PLACEHOLDERS[entity]}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none"
          />
        </div>
        <select
          value={ls.status}
          onChange={e => updateListState(entity, { status: e.target.value, page: 1 })}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0084d1] outline-none"
        >
          <option value="">All statuses</option>
          {(STATUS_OPTIONS[entity] || []).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(ls.search || ls.status) && (
          <button
            onClick={() => updateListState(entity, { search: '', status: '', page: 1 })}
            className="text-xs font-semibold text-gray-500 hover:text-[#0084d1] transition"
          >
            Clear
          </button>
        )}
      </div>
    );
  };

  const renderPagination = (entity) => {
    const pg = pagination[entity];
    if (!pg || pg.totalPages <= 1) return null;
    const { page, totalPages, total } = pg;
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
        <span className="text-xs text-gray-500">
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateListState(entity, { page: page - 1 })}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span> Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => updateListState(entity, { page: page + 1 })}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition"
          >
            Next <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#0b1c30] font-headline">Dashboard Overview</h2>
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats.totalAppointments, icon: 'calendar_month', color: 'text-[#0084d1]' },
            { label: 'Pending Bookings', value: stats.pendingAppointments, icon: 'pending', color: 'text-[#f37021]' },
            { label: 'Total Inquiries', value: stats.totalContacts, icon: 'mail', color: 'text-[#0084d1]' },
            { label: 'Services', value: stats.totalServices, icon: 'medical_services', color: 'text-green-600' },
            { label: 'Treatments', value: stats.totalTreatments, icon: 'healing', color: 'text-purple-600' },
            { label: 'Blog Posts', value: stats.totalBlogs, icon: 'post_add', color: 'text-[#0084d1]' },
            { label: 'Testimonials', value: stats.totalTestimonials, icon: 'reviews', color: 'text-[#f37021]' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
              </div>
              <div className="text-3xl font-bold text-[#0b1c30] font-headline">{s.value ?? '—'}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {!stats && <div className="text-center py-12 text-gray-400">Loading stats...</div>}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#0b1c30] font-headline">Patient Bookings</h2>
        {renderListToolbar('bookings')}
      </div>
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No bookings yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900">{a.patient_name}</td>
                    <td className="py-3 px-4">
                      <a href={`tel:${a.phone}`} className="text-[#0084d1] hover:underline">{a.phone}</a>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{a.email || '—'}</td>
                    <td className="py-3 px-4 text-gray-700">{a.service_or_treatment || 'General'}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {a.preferred_date ? formatBookingDate(a.preferred_date) : 'ASAP'} ({a.preferred_time || '—'})
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[a.status] || 'bg-gray-100 text-gray-600'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={a.status}
                          onChange={e => handleUpdateAppointmentStatus(a.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-[#0084d1] outline-none"
                        >
                          {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                        <button onClick={() => handleDelete('appointments', a.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {renderPagination('bookings')}
    </div>
  );

  const renderInquiries = () => (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <h2 className="text-2xl font-bold text-[#0b1c30] font-headline">Contact Inquiries</h2>
        {renderListToolbar('inquiries')}
      </div>
      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No inquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {contacts.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <div className="flex gap-4 text-sm text-gray-500 mt-1">
                    <span>Email: <a href={`mailto:${c.email}`} className="text-[#0084d1] hover:underline">{c.email}</a></span>
                    {c.phone && <span>Phone: <a href={`tel:${c.phone}`} className="text-[#0084d1] hover:underline">{c.phone}</a></span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {c.created_at && <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</span>}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[c.status] || 'bg-blue-100 text-blue-800'}`}>
                    {c.status || 'New'}
                  </span>
                </div>
              </div>
              {c.subject && <div className="text-sm font-semibold text-gray-700 mb-2">Subject: {c.subject}</div>}
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">{c.message}</p>
              <div className="flex items-center gap-2 mt-3">
                <select
                  value={c.status || 'New'}
                  onChange={e => handleUpdateContactStatus(c.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-[#0084d1] outline-none"
                >
                  {['New', 'Read', 'Replied', 'Archived'].map(s => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => handleDelete('contacts', c.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {renderPagination('inquiries')}
    </div>
  );

  const renderCrudTable = (title, entity, items, columns, addLabel) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0b1c30] font-headline">{title}</h2>
        <button
          onClick={() => openCreateModal(entity)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0084d1] hover:bg-[#006bb0] text-white text-sm font-bold rounded-lg shadow transition"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {addLabel || `Add ${title.slice(0, -1)}`}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No {title.toLowerCase()} yet.</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold">
                  {columns.map(col => <th key={col.key} className="py-3 px-4">{col.label}</th>)}
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    {columns.map(col => (
                      <td key={col.key} className="py-3 px-4">
                        {col.key === 'status' ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[item[col.key]] || 'bg-gray-100 text-gray-600'}`}>
                            {item[col.key]}
                          </span>
                        ) : col.key === 'is_featured' ? (
                          <span className={`material-symbols-outlined text-base ${item[col.key] ? 'text-yellow-500' : 'text-gray-300'}`}>
                            {item[col.key] ? 'star' : 'star_border'}
                          </span>
                        ) : col.key === 'rating' ? (
                          <span className="text-yellow-500 font-bold">{item[col.key]}/5</span>
                        ) : (
                          <span className={col.truncate ? 'truncate max-w-[200px] block' : ''}>
                            {item[col.key] ?? '—'}
                          </span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditModal(entity, item)} className="text-[#0084d1] hover:text-[#006bb0] p-1 rounded hover:bg-blue-50 transition">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDelete(entity, item.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderServices = () => renderCrudTable(
    'Services', 'services', services,
    [
      { key: 'name', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      { key: 'icon', label: 'Icon' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' },
    ]
  );

  const renderTreatments = () => renderCrudTable(
    'Treatments', 'treatments', treatments,
    [
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'slug', label: 'Slug' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' },
    ]
  );

  const renderBlogs = () => (
    <div className="space-y-4">
      {renderCrudTable('Blogs', 'blogs', blogs,
        [
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          { key: 'author_name', label: 'Author' },
          { key: 'status', label: 'Status' },
        ]
      )}
      {renderPagination('blogs')}
    </div>
  );

  const renderTestimonialsList = () => renderCrudTable(
    'Testimonials', 'testimonials', testimonials,
    [
      { key: 'patient_name', label: 'Patient' },
      { key: 'location', label: 'Location' },
      { key: 'condition_treated', label: 'Condition' },
      { key: 'rating', label: 'Rating' },
      { key: 'is_featured', label: 'Featured' },
      { key: 'status', label: 'Status' },
    ]
  );

  const renderDoctors = () => renderCrudTable(
    'Doctors', 'doctors', doctors,
    [
      { key: 'name', label: 'Name' },
      { key: 'designation', label: 'Designation' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'experience_years', label: 'Exp. (Yrs)' },
      { key: 'sort_order', label: 'Order' },
      { key: 'status', label: 'Status' },
    ]
  );

  const settingsGroups = [
    {
      title: 'Contact Information',
      icon: 'phone',
      keys: ['clinic_phone', 'clinic_secondary_phone', 'clinic_email', 'clinic_secondary_email'],
    },
    {
      title: 'Address & Location',
      icon: 'location_on',
      keys: ['clinic_address', 'clinic_city', 'clinic_state', 'clinic_pincode', 'clinic_map_embed_url'],
    },
    {
      title: 'Business Hours',
      icon: 'schedule',
      keys: ['hours_weekday', 'hours_saturday', 'hours_sunday', 'hours_holiday'],
    },
    {
      title: 'Social Media',
      icon: 'share',
      keys: ['social_facebook', 'social_instagram', 'social_youtube', 'social_twitter', 'social_linkedin'],
    },
    {
      title: 'Branding & SEO',
      icon: 'palette',
      keys: ['site_name', 'site_tagline', 'site_description', 'logo_url', 'favicon_url'],
    },
    {
      title: 'Other Settings',
      icon: 'tune',
      keys: ['whatsapp_number', 'google_analytics_id', 'clinic_established_year'],
    },
  ];

  const renderSettings = () => {
    const getValue = (key) => {
      const found = siteSettings.find(s => s.setting_key === key);
      return found ? found.setting_value : '';
    };

    const handleChange = (key, value) => {
      setSiteSettings(prev => {
        const exists = prev.find(s => s.setting_key === key);
        if (exists) return prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s);
        return [...prev, { setting_key: key, setting_value: value }];
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0b1c30] font-headline">Site Settings</h2>
        </div>

        {siteSettings.length === 0 && settingsLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">Loading settings...</div>
        ) : siteSettings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">No settings found.</div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {saveMsg && (
              <div className={`p-3 rounded-lg text-sm ${saveMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {saveMsg}
              </div>
            )}

            {settingsGroups.map(group => (
              <div key={group.title} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#0084d1] text-xl">{group.icon}</span>
                  <h3 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider">{group.title}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.keys.map(key => {
                    const val = getValue(key);
                    const isLarge = key.includes('address') || key.includes('description') || key.includes('tagline') || key.includes('embed');
                    return (
                      <div key={key} className={isLarge ? 'md:col-span-2' : ''}>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 capitalize">
                          {key.replace(/_/g, ' ').replace(/clinic |site |social |social /g, '')}
                        </label>
                        {isLarge ? (
                          <textarea
                            rows={3}
                            value={val}
                            onChange={e => handleChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none resize-y"
                          />
                        ) : (
                          <input
                            type={key.includes('email') ? 'email' : key.includes('phone') || key.includes('whatsapp') || key.includes('pincode') ? 'tel' : 'text'}
                            value={val}
                            onChange={e => handleChange(key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#0084d1] outline-none"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-[#0084d1] hover:bg-[#006bb0] text-white font-bold text-sm rounded-lg shadow transition disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return renderDashboard();
      case 'bookings': return renderBookings();
      case 'inquiries': return renderInquiries();
      case 'services': return renderServices();
      case 'treatments': return renderTreatments();
      case 'blogs': return renderBlogs();
      case 'testimonials': return renderTestimonialsList();
      case 'doctors': return renderDoctors();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Inter, sans-serif' }}>
      {renderModal()}

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1c30] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/images/logo1.png" alt="KR Physiotherapy" className="h-10" />
            <div>
              <div className="text-sm font-bold font-headline leading-tight">KR Physiotherapy</div>
              <div className="text-[10px] text-[#0084d1] font-semibold uppercase tracking-wider">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                activePage === item.id
                  ? 'bg-[#0084d1] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition mb-1"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
            <span>View Website</span>
          </a>
          <button
            onClick={logoutConfirm}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-900/30 hover:text-red-300 transition"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <h1 className="text-lg font-bold text-[#0b1c30] font-headline capitalize">
              {activePage === 'dashboard' ? 'Dashboard' : activePage}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {loading && <span className="text-xs text-gray-400">Loading...</span>}
            <span className="hidden sm:inline text-gray-500 text-xs">KR Physiotherapy Admin</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
