const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

// In-memory demo data to keep the app self-contained
const seed = () => {
  const institutions = [
    {
      id: 'inst-1',
      name: 'Central City Hospital',
      slug: 'central-city-hospital',
      type: 'hospital',
      address: '123 Health Ave',
      logo_url: '',
      is_active: true,
    },
    {
      id: 'inst-2',
      name: 'Downtown Bank',
      slug: 'downtown-bank',
      type: 'bank',
      address: '45 Finance St',
      logo_url: '',
      is_active: true,
    },
  ];

  const services = [
    {
      id: 'svc-1',
      institution_id: 'inst-1',
      name: 'General Consultation',
      description: 'Meet a physician for a general check-up.',
      duration_minutes: 30,
      icon: 'stethoscope',
      prefix: 'H',
      is_active: true,
    },
    {
      id: 'svc-2',
      institution_id: 'inst-1',
      name: 'Blood Test',
      description: 'Standard blood analysis.',
      duration_minutes: 15,
      icon: 'clipboard',
      prefix: 'B',
      is_active: true,
    },
    {
      id: 'svc-3',
      institution_id: 'inst-2',
      name: 'Open Account',
      description: 'Open a new checking account.',
      duration_minutes: 25,
      icon: 'wallet',
      prefix: 'A',
      is_active: true,
    },
  ];

  const today = new Date();
  const toDate = (d) => d.toISOString().slice(0, 10);
  const timeSlots = [
    {
      id: 'ts-1',
      institution_id: 'inst-1',
      date: toDate(today),
      start_time: '09:00',
      end_time: '09:30',
    },
    {
      id: 'ts-2',
      institution_id: 'inst-1',
      date: toDate(today),
      start_time: '10:00',
      end_time: '10:30',
    },
    {
      id: 'ts-3',
      institution_id: 'inst-2',
      date: toDate(today),
      start_time: '11:00',
      end_time: '11:30',
    },
  ];

  const appointments = [
    {
      id: 'apt-1',
      institution_id: 'inst-1',
      service_id: 'svc-1',
      time_slot_id: 'ts-1',
      ticket_number: 'H01',
      customer_phone: '+25770000001',
      appointment_date: toDate(today),
      appointment_time: '09:00',
      status: 'confirmed',
      otp_verified: true,
    },
  ];

  const counters = [
    {
      id: 'ctr-1',
      institution_id: 'inst-1',
      number: 1,
      status: 'available',
      is_active: true,
      staff_name: 'Alice',
      current_ticket: 'H01',
    },
  ];

  return { institutions, services, timeSlots, appointments, counters, ratings: [] };
};

const store = seed();

const match = (item, criteria = {}) => {
  return Object.entries(criteria).every(([key, value]) => item[key] === value);
};

const list = (collection) => async () => {
  await delay();
  return [...store[collection]];
};

const filter = (collection) => async (criteria = {}) => {
  await delay();
  return store[collection].filter((item) => match(item, criteria));
};

const create = (collection) => async (data) => {
  await delay();
  const id = `${collection}-${Date.now()}`;
  const record = { id, ...data };
  store[collection].push(record);
  return record;
};

const update = (collection) => async (id, data) => {
  await delay();
  const idx = store[collection].findIndex((i) => i.id === id);
  if (idx === -1) throw new Error('Not found');
  store[collection][idx] = { ...store[collection][idx], ...data };
  return store[collection][idx];
};

const remove = (collection) => async (id) => {
  await delay();
  const idx = store[collection].findIndex((i) => i.id === id);
  if (idx !== -1) store[collection].splice(idx, 1);
  return true;
};

export const api = {
  auth: {
    isAuthenticated: async () => {
      await delay(40);
      return Boolean(localStorage.getItem('rdvbi_admin_token'));
    },
    redirectToLogin: (redirectUrl = '/') => {
      localStorage.setItem('rdvbi_admin_token', 'demo');
      window.location.href = redirectUrl;
    },
    logout: () => {
      localStorage.removeItem('rdvbi_admin_token');
      window.location.href = '/';
    },
    me: async () => {
      await delay(40);
      const token = localStorage.getItem('rdvbi_admin_token');
      if (!token) throw new Error('Not authenticated');
      return {
        id: 'admin-1',
        full_name: 'Demo Admin',
        email: 'admin@example.com',
        role: 'admin',
      };
    },
  },
  entities: {
    Institution: {
      list: list('institutions'),
      filter: filter('institutions'),
      create: create('institutions'),
      update: update('institutions'),
      delete: remove('institutions'),
    },
    Service: {
      list: list('services'),
      filter: filter('services'),
      create: create('services'),
      update: update('services'),
      delete: remove('services'),
    },
    TimeSlot: {
      filter: filter('timeSlots'),
      create: create('timeSlots'),
      update: update('timeSlots'),
      delete: remove('timeSlots'),
      bulkCreate: async (records) => {
        await delay();
        records.forEach((r) => store.timeSlots.push({ id: `ts-${Date.now()}-${Math.random()}`, ...r }));
        return true;
      },
    },
    Appointment: {
      list: list('appointments'),
      filter: filter('appointments'),
      create: create('appointments'),
      update: update('appointments'),
      delete: remove('appointments'),
    },
    Counter: {
      filter: filter('counters'),
      create: create('counters'),
      update: update('counters'),
      delete: remove('counters'),
    },
    CustomerRating: {
      create: create('ratings'),
      filter: filter('ratings'),
    },
  },
  integrations: {
    Core: {
      SendEmail: async ({ to, subject }) => {
        console.info('Mock email sent', { to, subject });
        await delay();
        return true;
      },
      UploadFile: async ({ file }) => {
        const file_url = URL.createObjectURL(file);
        await delay();
        return { file_url };
      },
    },
  },
};

