export const SERVICES_STORAGE_KEY = 'csa_service_catalog';

export const DEFAULT_SERVICES = [
  {
    id: 'chimney-inspection',
    title: 'Level 1 Chimney Inspection',
    price: 180,
    duration: '60 mins',
    desc: 'Visual evaluation of a ready-to-use chimney system, flue liner, and masonry.'
  },
  {
    id: 'wood-stove-check',
    title: 'Wood Stove & WETT Check',
    price: 220,
    duration: '75 mins',
    desc: 'Complete WETT-compliant inspection for insurance and wood-burning appliances.'
  },
  {
    id: 'flue-pipe-check',
    title: 'Flue & Creosote Assessment',
    price: 195,
    duration: '60 mins',
    desc: 'Deep flue clearance verification and creosote build-up assessment.'
  }
];

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'service';
}

export function normalizeService(service, fallbackId) {
  return {
    id: service.id || fallbackId || slugify(service.title),
    title: service.title?.trim() || 'Untitled Service',
    price: Number(service.price) || 0,
    duration: service.duration?.trim() || '60 mins',
    desc: service.desc?.trim() || 'Service description pending.'
  };
}

export function addService(services, newService) {
  const nextService = normalizeService(newService, slugify(newService.title));
  const existing = services.some((service) => service.id === nextService.id);

  return [
    ...services,
    {
      ...nextService,
      id: existing ? `${nextService.id}-${Date.now()}` : nextService.id
    }
  ];
}

export function updateService(services, serviceId, updates) {
  return services.map((service) => {
    if (service.id !== serviceId) return service;

    return normalizeService({ ...service, ...updates }, serviceId);
  });
}

export function deleteService(services, serviceId) {
  return services.filter((service) => service.id !== serviceId);
}

export function getStoredServices() {
  if (typeof window === 'undefined') {
    return DEFAULT_SERVICES;
  }

  try {
    const raw = window.localStorage.getItem(SERVICES_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((service, index) => normalizeService(service, `${slugify(service.title || 'service')}-${index + 1}`));
    }
  } catch (error) {
    console.warn('Could not read saved services, falling back to defaults.', error);
  }

  return DEFAULT_SERVICES;
}

export function saveServices(services) {
  if (typeof window === 'undefined') {
    return;
  }

  const clean = Array.isArray(services) ? services.map((service, index) => normalizeService(service, `${slugify(service.title || 'service')}-${index + 1}`)) : DEFAULT_SERVICES;
  window.localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(clean));
  return clean;
}
