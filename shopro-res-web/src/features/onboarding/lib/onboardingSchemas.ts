import { z } from 'zod'

// ── Cuisine type enum (matches Java CuisineCategory but extended for onboarding) ──
export const CuisineType = z.enum([
  'NORTH_INDIAN', 'SOUTH_INDIAN', 'INDIAN', 'CHINESE', 'CONTINENTAL',
  'ITALIAN', 'MEXICAN', 'THAI', 'JAPANESE', 'KOREAN',
  'MEDITERRANEAN', 'MIDDLE_EASTERN', 'FAST_FOOD', 'CAFE', 'BAKERY',
  'DESSERT', 'BEVERAGE', 'PIZZA', 'BURGER', 'BIRYANI',
  'STREET_FOOD', 'HEALTHY_FOOD', 'SEAFOOD', 'BBQ', 'OTHER'
])

export type CuisineType = z.infer<typeof CuisineType>

export const RevenueCategory = z.enum([
  'FOOD', 'SOFT_BEV', 'LIQUOR', 'BEER', 'WINE', 'MERCH'
])

export type RevenueCategory = z.infer<typeof RevenueCategory>

export const DayOfWeek = z.enum([
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
])

export type DayOfWeek = z.infer<typeof DayOfWeek>

export const RestaurantStatus = z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED'])

// ── Step 1: Basic Information ──

export const basicInfoSchema = z.object({
  name: z.string().min(2, 'Restaurant name must be at least 2 characters').max(100, 'Name must be under 100 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  cuisineType: CuisineType,
  description: z.string().max(500, 'Description must be under 500 characters').optional().default(''),
  taxAndBenefitsRate: z.coerce.number().min(0, 'Rate must be 0 or higher').max(1, 'Rate must be under 100%').default(0.22),
  weekStartDay: DayOfWeek.default('MONDAY'),
})

export type BasicInfoForm = z.infer<typeof basicInfoSchema>

// ── Step 2: Location ──

export const locationSchema = z.object({
  address: z.string().min(5, 'Please enter a street address').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  deliveryRadiusKm: z.coerce.number().min(0).max(100).optional().nullable(),
})

export type LocationForm = z.infer<typeof locationSchema>

// ── Step 3: Contact & Owner ──

export const contactOwnerSchema = z.object({
  phoneNumber: z.string().regex(/^\+?\d{7,15}$/, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  adminUsername: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be under 50 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Username can only contain letters, numbers, dots, hyphens and underscores'),
  adminFullName: z.string().min(2, 'Full name is required').max(100),
  adminEmail: z.string().email('Enter a valid email address'),
})

export type ContactOwnerForm = z.infer<typeof contactOwnerSchema>

// ── Step 4: Menu Setup ──

export const costGroupSchema = z.object({
  name: z.string().min(2, 'Category name is required').max(50),
  revenueCategory: RevenueCategory,
})

export type CostGroupForm = z.infer<typeof costGroupSchema>

export const menuSetupSchema = z.object({
  costGroups: z.array(costGroupSchema).min(1, 'At least one menu category is required'),
})

export type MenuSetupForm = z.infer<typeof menuSetupSchema>

// ── Step 5: Operating Hours ──

export const operatingHoursEntrySchema = z.object({
  dayOfWeek: DayOfWeek,
  openTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').default('09:00'),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').default('22:00'),
  isClosed: z.boolean().default(false),
})

export type OperatingHoursEntry = z.infer<typeof operatingHoursEntrySchema>

export const operatingHoursSchema = z.object({
  hours: z.array(operatingHoursEntrySchema).length(7, 'All 7 days are required'),
})

export type OperatingHoursForm = z.infer<typeof operatingHoursSchema>

// ── Step 6: Documents & Compliance ──

export const documentsSchema = z.object({
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid 15-character GST number'),
  fssaiNumber: z.string().regex(/^\d{14}$/, 'Enter a valid 14-digit FSSAI number'),
  fssaiExpiryDate: z.coerce.date().refine(
    (d) => d > new Date(),
    'FSSAI expiry date must be in the future'
  ),
})

export type DocumentsForm = z.infer<typeof documentsSchema>

// ── Step 7: Review & Activate (no validation — read-only summary) ──

export const activateSchema = z.object({})

export type ActivateForm = z.infer<typeof activateSchema>

// ── Progress response type ──

export interface OnboardingProgress {
  restaurantId: number
  currentStep: number
  completedSteps: number
  status: 'DRAFT' | 'ACTIVE' | 'SUSPENDED'
}

// ── Cuisine presets for Step 4 ──

export const CUISINE_PRESETS: Record<string, { name: string; revenueCategory: RevenueCategory }[]> = {
  INDIAN: [
    { name: 'Mains', revenueCategory: 'FOOD' },
    { name: 'Starters', revenueCategory: 'FOOD' },
    { name: 'Breads', revenueCategory: 'FOOD' },
    { name: 'Beverages', revenueCategory: 'SOFT_BEV' },
    { name: 'Desserts', revenueCategory: 'FOOD' },
  ],
  CHINESE: [
    { name: 'Mains', revenueCategory: 'FOOD' },
    { name: 'Appetizers', revenueCategory: 'FOOD' },
    { name: 'Soups', revenueCategory: 'FOOD' },
    { name: 'Noodles & Rice', revenueCategory: 'FOOD' },
    { name: 'Beverages', revenueCategory: 'SOFT_BEV' },
  ],
  ITALIAN: [
    { name: 'Antipasti', revenueCategory: 'FOOD' },
    { name: 'Primi', revenueCategory: 'FOOD' },
    { name: 'Secondi', revenueCategory: 'FOOD' },
    { name: 'Pizza', revenueCategory: 'FOOD' },
    { name: 'Desserts', revenueCategory: 'FOOD' },
    { name: 'Beverages', revenueCategory: 'SOFT_BEV' },
  ],
  GENERIC: [
    { name: 'Mains', revenueCategory: 'FOOD' },
    { name: 'Starters', revenueCategory: 'FOOD' },
    { name: 'Desserts', revenueCategory: 'FOOD' },
    { name: 'Beverages', revenueCategory: 'SOFT_BEV' },
  ],
}

// ── Default hours for Step 5 ──

export const DEFAULT_HOURS: OperatingHoursEntry[] = [
  { dayOfWeek: 'MONDAY',    openTime: '11:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'TUESDAY',   openTime: '11:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'WEDNESDAY', openTime: '11:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'THURSDAY',  openTime: '11:00', closeTime: '22:00', isClosed: false },
  { dayOfWeek: 'FRIDAY',    openTime: '11:00', closeTime: '23:00', isClosed: false },
  { dayOfWeek: 'SATURDAY',  openTime: '10:00', closeTime: '23:00', isClosed: false },
  { dayOfWeek: 'SUNDAY',    openTime: '10:00', closeTime: '22:00', isClosed: true },
]