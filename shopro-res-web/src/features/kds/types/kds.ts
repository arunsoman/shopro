export type StationType =
  | "GRILL" | "FRYER" | "COLD_APPS" | "HOT_APPS" | "SAUTE"
  | "PASTRY" | "PIZZA" | "BAR" | "PREP" | "EXPO" | "RUNNER" | "CUSTOM"

export type StationItemStatus =
  | "NEW" | "IN_PROGRESS" | "DONE" | "VOIDED" | "RECALLED"

export type TicketStatus = "ACTIVE" | "COMPLETE" | "VOIDED" | "RECALLED"
export type TicketPriority = "NORMAL" | "RUSH"
export type TicketSource = "POS" | "DELIVERY" | "ONLINE" | "MANUAL" | "RECALL"
export type DeviceType = "FULL_SCREEN" | "TABLET" | "PHONE" | "BROWSER"
export type OverallStatus = "WAITING" | "COOKING" | "READY"

export interface StationTicketItem {
  stationItemId: number
  ticketItemId: number
  menuItemName: string
  pluNumber: number | null
  quantity: number
  modifications: string[]
  allergenFlags: string[]
  status: StationItemStatus
  secondsElapsed: number
  startedAt: string | null
  bumpedAt: string | null
}

export interface StationTicket {
  ticketId: number
  ticketNumber: string
  guestCount: number | null
  source: TicketSource
  priority: TicketPriority
  serverNote: string | null
  firedAt: string
  secondsElapsed: number
  courseNumber: number | null
  activeCourse: number | null
  pendingCourses: number[]
  items: StationTicketItem[]
}

export interface StationSettings {
  warnThresholdSeconds: number
  alertThresholdSeconds: number
  enableStartAction: boolean
  enableRecall: boolean
  recallWindowSeconds: number
  enableAudioAlerts: boolean
  enableCourseManagement: boolean
  highlightAllergens: boolean
  sortOrder: "FIRED_ASC" | "PRIORITY_FIRST" | "TABLE_NUMBER"
}

export interface StationQueuePage {
  stationId: number
  stationName: string
  stationType: StationType
  tickets: StationTicket[]
  totalInQueue: number
  deviceCapacity: number
  settings: StationSettings
}

export interface BumpResult {
  stationItemId: number
  ticketItemStatus: StationItemStatus
  ticketStatus: TicketStatus
  prepTimeSeconds: number
  ticketComplete: boolean
}

// Expo types
export interface ExpoStationItem {
  stationItemId: number
  ticketItemId: number
  menuItemName: string
  quantity: number
  status: StationItemStatus
  secondsElapsed: number
}

export interface ExpoStationStatus {
  stationId: number
  stationName: string
  stationType: StationType
  stationStatus: "NOT_STARTED" | "IN_PROGRESS" | "ALL_DONE"
  items: ExpoStationItem[]
}

export interface ExpoTicket {
  ticketId: number
  ticketNumber: string
  guestCount: number | null
  source: TicketSource
  priority: TicketPriority
  serverNote: string | null
  firedAt: string
  secondsElapsed: number
  overallStatus: OverallStatus
  stationBreakdown: ExpoStationStatus[]
}

export interface ExpoQueue {
  outletId: number
  outletName: string
  activeCount: number
  ticketsOverWarn: number
  ticketsOverAlert: number
  tickets: ExpoTicket[]
}

export interface CompletedTicket {
  ticketId: number
  ticketNumber: string
  firedAt: string
  completedAt: string
  prepTimeSeconds: number
  canRecall: boolean
}

export interface StationDeviceStatus {
  stationId: number
  stationName: string
  stationType: StationType
  hasOnlineDevice: boolean
  devices: {
    deviceId: number
    deviceName: string
    deviceType: DeviceType
    status: "ONLINE" | "OFFLINE"
    lastSeenAt: string
  }[]
}
