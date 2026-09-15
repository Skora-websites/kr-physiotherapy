function validateAppointment(data) {
  const errors = [];
  if (!data.patient_name || data.patient_name.trim().length < 2) {
    errors.push('Patient name must be at least 2 characters.');
  }
  if (!data.phone || !/^\+?[0-9\s-]{8,15}$/.test(data.phone.trim())) {
    errors.push('A valid phone number is required.');
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('If provided, email must be valid.');
  }
  return errors;
}

function validateContact(data) {
  const errors = [];
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters.');
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!data.message || data.message.trim().length < 5) {
    errors.push('Message must be at least 5 characters.');
  }
  return errors;
}

module.exports = {
  validateAppointment,
  validateContact
};
