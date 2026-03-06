# Growth & CRM (Loyalty) Requirements

## 1. Overview
This document captures unambiguous User Stories for the Customer Relationship Management (CRM) and Loyalty module. This module enables the restaurant to build a customer database, track historical preferences, and incentivize repeat business through points-based loyalty and targeted promotions.

## 2. User Roles
*   **Server/Cashier:** Looks up customers, applies loyalty points, and redeems rewards at checkout.
*   **Customer/Guest:** Earns points on purchases and receives promotional offers via SMS or Email.
*   **Manager/Owner:** Configures loyalty rules, views customer aggregates, and launches marketing campaigns.

## 3. User Stories

### Epic 1: Customer Profile Management
**Goal:** Build a robust database of diner preferences and contact information.

*   **US-1.1: Creating a Customer Profile**
    *   **As a** Cashier, **I want to** create a new customer profile by entering a phone number, name, and email address at the POS, **so that** the customer can begin earning loyalty points immediately.
    *   *Acceptance Criteria:* The system must prompt the Cashier to search by phone number first. If no result is found, a "Create Profile" modal appears. Phone Number is the only strictly required field (for SMS routing).
    *   **Entities:** `CustomerProfile`, `AuditLog`
    *   **Tech Stack:** React + shadcn + Tailwind (Admin) / Flutter (POS)

*   **US-1.2: Order History & Preferences Tracking**
    *   **As a** Server, **I want to** view a customer's profile when they are attached to a ticket, **so that** I can see their past orders, total lifetime spend, and custom notes (e.g., "Allergic to shellfish", "Prefers window seating").
    *   *Acceptance Criteria:* Attaching a customer to a ticket displays a "Profile Summary" icon. Tapping it reveals their last 5 orders, lifetime loyalty tier (if applicable), and any pinned allergy/preference notes.
    *   **Entities:** `CustomerProfile`, `OrderTicket`, `LoyaltyTier`
    *   **Tech Stack:** Flutter

### Epic 2: Loyalty Rewards Program
**Goal:** Incentivize repeat visits by automating point accumulation and redemption.

*   **US-2.1: Earning Points on Purchases**
    *   **As a** Customer, **I want to** automatically earn loyalty points based on the subtotal of my bill when my profile is linked to the order, **so that** I am rewarded for my spending.
    *   *Acceptance Criteria:* Points are calculated on the Net Subtotal (pre-tax, post-discount). The conversion rate (e.g., 1 point per $1 spent) must be configurable by a Manager. Points must be credited to the profile within 1 minute of full payment realization.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `Payment`
    *   **Tech Stack:** Flutter (POS) / Backend Service

*   **US-2.2: Redeeming Points at Checkout**
    *   **As a** Cashier, **I want to** apply a customer's available loyalty points as a discount to their current bill, **so that** they can use their earned rewards.
    *   *Acceptance Criteria:* The checkout screen must display the customer's available point balance and its equivalent fiat value (e.g., "500 points = $5.00 off"). Applying the points must generate a distinct "Loyalty Redemption" negative line item on the digital and printed receipt.
    *   **Entities:** `CustomerProfile`, `LoyaltyTransaction`, `OrderTicket`, `Payment`
    *   **Tech Stack:** Flutter

### Epic 3: Promotional Campaigns
**Goal:** Empower owners to drive traffic during slow periods using direct communication.

*   **US-3.1: Targeted SMS/Email Offers**
    *   **As a** Manager, **I want to** send a promotional SMS to a filtered list of customers (e.g., "Customers who haven't visited in 30 days"), **so that** I can drive traffic on slow nights.
    *   *Acceptance Criteria:* The CRM dashboard must provide filters for "Last Visit Date", "Lifetime Spend", and "Favorite Item". Generating the campaign sends the message via an integrated SMS gateway. The system must track open/redemption rates if a unique promo code is included.
    *   **Entities:** `CustomerProfile`, `MarketingCampaign`, `CampaignMessageLog`
    *   **Tech Stack:** React + shadcn + Tailwind

### Epic 4: Guest Sentiment & Feedback
**Goal:** Capture and analyze guest satisfaction to improve service.

*   **US-4.1: Post-Meal Feedback Collection**
    *   **As an** Owner, **I want to** send an automated SMS/Email after a guest pays their bill asking for a 1-5 star rating and comment, **so that** I can track service quality.
    *   *Acceptance Criteria:* SMS sent 30 minutes after `PAID` state. Feedback link leads to a simple 1-question survey. Results appear in Manager dashboard.
    *   **Entities:** `GuestFeedback`, `CustomerProfile`, `OrderTicket`
    *   **Tech Stack:** React + Backend
