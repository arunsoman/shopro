import type {
  BasicInfoForm,
  LocationForm,
  ContactOwnerForm,
  MenuSetupForm,
  OperatingHoursForm,
  DocumentsForm,
  OnboardingProgress,
} from './onboardingSchemas'

const BASE = '/api/v1'

// ── Auth token helper ──

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('shopro-token') ?? ''
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ── Step 1: Create Restaurant (returns id + progress) ──

export async function createRestaurant(data: BasicInfoForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/step1`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to create restaurant' }))
    throw new Error(err.message || err.error || 'Failed to create restaurant')
  }
  return res.json()
}

// ── Step 2: Update Location ──

export async function updateLocation(restaurantId: number, data: LocationForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/step2`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update location' }))
    throw new Error(err.message || err.error || 'Failed to update location')
  }
  return res.json()
}

// ── Step 3: Update Contact & Owner ──

export async function updateContactOwner(restaurantId: number, data: ContactOwnerForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/step3`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update contact' }))
    throw new Error(err.message || err.error || 'Failed to update contact')
  }
  return res.json()
}

// ── Step 4: Update Menu Setup ──

export async function updateMenuSetup(restaurantId: number, data: MenuSetupForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/step4`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update menu categories' }))
    throw new Error(err.message || err.error || 'Failed to update menu categories')
  }
  return res.json()
}

// ── Step 5: Update Operating Hours ──

export async function updateOperatingHours(restaurantId: number, data: OperatingHoursForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/step5`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update operating hours' }))
    throw new Error(err.message || err.error || 'Failed to update operating hours')
  }
  return res.json()
}

// ── Step 6: Update Documents ──

export async function updateDocuments(restaurantId: number, data: DocumentsForm): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/step6`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to update documents' }))
    throw new Error(err.message || err.error || 'Failed to update documents')
  }
  return res.json()
}

// ── Step 7: Activate ──

export async function activateRestaurant(restaurantId: number): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/activate`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Failed to activate restaurant' }))
    throw new Error(err.message || err.error || 'Failed to activate restaurant')
  }
  return res.json()
}

// ── Get Progress (for resuming) ──

export async function getOnboardingProgress(restaurantId: number): Promise<OnboardingProgress> {
  const res = await fetch(`${BASE}/onboarding/${restaurantId}/progress`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    throw new Error('Failed to get onboarding progress')
  }
  return res.json()
}