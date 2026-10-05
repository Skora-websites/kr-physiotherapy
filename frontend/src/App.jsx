import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppointmentModal from './components/AppointmentModal';
import { HomeTemplate, AboutTemplate } from './templates/HomeAndAbout';
import {
  ServicesListTemplate,
  TreatmentsListTemplate,
  ServiceTemplate,
  TreatmentTemplate,
  DoctorTemplate,
  LocationTemplate,
  BlogListTemplate,
  BlogArticleTemplate,
  ContactTemplate,
  LegalTemplate
} from './templates/ClinicalTemplates';
import AdminDashboard from './templates/AdminDashboard';
import DevTools from './components/DevTools';

export default function App() {
  const [initialData, setInitialData] = useState(() => window.__INITIAL_DATA__ || {});
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');

  const currentPath = window.location.pathname;

  const handleOpenBooking = (serviceName = '') => {
    if (serviceName) setSelectedService(serviceName);
    setBookingOpen(true);
  };

  // Dedicated Admin Route
  if (currentPath === '/admin' || currentPath === '/admin/') {
    return <AdminDashboard />;
  }

  const renderCurrentTemplate = () => {
    const { entityType, content } = initialData;
    // Clean URLs: match routes with or without the .html suffix
    const path = currentPath.replace(/\.html$/, '');

    if (currentPath === '/' || currentPath === '/index.htm') {
      return <HomeTemplate onBook={handleOpenBooking} />;
    }

    if (path === '/about') {
      return <AboutTemplate page={content} onBook={handleOpenBooking} />;
    }

    if (path === '/services') {
      return <ServicesListTemplate onBook={handleOpenBooking} />;
    }

    if (path === '/treatments') {
      return <TreatmentsListTemplate onBook={handleOpenBooking} />;
    }

    if (path === '/contact') {
      return <ContactTemplate onBook={handleOpenBooking} />;
    }

    if (path === '/privacy-policy' || path === '/terms-and-conditions') {
      return <LegalTemplate page={content} />;
    }

    if (currentPath.startsWith('/blogs/')) {
      const slug = currentPath.replace(/^\/blogs\//, '').replace(/\/index\.htm$/, '').replace(/\/$/, '');
      if (!slug || slug === 'index.htm') {
        return <BlogListTemplate />;
      }
      return <BlogArticleTemplate blog={content} />;
    }

    if (currentPath.startsWith('/doctor-')) {
      return <DoctorTemplate doctor={content} onBook={handleOpenBooking} />;
    }

    if (currentPath.includes('-sector-')) {
      return <LocationTemplate page={content} onBook={handleOpenBooking} />;
    }

    if (entityType === 'service' || path.includes('physiotherapy')) {
      return <ServiceTemplate service={content} onBook={handleOpenBooking} />;
    }

    if (entityType === 'treatment' || path.includes('-pain') || path.includes('therapy') || path.includes('palsy') || path.includes('scoliosis')) {
      return <TreatmentTemplate treatment={content} onBook={handleOpenBooking} />;
    }

    // Default to standard page
    return <AboutTemplate page={content} onBook={handleOpenBooking} />;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-on-surface">
      <Navbar onOpenBooking={() => handleOpenBooking()} />
      <main className="flex-grow">
        {renderCurrentTemplate()}
      </main>
      <Footer />
      <AppointmentModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialService={selectedService}
      />
      {/* Agentation: visual annotation overlay — dev builds only */}
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </div>
  );
}
