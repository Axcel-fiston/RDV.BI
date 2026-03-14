const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const ACCESS_TOKEN_KEY = 'rdvbi_access_token';
const REFRESH_TOKEN_KEY = 'rdvbi_refresh_token';
const USER_KEY = 'rdvbi_user';

// -------- helpers --------
const delay = (ms = 80) => new Promise((res) => setTimeout(res, ms));

const toSnake = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`), v])
  );

const mapInstitution = (inst) =>
  inst && {
    id: inst.id,
    name: inst.name,
    institution_name: inst.name,
    slug: inst.slug,
    type: inst.type,
    institution_type: inst.type,
    address: inst.address,
    logo_url: inst.logoUrl,
    logoUrl: inst.logoUrl,
    contact_email: inst.contactEmail,
    contact_phone: inst.contactPhone,
    email: inst.contactEmail,
    phone: inst.contactPhone,
    is_active: inst.active,
    status: inst.status?.toLowerCase(),
    created_date: inst.createdAt,
    approved_at: inst.approvedAt,
    rejected_at: inst.rejectedAt,
    rejection_reason: inst.approvalNotes,
    admin_name: inst.adminFullName,
    admin_email: inst.adminEmail,
  };

const mapService = (svc) =>
  svc && {
    id: svc.id,
    institution_id: svc.institution?.id || svc.institutionId,
    name: svc.name,
    description: svc.description,
    duration_minutes: svc.durationMinutes,
    prefix: svc.prefix,
    is_active: svc.active,
  };

const mapTimeSlot = (slot) =>
  slot && {
    id: slot.id,
    institution_id: slot.institution?.id || slot.institutionId,
    date: slot.date,
    start_time: slot.startTime,
    end_time: slot.endTime,
    capacity: slot.capacity,
    booked_count: slot.bookedCount,
    max_bookings: slot.capacity,
    current_bookings: slot.bookedCount,
    is_blocked: slot.blocked,
    block_reason: slot.blockReason,
  };

const mapAppointment = (apt) =>
  apt && {
    id: apt.id,
    institution_id: apt.institution?.id || apt.institutionId,
    service_id: apt.service?.id || apt.serviceId,
    time_slot_id: apt.timeSlot?.id || apt.timeSlotId,
    ticket_number: apt.ticketNumber,
    customer_phone: apt.customerPhone,
    customer_email: apt.customerEmail,
    customer_name: apt.customerName || apt.customer_name,
    appointment_date: apt.appointmentDate,
    appointment_time: apt.appointmentTime,
    status: apt.status?.toLowerCase(),
    otp_verified: apt.otpVerified,
    counter_number: apt.counterNumber,
    called_time: apt.calledTime,
    completed_time: apt.completedTime,
  };

const mapCounter = (counter) =>
  counter && {
    id: counter.id,
    institution_id: counter.institution?.id || counter.institutionId,
    number: counter.number,
    staff_name: counter.staffName,
    is_active: counter.active,
    status: counter.status?.toLowerCase(),
    current_ticket: counter.currentTicket,
  };

const mapUser = (user) =>
  user && {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    role: user.role,
    active: user.active,
    institution_id: user.institutionId,
    institution_name: user.institutionName,
  };

const getAccessToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const getRefreshToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const getStoredUser = () => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

const setSession = ({ accessToken, refreshToken, user }) => {
  if (typeof localStorage === 'undefined') return;
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const refreshSession = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  setSession(data);
  return data.accessToken;
};

const authorizedFetch = async (path, { method = 'GET', headers = {}, body, admin = false } = {}) => {
  const opts = {
    method,
    headers: { Accept: 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  };
  if (body) opts.headers['Content-Type'] = 'application/json';
  if (admin) {
    let token = getAccessToken();
    if (!token) throw new Error('Not authenticated');
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, opts);
  if ((res.status === 401 || (admin && res.status === 403)) && getRefreshToken()) {
    try {
      const newToken = await refreshSession();
      opts.headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, opts);
    } catch (e) {
      clearSession();
      throw e;
    }
  }

  if (!res.ok) {
    const raw = await res.text();
    let message = raw || res.statusText || 'Request failed';
    if (raw) {
      try {
        const payload = JSON.parse(raw);
        message = payload.error || payload.message || raw;
      } catch {
        message = raw;
      }
    }
    throw new Error(`${res.status || 'HTTP'} ${message}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const request = authorizedFetch;

// -------------- API ----------------
export const api = {
  auth: {
    login: async ({ email, password }) => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const raw = await res.text();
        let message = raw || 'Login failed';
        if (raw) {
          try {
            const payload = JSON.parse(raw);
            message = payload.error || payload.message || raw;
          } catch {
            message = raw;
          }
        }
        throw new Error(message);
      }
      const data = await res.json();
      setSession(data);
      return data.user;
    },
    logout: () => {
      clearSession();
      window.location.href = '/';
    },
    me: async () => {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      const user = await request('/api/auth/me', { admin: true });
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    },
  },

  entities: {
    Institution: {
      list: async () => {
        const data = await request('/api/public/institutions');
        return data.map(mapInstitution).filter(Boolean);
      },
      listPending: async () => {
        const data = await request('/api/admin/institutions/pending', { admin: true });
        return (data || []).map(mapInstitution).filter(Boolean);
      },
      listForReview: async (status) => {
        const query = status ? `?status=${status.toUpperCase()}` : '';
        const data = await request(`/api/admin/institutions${query}`, { admin: true });
        return (data || []).map(mapInstitution).filter(Boolean);
      },
      filter: async (criteria = {}) => {
        if (criteria.slug) {
          const payload = await request(`/api/public/institutions/${criteria.slug}`);
          return payload.institution ? [mapInstitution(payload.institution)] : [];
        }
        const [publicInstitutions, pendingInstitutions] = await Promise.all([
          api.entities.Institution.list(),
          getAccessToken() ? api.entities.Institution.listPending().catch(() => []) : Promise.resolve([]),
        ]);
        const deduped = [...publicInstitutions, ...pendingInstitutions].filter(
          (institution, index, array) => array.findIndex((item) => item.id === institution.id) === index
        );
        return deduped.filter((inst) => Object.entries(criteria).every(([k, v]) => inst[k] === v));
      },
      create: async (data) => {
        const body = {
          name: data.name,
          slug: data.slug,
          type: data.type,
          contactEmail: data.contact_email,
          contactPhone: data.contact_phone,
          address: data.address,
          description: data.description,
          logoUrl: data.logo_url,
          locationLat: data.location_lat,
          locationLng: data.location_lng,
          adminFullName: data.admin_full_name,
          adminEmail: data.admin_email,
          adminPassword: data.admin_password,
        };
        const res = await request('/api/public/institutions/register', { method: 'POST', body });
        return res;
      },
      update: async (id, data) => {
        const body = {
          name: data.name,
          slug: data.slug,
          type: data.type,
          address: data.address,
          contactPhone: data.phone ?? data.contact_phone,
          contactEmail: data.email ?? data.contact_email,
          logoUrl: data.logo_url ?? data.logoUrl,
          active: data.is_active,
        };
        const res = await request(`/api/admin/institutions/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapInstitution(res);
      },
      approve: async (id, notes) => {
        const body = notes ? { notes } : undefined;
        const res = await request(`/api/admin/institutions/${id}/approve`, {
          method: 'POST',
          admin: true,
          body,
        });
        return mapInstitution(res);
      },
      reject: async (id, notes) => {
        const body = notes ? { notes } : undefined;
        const res = await request(`/api/admin/institutions/${id}/reject`, {
          method: 'POST',
          admin: true,
          body,
        });
        return mapInstitution(res);
      },
    },

    Service: {
      filter: async (criteria = {}) => {
        // Prefer admin list to include inactive services
        if (criteria.institution_id) {
          try {
            const payload = await request(`/api/admin/institutions/${criteria.institution_id}/services`, { admin: true });
            const services = (payload || []).map(mapService).filter(Boolean);
            return services.filter((s) =>
              Object.entries(criteria).every(([k, v]) => s[k] === v)
            );
          } catch (err) {
            // Fallback to public if admin endpoint fails
            const institutions = await api.entities.Institution.list();
            const inst = institutions.find((i) => i.id === criteria.institution_id);
            if (!inst) return [];
            const payload = await request(`/api/public/institutions/${inst.slug}`);
            const services = (payload.services || []).map(mapService).filter(Boolean);
            return services.filter((s) =>
              Object.entries(criteria).every(([k, v]) => s[k] === v)
            );
          }
        }
        return [];
      },
      create: async (data) => {
        const body = {
          name: data.name,
          description: data.description,
          durationMinutes: data.duration_minutes,
          prefix: data.prefix,
          active: data.is_active ?? true,
        };
        return request(`/api/admin/institutions/${data.institution_id}/services`, {
          method: 'POST',
          admin: true,
          body,
        }).then(mapService);
      },
      update: async (id, data) => {
        const body = {
          name: data.name,
          description: data.description,
          durationMinutes: data.duration_minutes,
          prefix: data.prefix,
          active: data.is_active,
        };
        const res = await request(`/api/admin/services/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapService(res);
      },
      delete: async (id) => {
        await request(`/api/admin/services/${id}`, { method: 'DELETE', admin: true });
        return true;
      },
      list: async () => {
        const insts = await api.entities.Institution.list();
        const all = await Promise.all(
          insts.map((inst) => api.entities.Service.filter({ institution_id: inst.id }))
        );
        return all.flat();
      },
    },

    TimeSlot: {
      filter: async (criteria = {}) => {
        if (criteria.institution_id) {
          try {
            const query = criteria.date ? `?date=${criteria.date}` : '';
            const res = await request(`/api/admin/institutions/${criteria.institution_id}/time-slots${query}`, { admin: true });
            const slots = (res || []).map(mapTimeSlot).filter(Boolean);
            return slots.filter((s) =>
              Object.entries(criteria).every(([k, v]) => s[k] === v)
            );
          } catch (err) {
            const institutions = await api.entities.Institution.list();
            const inst = institutions.find((i) => i.id === criteria.institution_id);
            if (!inst) return [];
            const query = criteria.date ? `?date=${criteria.date}` : '';
            const payload = await request(`/api/public/institutions/${inst.slug}${query}`);
            const slots = (payload.timeSlots || []).map(mapTimeSlot).filter(Boolean);
            return slots.filter((s) =>
              Object.entries(criteria).every(([k, v]) => s[k] === v)
            );
          }
        }
        return [];
      },
      create: async (data) => {
        const body = [
          {
            date: data.date,
            startTime: data.start_time,
            endTime: data.end_time,
            capacity: data.capacity ?? 1,
          },
        ];
        const res = await request(`/api/admin/institutions/${data.institution_id}/time-slots`, {
          method: 'POST',
          admin: true,
          body,
        });
        return Array.isArray(res) ? res.map(mapTimeSlot) : res;
      },
      update: async (id, data) => {
        const body = {
          date: data.date,
          startTime: data.start_time,
          endTime: data.end_time,
          capacity: data.capacity,
          blocked: data.is_blocked,
          blockReason: data.block_reason,
        };
        const res = await request(`/api/admin/time-slots/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapTimeSlot(res);
      },
      delete: async (id) => {
        await request(`/api/admin/time-slots/${id}`, { method: 'DELETE', admin: true });
        return true;
      },
      bulkCreate: async (records) => {
          await Promise.all(records.map(r => api.entities.TimeSlot.create(r)));
          return true;
      },
    },

    Appointment: {
      list: async () => {
        const res = await request('/api/admin/appointments', { admin: true });
        return res.map(mapAppointment).filter(Boolean);
      },
      filter: async (criteria = {}) => {
        const params = new URLSearchParams();
        if (criteria.id) params.set('id', criteria.id);
        if (criteria.institution_id) params.set('institutionId', criteria.institution_id);
        if (criteria.appointment_date) params.set('appointmentDate', criteria.appointment_date);
        if (criteria.customer_phone) params.set('customerPhone', criteria.customer_phone);
        const qs = params.toString();
        const res = await request(`/api/admin/appointments${qs ? `?${qs}` : ''}`, { admin: true });
        const list = Array.isArray(res) ? res : [res];
        return list.map(mapAppointment).filter(Boolean);
      },
      create: async (data) => {
    const body = {
      institutionId: data.institution_id,
      serviceId: data.service_id,
      timeSlotId: data.time_slot_id,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      appointmentDate: data.appointment_date,
      appointmentTime: data.appointment_time,
      ticketNumber: data.ticket_number,
      customer_name: data.customer_name,
    };
        const res = await request('/api/public/appointments', { method: 'POST', body });
        return mapAppointment(res);
      },
      verifyOtp: async ({ appointmentId, code, phone }) => {
        if (!appointmentId) throw new Error('Appointment id is required to verify OTP');
        const res = await request(`/api/public/appointments/${appointmentId}/verify-otp`, {
          method: 'POST',
          body: {
            code,
            customer_phone: phone,
          },
        });
        return mapAppointment(res);
      },
      update: async (id, data) => {
        const body = {
          status: data.status?.toUpperCase(),
          appointmentDate: data.appointment_date,
          appointmentTime: data.appointment_time,
          ticketNumber: data.ticket_number,
          timeSlotId: data.time_slot_id,
          customerEmail: data.customer_email,
          customerPhone: data.customer_phone,
        };
        const res = await request(`/api/admin/appointments/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapAppointment(res);
      },
      delete: async () => {
        throw new Error('Appointment delete not supported by backend');
      },
    },

    User: {
      list: async () => {
        const res = await request('/api/admin/users', { admin: true });
        return (res || []).map(mapUser).filter(Boolean);
      },
      create: async (data) => {
        const body = {
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          password: data.password,
          active: data.active,
        };
        const res = await request('/api/admin/users', {
          method: 'POST',
          admin: true,
          body,
        });
        return mapUser(res);
      },
      update: async (id, data) => {
        const body = {
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          password: data.password,
          active: data.active,
        };
        const res = await request(`/api/admin/users/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapUser(res);
      },
      delete: async (id) => {
        await request(`/api/admin/users/${id}`, { method: 'DELETE', admin: true });
        return true;
      },
    },

    Counter: {
      filter: async (criteria = {}) => {
        if (!criteria.institution_id) return [];
        const res = await request(`/api/admin/institutions/${criteria.institution_id}/counters`, { admin: true });
        const counters = (res || []).map(mapCounter).filter(Boolean);
        return counters.filter(c =>
          Object.entries(criteria).every(([k, v]) => c[k] === v)
        );
      },
      create: async (data) => {
        const body = {
          number: data.number,
          staffName: data.staff_name,
          active: data.is_active,
        };
        const res = await request(`/api/admin/institutions/${data.institution_id}/counters`, {
          method: 'POST',
          admin: true,
          body,
        });
        return mapCounter(res);
      },
      update: async (id, data) => {
        const body = {
          number: data.number,
          staffName: data.staff_name,
          active: data.is_active,
          status: data.status ? data.status.toUpperCase() : undefined,
          currentTicket: data.current_ticket,
        };
        const res = await request(`/api/admin/counters/${id}`, {
          method: 'PUT',
          admin: true,
          body,
        });
        return mapCounter(res);
      },
      delete: async (id) => {
        await request(`/api/admin/counters/${id}`, { method: 'DELETE', admin: true });
        return true;
      },
    },

    CustomerRating: {
      create: async () => {
        await delay();
        return { ok: true };
      },
      filter: async () => [],
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

export { getAccessToken, getRefreshToken, getStoredUser, clearSession };
