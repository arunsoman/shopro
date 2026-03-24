# Raw Entity Graph — Bidding Engine

BidInvitation {
  id               UUID      PK
  title            String    required
  description      String
  categoryId       UUID      FK → Category.id
  restaurantId     UUID      [AMBIGUITY — External UUID]
  deadline         DateTime  required
  status           Enum      OPEN|CLOSED|AWARDED
  urgency          Enum      NORMAL|HIGH|CRITICAL
  operationMode    Enum      [MISSING — AUTO|SEMI|MANUAL]
  repeatFrequency  String    [MISSING — e.g. "WEEKLY"]
  nextRunDate      DateTime  [MISSING]
  purchaseOrderId  UUID      FK → PurchaseOrder.id (optional)
  items            BidItem[] (1:N)
}

BidItem {
  id               UUID      PK
  bidInvitationId  UUID      FK → BidInvitation.id
  productName      String    required
  quantity         Decimal   required
  unit             String    required
  remainingQty     Decimal   [DESIGN ONLY — for Waterfall]
}

Quote {
  id               UUID      PK
  bidInvitationId  UUID      FK → BidInvitation.id
  supplierId       UUID      FK → Supplier.id
  totalAmount      Decimal
  status           Enum      PENDING|ACCEPTED|REJECTED
  leadTime         Int       [MISSING]
  items            QuoteItem[] (1:N) [MISSING]
}

QuoteItem {
  id               UUID      PK
  quoteId          UUID      FK → Quote.id
  bidItemId        UUID      FK → BidItem.id
  unitPrice        Decimal   required
  totalPrice       Decimal   required
  leadTime         Int       [MISSING]
  offeredQuantity  Decimal   [MISSING]
}

Supplier {
  id               UUID      PK
  name             String
  trustScore       Decimal   (4.8+ style, mocked)
}
