---
description: Tableside Ordering Enhancement Workflow - QR, UX, and Notifications
---

# Tableside Ordering Flow Workflow

This workflow describes the end-to-end process for implementing and managing the secure tableside ordering system.

## 1. Setup & QR Generation
1.  **Generate Tokens:** Use `QrCodeService` to generate unique Base64 QR tokens for each table.
2.  **Printing:** Use the "Tableside Settings" page in the POS to print physical QR tags.
    - Path: Menu -> Settings -> Tableside QR Management.
    - The URL is configured as `https://tableasist.afriqpay.com/scan/{token}`.

## 2. Guest Entry & Security
1.  **QR Scan:** Guest scans the QR code. The app validates the token and hits the backend `/scan/{token}` endpoint.
2.  **Instant Awareness:**
    - The Table status is automatically updated to **OCCUPIED** in the Floor Plan.
    - A **TABLE_OCCUPIED** notification is dispatched to all staff.
3.  **Staff Approval:**
    - The session enters `PENDING_APPROVAL` status.
    - Staff must approve the session via the "Tableside Requests" sidebar in the Floor Plan.

## 3. Premium Ordering Experience
1.  **Menu Browsing:** The guest app displays a minimal, clutter-free menu grid.
2.  **Dish Discovery:** 
    - Tapping a dish uses **Hero Animations** to transition into an **Item Detail Sheet**.
    - Guests view the dish description and **Preparation Time**.
3.  **Cart Management:** Guests add items from the detail sheet, ensuring a focused mobile-first interaction.

## 4. Interaction & Feedback
1.  **Order Submission:** Guests submit orders which go through the standard kitchen/POS workflow.
2.  **Guest Feedback:**
    - Guests can rate specific items (1-5 stars) and leave comments using the star-rating dialog.
    - Feedback is stored in the `MenuItemRating` entity for manager review.

## 5. Session Termination
1.  **Payment & Checkout:** Guest pays at the table or POS.
2.  **Table Reset:** When staff marks the table as **CLEAN** in the Floor Plan, the tableside session is automatically invalidated (marked as `EXPIRED`).
3.  **Security:** This ensures the QR code cannot be reused by the same guest from outside the restaurant.
