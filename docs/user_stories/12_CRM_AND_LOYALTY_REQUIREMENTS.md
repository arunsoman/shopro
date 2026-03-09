# Growth & CRM (Loyalty) Requirements

## 1. Overview
This document captures unambiguous User Stories for the Customer Relationship Management (CRM) and Loyalty module. This module enables the restaurant to build a comprehensive customer database, track historical dining preferences and allergies, incentivize repeat business through tiered loyalty programs, automate marketing campaigns, capture guest feedback, manage reservations with CRM context, and deliver analytics-driven insights that maximize lifetime customer value.

## 2. User Roles
*   **Server/Cashier:** Looks up customers, views profile notes and allergies, applies loyalty points, and redeems rewards at checkout.
*   **Host:** Uses CRM profiles during reservation and waitlist management to personalize seating and greet VIPs by name.
*   **Customer/Guest:** Earns points on purchases, receives promotional offers via SMS or Email, provides feedback, and manages their own profile via a guest-facing portal.
*   **Manager:** Configures loyalty rules, manages guest segments, launches marketing campaigns, and monitors CRM performance dashboards.
*   **Owner/General Manager:** Views strategic CRM analytics (lifetime value trends, churn risk, campaign ROI), configures multi-location CRM settings, and approves high-value promotions.
*   **System (Automation Engine):** Triggers automated messages, calculates loyalty tiers, detects churn risk, and processes feedback workflows.

## 3. User Stories

### Epic 1: Customer Profile Management
**Goal:** Build a robust database of diner preferences, contact information, and behavioral data that follows the guest across every touchpoint.

*   **US-1.1: Creating a Customer Profile**
    *   **As a** Cashier, **I want to** create a new customer profile by entering a phone number, name, and email address at the POS, **so that** the customer can begin earning loyalty points immediately.
    *   *Acceptance Criteria:* The system must prompt the Cashier to search by phone number first. If no result is found, a "Create Profile" modal appears. Phone Number is the only strictly required field (for SMS routing). Duplicate phone numbers must be blocked with the error: "A profile with this phone number already exists."
    *   **Entities:** `CustomerProfile`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Flutter (POS)

*   **US-1.2: Order History & Preferences Tracking**
    *   **As a** Server, **I want to** view a customer's profile when they are attached to a ticket, **so that** I can see their past orders, total lifetime spend, and custom notes (e.g., "Allergic to shellfish", "Prefers window seating").
    *   *Acceptance Criteria:* Attaching a customer to a ticket displays a "Profile Summary" icon. Tapping it reveals their last 5 orders, lifetime loyalty tier (if applicable), and any pinned allergy/preference notes. Allergy notes must be displayed in a red-highlighted banner at the top of the profile summary for safety.
    *   **Entities:** `CustomerProfile`, `OrderTicket`, `LoyaltyTier`
    *   **Tech Stack:** Flutter

*   **US-1.3: Recording Dietary Restrictions & Allergies**
    *   **As a** Server, **I want to** add or update a customer's dietary restrictions and allergy information directly from the POS profile view, **so that** the kitchen is always informed of critical dietary needs without the guest having to repeat themselves.
    *   *Acceptance Criteria:*
        *   The profile must include a dedicated "Allergies & Dietary" section with predefined tags: Gluten-Free, Nut Allergy, Dairy-Free, Shellfish, Vegan, Vegetarian, Halal, Kosher, and a free-text "Other" field (max 200 chars).
        *   When a customer with allergy tags is attached to a ticket, a non-dismissible allergy badge must appear on the KDS ticket header for all stations receiving that order.
        *   Changes to allergy data must be audit-logged with the Server's identity and timestamp.
    *   **Entities:** `CustomerProfile`, `CustomerDietaryTag`, `AuditLog`
    *   **Tech Stack:** Flutter

*   **US-1.4: Recording Special Occasions**
    *   **As a** Server, **I want to** record a customer's birthday, anniversary, and other milestone dates in their profile, **so that** the restaurant can send automated celebratory offers and provide personalized service when they dine near those dates.
    *   *Acceptance Criteria:*
        *   The profile must support at minimum: Birthday (month/day required, year optional) and Anniversary (full date).
        *   A Manager-configurable "Occasion Window" (default: 7 days before and on the day) determines when the system flags an upcoming occasion.
        *   When a customer with an upcoming occasion is attached to a ticket, a celebratory icon and message (e.g., "🎂 Birthday in 3 days!") must appear in the profile summary.
    *   **Entities:** `CustomerProfile`, `CustomerOccasion`, `AuditLog`
    *   **Tech Stack:** Flutter (POS) / React + shadcn + Tailwind (Admin)

*   **US-1.5: Customer Segmentation**
    *   **As a** Manager, **I want to** create and manage customer segments based on rules like visit frequency, lifetime spend, last visit date, favorite menu items, and loyalty tier, **so that** I can target specific groups with relevant promotions.
    *   *Acceptance Criteria:*
        *   Segmentation rules must support the following filter fields: Last Visit Date (before/after), Visit Count (greater/less than), Lifetime Spend (greater/less than), Loyalty Tier (equals), Favorite Category (contains), and Tag (has/has not).
        *   Segments must be dynamically evaluated — customers move in and out of segments automatically as their data changes.
        *   The system must provide pre-built "Smart Segments": "VIPs" (top 10% by lifetime spend), "At Risk" (no visit in 30+ days), "New Customers" (first visit in last 14 days), and "Regulars" (3+ visits in last 30 days).
        *   Each segment must display a real-time member count on the segment list screen.
    *   **Entities:** `CustomerSegment`, `SegmentRule`, `CustomerProfile`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-1.6: Customer Profile Search & Lookup**
    *   **As a** Server, **I want to** search for a customer by phone number, name, or email from the POS order screen, **so that** I can quickly attach their profile to an open ticket.
    *   *Acceptance Criteria:*
        *   Search must return results within 500ms as the Server types (typeahead/autocomplete).
        *   Results must display: Name, Phone (last 4 digits masked), Loyalty Tier badge, and Allergy icon (if any allergies are on file).
        *   Selecting a result must attach the customer to the active ticket and display the "Profile Summary" icon.
        *   If no results are found, the search must offer a "Create New Profile" shortcut button.
    *   **Entities:** `CustomerProfile`, `OrderTicket`
    *   **Tech Stack:** Flutter

*   **US-1.7: Merging Duplicate Customer Profiles**
    *   **As a** Manager, **I want to** merge two duplicate customer profiles into a single profile, **so that** loyalty points, order history, and preferences are consolidated and the customer's data is accurate.
    *   *Acceptance Criteria:*
        *   The merge wizard must display both profiles side by side for comparison before merging.
        *   The Manager must choose which contact details (phone, email, name) to keep as the primary.
        *   All order history, loyalty points, and feedback from both profiles must be combined into the surviving profile.
        *   The discarded profile must be soft-deleted (retained for audit purposes) and must never appear in search results.
        *   A merge event must be logged in the audit trail with both original profile IDs.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `OrderTicket`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 2: Loyalty Rewards Program
**Goal:** Incentivize repeat visits by automating point accumulation, tier progression, and flexible reward redemption.

*   **US-2.1: Earning Points on Purchases**
    *   **As a** Customer, **I want to** automatically earn loyalty points based on the subtotal of my bill when my profile is linked to the order, **so that** I am rewarded for my spending.
    *   *Acceptance Criteria:* Points are calculated on the Net Subtotal (pre-tax, post-discount). The conversion rate (e.g., 1 point per $1 spent) must be configurable by a Manager. Points must be credited to the profile within 1 minute of full payment realization. The printed/digital receipt must display earned points and the new balance.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `Payment`
    *   **Tech Stack:** Flutter (POS) / Backend Service

*   **US-2.2: Redeeming Points at Checkout**
    *   **As a** Cashier, **I want to** apply a customer's available loyalty points as a discount to their current bill, **so that** they can use their earned rewards.
    *   *Acceptance Criteria:* The checkout screen must display the customer's available point balance and its equivalent fiat value (e.g., "500 points = $5.00 off"). Applying the points must generate a distinct "Loyalty Redemption" negative line item on the digital and printed receipt. Partial redemption must be supported (customer can choose to use fewer than their total available points). The minimum redemption threshold must be configurable (e.g., minimum 100 points).
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `OrderTicket`, `Payment`
    *   **Tech Stack:** Flutter

*   **US-2.3: Configuring Loyalty Program Rules**
    *   **As a** Manager, **I want to** configure the loyalty program's earning rate, redemption value, minimum redemption threshold, and point expiration policy from the admin dashboard, **so that** I can tune the program's economics without developer intervention.
    *   *Acceptance Criteria:*
        *   Configurable fields: Earning Rate (points per $1), Redemption Value ($ per point), Minimum Redemption Points, Point Expiration (days, 0 = never expire), and Bonus Multiplier Events (e.g., "2x points on Tuesdays").
        *   Changes must take effect for all new transactions immediately but must NOT retroactively alter existing point balances.
        *   A preview calculator must show: "At current settings, a $50 check earns [X] points worth [$Y]."
    *   **Entities:** `LoyaltyConfig`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-2.4: Tiered Loyalty Program**
    *   **As a** Manager, **I want to** define loyalty tiers (e.g., Bronze, Silver, Gold, Platinum) with different earning multipliers and exclusive perks, **so that** high-value customers feel recognized and are incentivized to spend more.
    *   *Acceptance Criteria:*
        *   Each tier must be defined by a spend threshold — e.g., Bronze: $0+, Silver: $500+, Gold: $1,500+, Platinum: $5,000+.
        *   Each tier must have a configurable earning multiplier (e.g., Bronze: 1x, Silver: 1.25x, Gold: 1.5x, Platinum: 2x).
        *   Tier upgrades must be automatic and immediate when the lifetime spend threshold is crossed.
        *   Tier downgrades must occur only at a configurable evaluation period (e.g., annually) if the customer's trailing-12-month spend falls below the threshold.
        *   The customer's tier badge must be visible on their POS profile, Host reservation screen, and printed receipts.
    *   **Entities:** `LoyaltyTier`, `LoyaltyTierConfig`, `CustomerProfile`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Flutter (POS)

*   **US-2.5: Loyalty Points Balance Inquiry**
    *   **As a** Cashier, **I want to** quickly check a customer's loyalty point balance and tier status by looking up their phone number, **so that** I can inform them of their rewards without needing to start an order.
    *   *Acceptance Criteria:*
        *   A dedicated "Loyalty Lookup" quick-action button must be accessible from the POS home screen.
        *   The lookup result must display: Name, Tier, Available Points, Points Equivalent ($), Points Expiring Soon (next 30 days), and Lifetime Spend.
        *   The result must NOT allow point redemption — redemption is only possible during an active checkout (US-2.2).
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `LoyaltyTier`
    *   **Tech Stack:** Flutter

*   **US-2.6: Bonus Point Events**
    *   **As a** Manager, **I want to** create time-limited bonus point events (e.g., "Double Points Every Tuesday" or "3x Points on Appetizers This Weekend"), **so that** I can drive traffic during slow periods while rewarding loyal customers.
    *   *Acceptance Criteria:*
        *   Events must support: Start Date/Time, End Date/Time, Multiplier (2x–5x), and Scope (All Items, Specific Categories, or Specific Items).
        *   Active bonus events must be displayed as a banner on the POS login screen so Servers can inform guests.
        *   Bonus points earned during an event must be tagged as "Bonus" in the loyalty transaction log for ROI tracking.
        *   Overlapping events must stack multipliers (e.g., 2x Tuesday + 2x Appetizer = 4x on appetizers on Tuesday).
    *   **Entities:** `BonusPointEvent`, `LoyaltyTransaction`, `MenuItem`, `MenuCategory`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Flutter (POS)

### Epic 3: Promotional Campaigns & Marketing Automation
**Goal:** Empower owners to drive traffic and re-engage lapsed customers using automated, targeted direct communication.

*   **US-3.1: Targeted SMS/Email Offers**
    *   **As a** Manager, **I want to** send a promotional SMS or Email to a filtered segment of customers (e.g., "Customers who haven't visited in 30 days"), **so that** I can drive traffic on slow nights.
    *   *Acceptance Criteria:* The CRM dashboard must provide filters for "Last Visit Date", "Lifetime Spend", "Loyalty Tier", and "Favorite Category". Generating the campaign sends the message via an integrated SMS/Email gateway. The system must track delivery rates and redemption rates if a unique promo code is included. Messages must include an opt-out link/instruction as required by anti-spam regulations (e.g., "Reply STOP to unsubscribe").
    *   **Entities:** `CustomerProfile`, `MarketingCampaign`, `CampaignMessageLog`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-3.2: Automated Birthday & Anniversary Offers**
    *   **As a** Manager, **I want to** configure an automatic SMS/Email that is sent to customers on or before their birthday and anniversary, containing a personalized offer, **so that** repeat visits are driven by celebratory gestures without manual effort.
    *   *Acceptance Criteria:*
        *   The Manager must be able to configure: Template Message (with merge fields: `{FirstName}`, `{Occasion}`, `{PromoCode}`), Offer Type (% Discount, $ Off, or Free Item), Delivery Timing (on the day, 3 days before, 7 days before), and Channel (SMS, Email, or Both).
        *   Each automated offer must generate a unique, single-use promo code.
        *   The promo code must be redeemable at the POS within a configurable validity window (default: 14 days).
        *   The system must NOT send duplicate messages for the same occasion in the same year.
    *   **Entities:** `CustomerProfile`, `CustomerOccasion`, `AutomatedCampaign`, `PromoCode`, `CampaignMessageLog`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Backend Service

*   **US-3.3: Win-Back Campaigns for Lapsed Customers**
    *   **As a** Manager, **I want to** configure an automated "We Miss You" campaign that triggers when a customer hasn't visited in a configurable number of days (default: 60), **so that** at-risk customers are re-engaged before they churn.
    *   *Acceptance Criteria:*
        *   The Manager must configure: Inactivity Threshold (days since last visit), Message Template, Offer (optional discount or bonus points), and Channel (SMS/Email).
        *   The system must send only one win-back message per customer per inactivity cycle. If the customer visits after receiving the message, the cycle resets.
        *   If the customer does not respond or visit within 30 days of the win-back message, the system must flag them as "Churned" in the CRM dashboard (no further automated messages until manual review).
    *   **Entities:** `CustomerProfile`, `AutomatedCampaign`, `CampaignMessageLog`, `CustomerSegment`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Backend Service

*   **US-3.4: Promo Code Management**
    *   **As a** Manager, **I want to** create, manage, and track promotional codes that can be redeemed at the POS for a discount, **so that** I can measure the effectiveness of marketing campaigns.
    *   *Acceptance Criteria:*
        *   Each promo code must have: Code (alphanumeric, max 20 chars), Discount Type (% Off or $ Off), Discount Value, Validity Period (start and end dates), Usage Limit (single-use, multi-use with max count, or unlimited), and an optional Segment Restriction (e.g., only redeemable by Gold-tier members).
        *   A Cashier must be able to apply a promo code during checkout by scanning or manually entering the code.
        *   Expired, fully redeemed, or segment-restricted codes must display a clear rejection message: "Promo code [CODE] is [expired / already used / not valid for this customer]."
        *   The CRM dashboard must display a promo code performance table with columns: Code, Campaign, Times Used, Total Discount Given, and Estimated Revenue Attributed.
    *   **Entities:** `PromoCode`, `MarketingCampaign`, `OrderTicket`, `Payment`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Flutter (POS)

*   **US-3.5: Customer Opt-In & Communication Preferences**
    *   **As a** Customer, **I want to** choose whether I receive marketing communications via SMS, Email, both, or neither, **so that** I am in control of what messages I receive from the restaurant.
    *   *Acceptance Criteria:*
        *   The customer profile must store per-channel consent: SMS Opt-In (boolean), Email Opt-In (boolean).
        *   Default for new profiles must be Opted-In for both channels (with disclosure at profile creation).
        *   Replying "STOP" to any SMS must immediately set SMS Opt-In to false and send a confirmation: "You have been unsubscribed. Reply START to re-subscribe."
        *   The marketing campaign send engine must strictly respect opt-in flags — sending to an opted-out customer must be blocked at the system level.
    *   **Entities:** `CustomerProfile`, `CampaignMessageLog`
    *   **Tech Stack:** Backend Service / Flutter (POS consent capture)

### Epic 4: Guest Sentiment & Feedback
**Goal:** Capture and analyze guest satisfaction in real time to improve service and manage the restaurant's reputation.

*   **US-4.1: Post-Meal Feedback Collection**
    *   **As an** Owner, **I want to** send an automated SMS/Email after a guest pays their bill asking for a 1–5 star rating and comment, **so that** I can track service quality and catch problems early.
    *   *Acceptance Criteria:* SMS/Email sent within a configurable window after `PAID` state (default: 30 minutes). Feedback link leads to a branded survey with: Overall Rating (1–5 stars), optional Comment (max 500 chars), and optional selection of what they liked/disliked (Food, Service, Ambiance, Wait Time). Results must appear in the Manager CRM dashboard within 1 minute of submission.
    *   **Entities:** `GuestFeedback`, `CustomerProfile`, `OrderTicket`
    *   **Tech Stack:** React (Survey Page) / Backend Service

*   **US-4.2: Real-Time Feedback Alerts**
    *   **As a** Manager, **I want to** receive an immediate push notification on my Manager device when a guest submits a rating of 1 or 2 stars, **so that** I can reach out to the guest before they leave or post a negative public review.
    *   *Acceptance Criteria:*
        *   Notifications must be sent within 30 seconds of feedback submission for ratings ≤ 2 stars.
        *   The notification must include: Guest Name (if known), Rating, Comment (if any), and the Table Number / Order ID.
        *   The notification must include a "Respond" quick-action that opens a pre-drafted apology message (customizable template) for SMS/Email reply.
    *   **Entities:** `GuestFeedback`, `CustomerProfile`, `Notification`
    *   **Tech Stack:** Flutter (Manager App) / Backend Service

*   **US-4.3: Feedback Analytics Dashboard**
    *   **As an** Owner, **I want to** view aggregated feedback trends over time (average rating by week, sentiment breakdown by category), **so that** I can identify systemic service issues and track improvement after interventions.
    *   *Acceptance Criteria:*
        *   Dashboard must display: Average Rating (weekly/monthly trend line), Rating Distribution (bar chart: count of 1★ through 5★), Sentiment Breakdown by Category (Food, Service, Ambiance, Wait Time), and Net Promoter Score (NPS) calculated from ratings.
        *   Date range filter must be available (same pattern as Analytics module US-1.1).
        *   The dashboard must highlight statistically significant drops (>15% decline week-over-week) in red with a "⚠ Declining" badge.
    *   **Entities:** `GuestFeedback`, `FeedbackAnalytics`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-4.4: Linking Feedback to Staff Performance**
    *   **As a** Manager, **I want to** see feedback scores aggregated by Server (the Server who served the table), **so that** I can identify top performers and staff who may need additional coaching.
    *   *Acceptance Criteria:*
        *   The feedback dashboard must include a "By Server" tab showing: Server Name, Number of Ratings, Average Rating, and Trend (improving/declining over last 4 weeks).
        *   Individual low-score feedbacks must be drillable to show the specific comment and order details.
        *   Server-level feedback data must be accessible only to Managers and Owners (not visible to Servers themselves from the POS).
    *   **Entities:** `GuestFeedback`, `StaffMember`, `OrderTicket`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 5: Reservation & Waitlist CRM Integration
**Goal:** Enrich the reservation and waitlist experience with CRM data so that hosts can personalize the guest experience from the moment of booking.

*   **US-5.1: CRM-Enriched Reservation View**
    *   **As a** Host, **I want to** see a guest's CRM profile (loyalty tier, allergy tags, visit count, VIP status, and special occasion flags) directly on the reservation detail when they book or check in, **so that** I can greet them by name, seat them at their preferred table, and alert the kitchen to allergies.
    *   *Acceptance Criteria:*
        *   If the reservation phone number matches an existing `CustomerProfile`, the CRM data must auto-populate on the reservation card.
        *   VIP customers (Gold tier and above, or manually tagged) must display a gold star badge on the reservation list.
        *   Allergy tags must be displayed on the reservation card and auto-forwarded to the Server's POS ticket when the table is opened.
        *   If no profile match is found, the Host must be offered a "Create Profile" shortcut.
    *   **Entities:** `Reservation`, `CustomerProfile`, `LoyaltyTier`, `CustomerDietaryTag`
    *   **Tech Stack:** Flutter (Host App)

*   **US-5.2: Guest Visit History on Waitlist**
    *   **As a** Host, **I want to** see how many times a walk-in guest has visited before (and their loyalty tier) when I look up their phone number for the waitlist, **so that** I can prioritize seating for loyal guests and provide personalized wait-time communication.
    *   *Acceptance Criteria:*
        *   When a phone number is entered for a waitlist entry, the system must search `CustomerProfile` and display: Visit Count, Loyalty Tier, and "Last Visit" date.
        *   If the guest is a VIP, the waitlist entry must be visually flagged (gold highlight) so the Host can prioritize seating.
        *   The Host must NOT have the ability to adjust the waitlist order — flagging is informational only; actual seating decisions are manual.
    *   **Entities:** `WaitlistEntry`, `CustomerProfile`, `LoyaltyTier`
    *   **Tech Stack:** Flutter (Host App)

*   **US-5.3: Automated Reservation Reminders**
    *   **As an** Owner, **I want the** system to automatically send an SMS reminder to guests 24 hours and 2 hours before their reservation time, **so that** no-shows are reduced and guests feel cared for.
    *   *Acceptance Criteria:*
        *   Reminders must include: Restaurant Name, Reserved Date/Time, Party Size, and a "Confirm / Cancel" reply option (e.g., "Reply C to confirm, X to cancel").
        *   Guest replies of "C" must update the reservation status to "Confirmed." Replies of "X" must update the status to "Cancelled" and free the table.
        *   The 24-hour reminder must be sent only if the reservation was made more than 24 hours in advance.
        *   SMS opt-out flags from the customer profile (US-3.5) must be respected — no reminder is sent to opted-out guests.
    *   **Entities:** `Reservation`, `CustomerProfile`, `CampaignMessageLog`
    *   **Tech Stack:** Backend Service

### Epic 6: CRM Analytics & Reporting
**Goal:** Provide Managers and Owners with data-driven insights into customer behavior, campaign effectiveness, and loyalty program ROI.

*   **US-6.1: Customer Lifetime Value (CLV) Dashboard**
    *   **As an** Owner, **I want to** view a dashboard showing the average Customer Lifetime Value, segmented by loyalty tier and acquisition channel, **so that** I can understand how much each customer segment is worth and allocate marketing spend accordingly.
    *   *Acceptance Criteria:*
        *   CLV must be calculated as: Total Revenue Attributed to Customer ÷ Number of Visits × Average Retention Rate.
        *   The dashboard must display: Overall Average CLV, CLV by Tier (Bronze/Silver/Gold/Platinum), Top 20 Customers by CLV (ranked table), and CLV trend over time (monthly line chart).
        *   Date range filter must be available.
    *   **Entities:** `CustomerProfile`, `LoyaltyTier`, `OrderTicket`, `Payment`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-6.2: Campaign Performance Dashboard**
    *   **As a** Manager, **I want to** see a per-campaign performance report showing delivery rate, open rate, redemption rate, and attributed revenue, **so that** I can determine which campaigns are effective and optimize future spend.
    *   *Acceptance Criteria:*
        *   Each campaign row must display: Campaign Name, Date Sent, Channel (SMS/Email), Recipients, Delivered %, Promo Code Used Count, Total Discount Given, Attributed Revenue (orders placed using the promo code within the campaign window), and ROI (Revenue ÷ Campaign Cost).
        *   Campaigns must be sortable and filterable by date range, channel, and campaign type (Manual / Automated).
        *   Clicking a campaign must drill down to a recipient-level view showing: Customer Name, Delivery Status, Redeemed (Yes/No), and Order Total (if redeemed).
    *   **Entities:** `MarketingCampaign`, `CampaignMessageLog`, `PromoCode`, `OrderTicket`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-6.3: Loyalty Program Health Dashboard**
    *   **As an** Owner, **I want to** view a dashboard showing the overall health metrics of the loyalty program — active members, points issued vs. redeemed, tier distribution, and churn rate, **so that** I can assess whether the program is driving the desired business outcomes.
    *   *Acceptance Criteria:*
        *   Dashboard metrics: Total Active Members (visited in last 90 days), New Enrollments (this month), Points Issued (this period), Points Redeemed (this period), Redemption Rate (%), Outstanding Liability (unredeemed points × redemption value), Tier Distribution (pie chart), and Churn Rate (% of members with no visit in 90+ days).
        *   Month-over-month comparison must be displayed for all metrics.
        *   An "Export" button must allow CSV download of the full loyalty member list with all metrics.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `LoyaltyTier`, `LoyaltyConfig`
    *   **Tech Stack:** React + shadcn + Tailwind

*   **US-6.4: Customer Churn Prediction**
    *   **As an** Owner, **I want the** system to identify customers who are at risk of churning based on declining visit frequency and spend, **so that** I can proactively intervene with a targeted offer before they are lost.
    *   *Acceptance Criteria:*
        *   The system must calculate a Churn Risk Score (Low / Medium / High) for each customer based on: Days Since Last Visit, Visit Frequency Trend (declining), and Spend Trend (declining).
        *   Customers with "High" churn risk must appear in a dedicated "At Risk" list in the CRM dashboard with a red indicator.
        *   The "At Risk" list must offer a one-click "Send Win-Back Offer" action that uses the win-back campaign template (US-3.3).
        *   The churn model must re-evaluate all customers on a nightly batch schedule.
    *   **Entities:** `CustomerProfile`, `ChurnRiskScore`, `AutomatedCampaign`
    *   **Tech Stack:** React + shadcn + Tailwind / Backend AI Engine

### Epic 7: POS Integration & Cross-Module Data Flow
**Goal:** Ensure seamless bi-directional data flow between the CRM module and the existing POS, Order Management, and Floor Plan modules.

*   **US-7.1: Automatic Profile Linking on Payment**
    *   **As a** System, **I want to** automatically link a customer profile to an order when payment is made with a previously registered credit card, **so that** loyalty points are earned even if the Server forgets to manually attach the profile.
    *   *Acceptance Criteria:*
        *   The system must store a tokenized hash of registered card numbers (PCI-compliant; no raw card data).
        *   When a payment is processed and the card hash matches a known `CustomerProfile`, the profile must be auto-attached to the order and points credited.
        *   If the card matches multiple profiles (e.g., from a merged profile scenario), the system must attach to the primary profile and log the ambiguity for Manager review.
        *   The Server must see a toast notification: "Loyalty profile auto-matched: [Customer Name]. [X] points earned."
    *   **Entities:** `CustomerProfile`, `PaymentToken`, `LoyaltyTransaction`, `OrderTicket`
    *   **Tech Stack:** Backend Service / Flutter (POS)

*   **US-7.2: CRM Data on Printed & Digital Receipts**
    *   **As a** Customer, **I want to** see my loyalty points earned, new balance, current tier, and any upcoming rewards on my printed or digital receipt, **so that** I am kept informed and motivated to return.
    *   *Acceptance Criteria:*
        *   Receipts must include a "Loyalty Summary" section after the payment total: Points Earned This Visit, Total Points Balance, Current Tier, and a Progress indicator (e.g., "150 more points to Gold!").
        *   If no customer profile is attached to the order, the Loyalty Summary section must NOT appear on the receipt.
        *   Digital receipts (Email) must include a link to the guest-facing loyalty portal (if enabled in US-7.3).
    *   **Entities:** `OrderTicket`, `CustomerProfile`, `LoyaltyTransaction`, `LoyaltyTier`
    *   **Tech Stack:** Flutter (POS) / Backend Service (Email)

*   **US-7.3: Guest-Facing Loyalty Portal**
    *   **As a** Customer, **I want to** access a simple web page (linked from my receipt or SMS) where I can view my point balance, tier status, transaction history, and update my contact preferences, **so that** I feel in control of my loyalty relationship without needing to ask staff.
    *   *Acceptance Criteria:*
        *   The portal must be accessible via a unique, tokenized URL sent in receipts and marketing messages (no login required for basic view; phone verification required for edits).
        *   The portal must display: Name, Tier, Point Balance, Points History (last 20 transactions), and Communication Preferences (opt-in/out toggles for SMS and Email).
        *   Updates to communication preferences must be reflected in the CRM within 1 minute.
        *   The portal must be mobile-responsive and branded with the restaurant's name and logo.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `LoyaltyTier`
    *   **Tech Stack:** React (Guest Portal) / Backend Service

## 4. Ambiguity Review Summary
*   **Profile Creation (US-1.1):** Phone Number is the only required field because it serves as the primary identifier and SMS routing key. Name and Email are strongly encouraged but optional to reduce friction.
*   **Allergy Safety (US-1.3):** Allergies are treated as a safety-critical data field. They propagate to the KDS ticket header to ensure BOH visibility — separate from "preferences" which are informational only.
*   **Tier Upgrade vs. Downgrade (US-2.4):** Upgrades are instant to reward the customer immediately. Downgrades are deferred to an annual evaluation to avoid frustrating a loyal guest who had a temporarily slow period.
*   **Opt-In Defaults (US-3.5):** New profiles default to opted-in (industry standard) but the system strictly enforces opt-out requests to comply with anti-spam regulations (TCPA, CAN-SPAM).
*   **Auto-Matching Cards (US-7.1):** Card-based profile matching uses PCI-compliant tokenized hashes only. No raw card data is stored in the CRM database.
*   **Win-Back Throttling (US-3.3):** Only one win-back message per inactivity cycle prevents spamming. If the guest doesn't respond, they are flagged as "Churned" and removed from automated messaging to protect the restaurant's sender reputation.
