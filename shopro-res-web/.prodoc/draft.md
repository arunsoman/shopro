# Shopro POS — Product Documentation

## 1. Product Overview
Shopro POS is a modern, full-stack Restaurant Point of Sale (POS) system designed for maximum efficiency and visual excellence. It empowers restaurant teams to manage every aspect of their operations—from tableside ordering and kitchen coordination to sophisticated inventory procurement and customer loyalty programs—within a single, unified workflow.

## 2. Goals & Objectives
The system is designed to achieve the following outcomes:
- **Streamline Operations**: Replace manual and paper-based tracking with real-time digital coordination.
- **Enhance Precision**: Reduce order and inventory errors through automated validation and guided workflows.
- **Improve Speed**: Accelerate table turnover and service speed with optimized mobile and terminal interfaces.
- **Data-Driven Growth**: Provide deep insights into sales, staff performance, and inventory health.

## 3. Target Audience
Shopro POS caters to various personas within a restaurant ecosystem:
- **Floor Staff (Servers, Hosts)**: Use the system to manage tables, take orders, and provide personalized service.
- **Kitchen & Back-of-House Staff**: Coordinate order preparation and manage ingredient inventory.
- **Managers & Owners**: Oversee restaurant performance, manage staff, configure menus, and handle procurement.
- **Suppliers**: Interact with the system to manage RFQs (Requests for Quotation) and fulfill purchase orders.

## 4. Scope
### In Scope
- Secure multi-persona terminal login.
- Real-time floor plan and table management.
- Comprehensive menu and recipe management.
- Integrated inventory and procurement lifecycle (RFQ to PO).
- CRM, loyalty programs, and promotional campaigns.
- Multi-channel notification system.
- Advanced tax and audit compliance.

---
### Staff Login  <!-- feature-id: staff-login -->

**What it does**
The Staff Login screen serves as the secure gateway to the restaurant's terminal. It allows staff members to quickly and securely log into their specific shift using a unique 4-digit PIN.

**Who uses it**
All restaurant staff, including Owners, Managers, Servers, Hosts, and Kitchen teams.

**How it works — step by step**
1. The user arrives at the terminal login screen showing a "Welcome Back" message.
2. They enter their unique 4-digit PIN using the on-screen digital keypad.
3. For training or demonstration purposes, a "Quick Staff Login" section allows one-tap entry for common roles.
4. As digits are entered, visual feedback is provided through four secure dots.
5. Upon entering the 4th digit, the system automatically validates the PIN and logs the user in.
6. The user is redirected to their role-specific dashboard (e.g., Floor Plan for Servers, Dashboard for Managers).

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| PIN Entry Pad | A 3x4 digital keypad (0-9, delete, and manual submit) for entering access codes. |
| Secure PIN Display | Four visual indicators that fill up as the PIN is entered to maintain privacy. |
| Quick Staff Login | A carousel of staff avatars (Owner, Manager, Host, Server, etc.) for rapid testing or selection. |
| Role Hints | Displays the role name and a visual avatar for each quick-login option. |
| Header Actions | Provides access to Help, Support, and Terminal Settings. |
| Footer Information | Links to Privacy Policy, Terms, and Contact information. |

**Business Rules**
- Each staff member must have a unique 4-digit PIN.
- The system automatically triggers a login attempt once the 4th digit is keyed in.
- Sessions are role-bound, ensuring users only see the features they are authorized to use.
- Incorrect PIN entries provide an immediate "Incorrect PIN" error message.

**User stories**
- As a server, I can quickly log in via my PIN so that I can start taking orders immediately.
- As a manager, I can enter my secure PIN to access administrative tools and reports.
- As a trainee, I can use the Quick Staff Login to explore the system's different role perspectives.

---

---
### Main Dashboard  <!-- feature-id: main-dashboard -->

**What it does**
The Main Dashboard serves as the central command center for the restaurant. Upon logging in, staff members are greeted by a personalized hub that provides one-tap access to all the modules they are authorized to use, tailored specifically to their role.

**Who uses it**
All restaurant staff who have successfully logged into the terminal.

**How it works — step by step**
1. After a successful login, the user is redirected to the Dashboard.
2. They see a personalized greeting (e.g., "Welcome back, Sarah").
3. The dashboard area displays a grid of "Navigation Cards," each representing a specific part of the system like "Floor Plan" or "Inventory."
4. The system automatically hides any modules that the logged-in user does not have permission to access.
5. The user can see at a glance how many modules are active for them.
6. Clicking any card opens that specific module's workspace.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Personalized Greeting | Displays the staff member's name and an encouraging welcoming message. |
| Module Grid | A responsive layout of cards, each with a unique icon, title, and brief description of the module. |
| Module Badges | Some cards feature status badges like "New," "Live Depletion," or "Staff View" to highlight specific functionality. |
| Navigation Cards | Interactive tiles that act as shortcuts to the system's core features (Floor Plan, Menu, CRM, etc.). |
| Permission-Based Filtering | Ensures a clean interface by only showing cards relevant to the user's job description. |

**Business Rules**
- The dashboard is dynamically generated based on the user's assigned role and permissions.
- Administrative modules (like Staff Management or Taxes) are reserved for Owners, Managers, and specific administrative staff.
- Operational modules (like Floor Plan) are available to all staff to ensure smooth service coordination.

**User stories**
- As a manager, I can see all administrative and operational modules so that I can oversee the entire restaurant from one place.
- As a server, I can quickly access the Floor Plan from the dashboard to start managing my tables.
- As a chef, I can see the Inventory module to check stock levels for my prep list.

---

---
### Menu Categories  <!-- feature-id: menu-categories -->

**What it does**
The Categories module allows managers to define the high-level architecture of their menu. By grouping items into logical sections like "Appetizers," "Mains," or "Cocktails," staff can navigate the menu more efficiently during service.

**Who uses it**
Restaurant Owners and Managers.

**How it works — step by step**
1. The user opens the Categories page to see a list of current menu groups.
2. They can add a new category by clicking "+ Create Category" and typing a name.
3. Once created, the user can reorder categories using a simple drag-and-drop interface.
4. The order of categories here determines how they appear on the POS terminals and mobile ordering apps.
5. Clicking "Save" instantly synchronizes the updated structure across all devices in the restaurant.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Category List | A vertical list of all defined sections (e.g., Starters, Pizzas). |
| Drag Handles | Allow the user to grab and move categories to change their sequence. |
| Inline Creation Form | A quick input field that appears for naming new categories without leaving the page. |
| Edit Actions | Options to rename or reorganize existing categories. |

**Business Rules**
- Categories are global across the restaurant's menu.
- The display order established in this module is pixel-faithfully reflected on the ordering interfaces.
- A category must be created before items can be assigned to it.

**User stories**
- As a manager, I can create a "Summer Specials" category so that I can group seasonal items together.
- As a chef, I can move the "Daily Dessert" category to the top of the list for quick access during service.

---
### Menu Items  <!-- feature-id: menu-items -->

**What it does**
The Menu Items module is where the actual dishes and drinks are managed. Managers can define prices, add mouth-watering descriptions, upload photos, and control the real-time availability of every item in the restaurant.

**Who uses it**
Managers, Owners, and Kitchen Chefs.

**How it works — step by step**
1. The user navigates to "Menu Items" to see a visual grid of all dishes.
2. They can switch between a "Live Menu" view (items current sold) and a "Drafts" view (experimental or out-of-stock items).
3. To add an item, the user fills out a form including: Name, Price, Category, and Description.
4. They can upload an image to help staff identify the dish quickly.
5. If a dish has options (e.g., "Add extra cheese" or "Cooking temperature"), the user can link it to specific "Modifier Groups."
6. If an ingredient runs out during service, a manager can "86" the item with one click, instantly removing it from the ordering screens.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Item Card | Shows a photo of the dish, its name, base price, and current category. |
| Status Badges | Color-coded indicators: "LIVE" (published), "DRAFT" (private), or "86'd" (out-of-stock). |
| 86/Un-86 Toggle | A high-speed toggle to remove an out-of-stock item from the menu immediately. |
| Item Form | A comprehensive screen for managing name, pricing, photos, and linked modifiers. |
| Photo Upload | A dedicated area to drag and drop high-quality dish photographs. |
| Category Filter | A dropdown to narrow down the view to a specific section (e.g., only "Pasta"). |

**Business Rules**
- An item must be assigned to a category to be valid.
- "86'ing" an item is non-destructive; it preserves all data but marks it as unavailable for ordering.
- Base prices represent the starting cost before any modifiers (add-ons) are applied.
- Items can be saved as drafts for safe editing before going live.

**User stories**
- As a manager, I can "86" the Truffle Burger when we run out of buns, so that servers don't take accidental orders.
- As a server, I can see rich descriptions of dishes to better explain them to guests.
- As an owner, I can update the price of a vintage wine across all terminals instantly.

---

---
### Live Floor Plan  <!-- feature-id: floor-plan -->

**What it does**
The Live Floor Plan is the visual heart of the restaurant's daily service. It provides a real-time, overhead view of the entire dining area, allowing hosts and servers to see instantly which tables are occupied, which are ready for seating, and which need cleaning.

**Who uses it**
Hosts, Servers, and Managers.

**How it works — step by step**
1. Upon opening the Floor Plan, the user sees the restaurant's layout with all tables represented as interactive badges.
2. The color of each table indicates its current state (e.g., Green for Available, Blue for Occupied, Orange for Dirty).
3. If there is a "Waitlist," it appears in the left sidebar.
4. To seat a waiting party, the host simply drags their name from the waitlist and drops it onto an "Available" table.
5. Clicking on any table opens the "Table Action Modal," where staff can seat walk-ins, mark a table as cleaned, or update its status manually.
6. The "Tableside Requests" sidebar on the right alerts staff to any active digital menus or help requests from guests at their tables.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Interactive Table Badges | Show table names, capacity, and current status (e.g., "Food Sent"). |
| Waitlist Sidebar | A list of guests waiting for tables, including party sizes and estimated wait times. |
| Drag-and-Drop Seating | Allows for rapid seating of guests by moving them from the waitlist to the floor. |
| Table Action Modal | A premium, focused window for performing table-specific tasks like seating or clearing. |
| Status Legend | A quick reference guide explaining the color coding used on the floor. |
| Tableside Sync | A live feed of active customer sessions and requests from the tables. |

**Business Rules**
- Tables can only be assigned to a new party if their status is "Available" or "Reserved."
- Seating a party from the waitlist automatically updates the table status to "Occupied."
- After a party departs, the table is marked "Dirty" to signal the bussing staff.
- Once cleaned, a single tap transitions the table back to "Available."

**User stories**
- As a host, I can see at a glance that Table 4 is dirty, so I can ask a busser to clear it for the next party.
- As a server, I can see that Table 10 has had "Food Sent," letting me know they are currently dining.
- As a manager, I can drag a VIP party to a reserved booth with one smooth motion.

---
### Waitlist Management  <!-- feature-id: waitlist -->

**What it does**
The Waitlist module helps manage guest flow during busy periods. It ensures walk-in parties are tracked fairly and notified efficiently when their table is ready, reducing congestion at the host stand.

**Who uses it**
Hosts and Maitre D's.

**How it works — step by step**
1. When a walk-in party arrives, the host clicks "Add Guest" in the waitlist sidebar.
2. They enter the guest's name, party size, and optional phone number.
3. The system adds them to the list and displays an estimated wait time.
4. When a suitable table becomes available, the host can notify the guest via SMS (if a phone number was provided).
5. Dragging the guest entry onto a table on the floor plan completes the seating process.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Guest Entry Form | Fields for Name, Party Size, and Phone Number. |
| Waiting List | A prioritized list of parties sorted by their arrival time. |
| SMS Notification | A button to send a "Your table is ready" text message to the guest. |
| Estimated Wait Time | A calculation helping hosts set expectations for arriving guests. |
| Remove Action | Allows for one-tap removal if a guest decides to leave before being seated. |

**Business Rules**
- "Notified" guests remain on the list until they are seated or removed.
- Party size validation ensures hosts don't accidentally seat a party of 6 at a table for 2.
- Wait times are updated live as tables turn over.

**User stories**
- As a host, I can add a party of 4 to the waitlist and give them an accurate 20-minute estimate.
- As a guest, I can receive a text message on my phone when my table is ready, allowing me to wait at the bar.

---

---
### Stock Dashboard  <!-- feature-id: inventory-stock -->

**What it does**
The Stock Dashboard provides a real-time command center for managing the restaurant's raw ingredients and supplies. It turns complex data into actionable insights, highlighting critical shortages and financial performance at a glance.

**Who uses it**
Managers, Chefs, and owners.

**How it works — step by step**
1. The dashboard displays key performance indicators (KPIs) like "Critical Alerts" and "Total Inventory Value."
2. Managers check the "Critical Alerts" card to see which ingredients are below their fallback safety levels.
3. The "Inventory List" shows every ingredient in the restaurant, its current stock, and its unit cost.
4. Staff can log "Waste" (e.g., spoiled products) directly from the dashboard to keep financial records accurate.
5. The dashboard is divided into tabs for high-level overview, active procurement, and detailed analytical reports.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| KPI Cards | High-level summary of alerts, active orders, total stock value, and monthly waste. |
| Ingredient Table | A detailed list of stock including unit count, yield percentage, and effective cost. |
| Stock Status Badges | Color-coded status: Healthy (Green), Reorder Now (Yellow), or Critical (Red). |
| Waste Logging | A quick-access tool to record ingredient loss due to spoilage or breakage. |
| Auto-PO Indicator | Highlights ingredients that the system will automatically reorder when low. |

**Business Rules**
- Inventory levels are updated automatically as menu items are sold (based on linked recipes).
- "Critical" alerts triggered once stock falls below the user-defined emergency threshold.
- Inventory value is calculated based on the latest effective cost from confirmed purchase orders.

**User stories**
- As a chef, I can see that "Salmon" is in critical status and immediately place an order with my supplier.
- As an owner, I can track our monthly waste figure to identify areas for cost reduction.

---
### Procurement & Purchase Orders  <!-- feature-id: inventory-procurement -->

**What it does**
This module manages the professional supply chain for the restaurant. It handles the lifecycle of buying ingredients—from creating a purchase request to approving orders and tracking their delivery.

**Who uses it**
Managers and Owners.

**How it works — step by step**
1. When stock is low, the system (or a manager) generates a Purchase Order (PO) draft.
2. Drafts are moved to "Pending Approval" where an owner or senior manager reviews the cost and quantity.
3. Once approved, the PO is "Sent" to the supplier via email or the Supplier Portal.
4. The "Procurement Kanban" provides a visual board to track every active order as it moves from "Sent" to "Acknowledged" by the vendor.
5. Upon arrival, staff can verify the items against the PO to confirm they received what was ordered.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Procurement Kanban | A visual board with columns for Approval, Dispatched, and Acknowledged orders. |
| PO Cards | Show supplier name, total order value, expected delivery date, and a summary of items. |
| Approval Actions | Direct "Approve" and "Reject" buttons for managers to process pending orders quickly. |
| Search & Filter | Allows finding specific orders by supplier or order ID. |

**Business Rules**
- Purchase orders must be approved by authorized personnel before being sent to suppliers.
- Expected delivery dates help floor staff anticipate stock replenishment.
- All procurement actions are logged for financial audit trails.

**User stories**
- As a manager, I can approve a batch of weekend orders on the Kanban board with a few clicks.
- As a chef, I can see on the dashboard that my "Produce Order" has been dispatched and is on its way.

---
### Recipe Builder & Costing  <!-- feature-id: inventory-recipes -->

**What it does**
The Recipe Builder connects the menu to the pantry. By defining the exact ingredients and quantities used in every dish, the system can automatically deduct stock when an order is placed and provide a precise calculation of "plate cost."

**Who uses it**
Executive Chefs and Managers.

**How it works — step by step**
1. The chef selects a menu item (e.g., "Truffle Burger") from the list.
2. They define each ingredient required (e.g., 200g Beef, 1 Brioche Bun).
3. The system automatically pulls the latest ingredient costs to calculate the "Theoretical Food Cost" of the dish.
4. This allows the chef to see their profit margin instantly compared to the menu price.
5. Once saved, these recipes are used by the POS to enable "Live Stock Depletion."

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Menu Item Picker | A grid of all active dishes and drinks in the restaurant. |
| Recipe Editor | A tool to search for ingredients and set their precise measurements for a dish. |
| Costing Summary | Displays the total ingredient cost vs. the selling price to show profit margins. |
| Inventory Link | Shows exactly which stock items will be depleted when the dish is sold. |

**Business Rules**
- Recipes are required for the system to automate stock level tracking.
- Yield percentages are factored into calculations to account for prep waste (e.g., trimming vegetables).
- Plate costs update automatically whenever new purchase order prices are confirmed.

**User stories**
- As a chef, I can build a recipe for a new special and see immediately if our margin targets are being met.
- As an owner, I can trust that our stock levels are accurate because they decrease every time a server rings in an order.

---

---
### CRM & Guest Profiles  <!-- feature-id: crm-database -->

**What it does**
The CRM (Customer Relationship Management) module is the restaurant's memory. It stores detailed guest profiles, tracking their preferences, loyalty achievements, and lifetime value to ensure every guest feels like a regular.

**Who uses it**
Hosts, Servers, and Managers.

**How it works — step by step**
1. Staff can "Register" a guest by entering their basic contact details.
2. Every time the guest visits, the system tracks their spend and assigns loyalty points based on their behavior.
3. Detailed profiles show a "Loyalty Snapshot," including lifetime spend and visit frequency.
4. If a guest has multiple entries (e.g., registered once with a phone and once with an email), the "Merge Profiles" tool can combine them into a single, clean record.
5. In the "Customer Detail" view, staff can add "Dietary Tags" (e.g., Gluten-Free) or record "Special Occasions" like birthdays to enable personalized service.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Guest Database | A searchable list of all customers, showing their contact info and loyalty tier. |
| Loyalty Snapshot | A quick-view card showing available points, total spend, and visit count. |
| Preference Notes | A dedicated section for staff to record guest likes/dislikes (e.g., "Prefers quiet corner tables"). |
| Dietary Tags | Visual badges highlighting allergies or dietary restrictions. |
| Special Occasions | Tracks birthdays and anniversaries to unlock "surprise and delight" moments. |
| Merge Tool | A safe, step-by-step assistant to combine duplicate guest records. |

**Business Rules**
- Loyalty tiers (Bronze, silver, etc.) are calculated automatically based on spend or visit frequency.
- Merging profiles is an irreversible action that preserves all historical transaction data.
- Staff notes are shared across all touchpoints (Web and Tableside) to ensure consistent service.

**User stories**
- As a server, I can see that a guest has a "Shellfish Allergy" tag and warn them about specific menu items.
- As a manager, I can identify our "Platinum" members and personally visit their table.
- As a host, I can merge two duplicate profiles for the same guest to keep our database clean.

---
### Loyalty & Rewards  <!-- feature-id: crm-loyalty -->

**What it does**
This module manages the rules for earning and spending rewards. It turns dining into a game, encouraging guests to return more frequently by offering tangible benefits for their loyalty.

**Who uses it**
Managers and Marketing Staff.

**How it works — step by step**
1. Each guest is assigned a "Tier" (e.g., Gold) based on their engagement.
2. Higher tiers unlock better earn rates or exclusive benefits.
3. Guests earn "Points" for every dollar spent.
4. In the POS, guests can "Redeem" these points for discounts or free items.
5. A detailed "Loyalty History" tracks every point added or removed from a guest's balance.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Tier Badges | Premium-styled badges (Gold, Platinum) that appear on the guest's profile. |
| Points Balance | A live counter showing how much the guest can currently spend. |
| Transaction History | A ledger of all points earned from orders or spent on rewards. |

**Business Rules**
- Points are awarded upon order finalization.
- Certain items (e.g., alcohol or tax) can be excluded from point earning based on local regulations.
- Points can be set to expire if a guest does not visit within a specific timeframe.

**User stories**
- As a frequent guest, I am proud to see my "Platinum" status and know I'm getting 10% back in points.
- As a manager, I can review a guest's loyalty history to resolve a dispute about missing points.

---

---
### Taxes & Compliance  <!-- feature-id: taxes-compliance -->

**What it does**
The Taxes & Compliance module ensures the restaurant remains legally compliant with local financial regulations. It automates the complex calculation of taxes based on what is being sold, where it’s being eaten, and any regional requirements.

**Who uses it**
Accountants, Managers, and Owners.

**How it works — step by step**
1. The user selects the "Active Jurisdiction" (e.g., United Arab Emirates or United Kingdom).
2. The system automatically loads the correct "Tax Model" (e.g., 5% Standard VAT).
3. "Tax Rules" are displayed, showing exactly when a tax applies — such as for "Hot Food" or "Alcoholic Beverages."
4. If the government announces a temporary change, a manager can use the "Administrative Override" to update a rate manually.
5. The "Bill Simulator" allows staff to enter test items and see exactly how the tax breakdown will look on a final guest check before going live.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Jurisdiction Switcher | Allows changing the primary country of operation and its associated tax laws. |
| Tax Rule Cards | Detailed rules showing triggers like "Takeaway" vs. "Dine-in" and "Hot" vs. "Cold." |
| Rate Overrides | A secure way for authorized staff to adjust a tax percentage. |
| Compliance Note | A visual guide highlighting whether taxes are "Inclusive" (Price includes tax) or "Exclusive." |
| Bill Simulator | A sandbox tool to verify tax calculations across different order scenarios. |

**Business Rules**
- Taxes are automatically categorized based on item metadata (e.g., an item tagged "Alcohol" triggers the higher tax rule).
- Administrative overrides are locked within "Legal Bounds" to prevent accidentally setting a rate that is too high or low.
- Every rate change is logged for audit purposes.

**User stories**
- As an accountant, I can set our jurisdiction to the UK and trust that "Takeaway Cold Food" (Zero-rated) is handled differently than "Dine-in Hot Food."
- As a manager, I can use the Bill Simulator to prove to the owner that our new service charge and VAT are calculating correctly.

---
### Floor Plan Designer  <!-- feature-id: settings-floor-layout -->

**What it does**
The Floor Plan Designer allows managers to build a digital twin of their physical restaurant. This layout is then used by the front-of-house staff for seating and order management.

**Who uses it**
General Managers and Owners.

**How it works — step by step**
1. The user creates "Sections" (e.g., Main Dining, Patio, Bar) to organize the restaurant.
2. Using the "Table Templates," they drag shapes (Square, Round, or Long) onto the interactive canvas.
3. Tables can be positioned exactly where they are in the real restaurant to make them easy for staff to find.
4. Each table is given a name (e.g., T-1) and a guest capacity.
5. Clicking "Save Layout" pushes the new design to all POS terminals and the "Live Floor Plan" page.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Interactive Canvas | A drag-and-drop workspace with a visual grid for precise table placement. |
| Table Templates | Pre-defined shapes for Square, Round, and Rectangular tables. |
| Section Manager | A sidebar to add, rename, or toggle the visibility of different restaurant areas. |
| Table Editor | One-tap removal or renaming of placed tables. |

**Business Rules**
- Tables must have a unique name within their section.
- Layouts must be "Saved" before they become active for the staff.

**User stories**
- As a manager, I can quickly add 4 extra tables to the "Terrace" section before a busy weekend.
- As an owner, I can design a completely new floor plan for a holiday event using the drag-and-drop builder.

---

---
### Tableside Configuration  <!-- feature-id: settings-tableside -->

**What it does**
The Tableside Configuration module bridges the gap between the POS and the guest's mobile device. it handles the setup for "Self-Serve" ordering, where guests scan a QR code at their table to view the menu and place orders.

**Who uses it**
Managers and System Administrators.

**How it works — step by step**
1. The manager enables "Tableside Ordering" in the Global Configuration card.
2. They can toggle "Require Server Approval" if they want staff to vet every order before it reaches the kitchen.
3. The system displays a list of all tables from the floor plan.
4. For each table, the manager "Generates" a secure QR token.
5. Once generated, these QR codes can be printed in bulk or individually.
6. The printed QR codes are then placed on the physical tables in the restaurant for guest use.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Global Toggle | Turns the tableside experience on or off for the entire venue. |
| QR Generator | Creates unique, secure links for each table in the restaurant. |
| Print Preview | A  window for printing QR tokens with restaurant branding. |
| Table Selection | A checklist to select which specific tables should have active digital ordering. |
| Batch Actions | Tools to generate or print QR codes for dozens of tables at once. |

**Business Rules**
- QR codes are table-specific; scanning Table 1's code will never send an order to Table 2.
- Server approval acts as a safety barrier to prevent accidental or malicious orders from guests.
- QR tokens can be refreshed if a security risk is identified.

**User stories**
- As a manager, I can enable self-serve ordering for the "Bar" section but keep it disabled for the "Fine Dining" area.
- As an owner, I can print professional-looking QR codes to place in acrylic stands on every table.

---
### Analytics & Business Intelligence  <!-- feature-id: analytics-main -->

**What it does**
The Analytics module provides a high-level view of the restaurant's health. It aggregates data from sales, inventory, and CRM to help managers make data-driven decisions about menu pricing, staffing, and promotions.

**Who uses it**
Owners and General Managers.

**How it works — step by step**
1. The system automatically collects data from every transaction and stock movement.
2. Managers view "Sales Dashboards" to see revenue trends and top-selling items.
3. In the "Inventory Analytics," they compare "Theoretical vs. Actual" stock levels to find where ingredients are being lost (e.g., through prep waste or theft).
4. "CRM Analytics" show guest demographic data and the performance of loyalty tiers.
5. These reports can be filtered by date range, category, or employee to drill down into specific performance areas.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Sales KPI Cards | Real-time tracking of revenue, average check size, and covers. |
| Variance Report | Highlights the difference between what *should* be in the pantry vs. what *is* there. |
| Guest Insights | Visualizes loyalty member growth and peak visiting times. |
| Trend Charts | Graphs showing business performance over days, weeks, or months. |

**Business Rules**
- Reports are updated in real-time as orders are closed in the POS.
- Financial data is restricted to users with administrative permissions.

**User stories**
- As an owner, I can review the "Best Sellers" report to decide which items to feature in our next seasonal menu.
- As a manager, I can check the "Waste Report" to see which shift is losing the most product in prep.

---

---
### CRM Strategic Analytics  <!-- feature-id: crm-analytics -->

**What it does**
CRM Strategic Analytics provides managers with a look into guest behavior and program performance. It helps transition from reactive service to proactive guest engagement by identifying trends and at-risk relationships.

**Who uses it**
Managers and Owners.

**How it works — step by step**
1. The dashboard summarizes health metrics like "Active Members" and "New Enrollments."
2. It tracks "Avg. Lifetime Value" to show the long-term profitability of the guest database.
3. The "At-Risk Guests" list highlights regulars who haven't visited in over 60 days.
4. Managers can use the "Win-Back Offer" button to send a targeted promotion to those specific guests.
5. "Server Feedback Stats" aggregates guest ratings to show which staff members are providing the best (or most improved) service.

**What the user can see & do**

| Screen Element | What It Shows / Does |
|---|---|
| Health KPI Cards | Tracking for active loyalty members, new sign-ups, and CLV (Customer Lifetime Value). |
| At-Risk Guest List | Names and last visit dates of guests who are likely to churn. |
| Points Liability | A financial figure showing the total cost of unspent guest rewards. |
| Win-Back Action | A direct shortcut to re-engage with fading customers. |
| Service Quality Gauge | A bar chart showing server ratings based on real guest feedback. |

**Business Rules**
- Guests are classified as "At-Risk" if their last visit was more than 60 days ago.
- CLV is calculated as the sum of all guest orders across the POS and Tableside channels.
- Points liability is estimated based on the average redemption value of active points.

**User stories**
- As a manager, I can see that our "Points Liability" is growing too fast and decide to launch a limited-time redemption event.
- As an owner, I can reward our top-rated servers based on the "Service Quality" report.

---

---
## Data Architecture & Backend Mapping  <!-- sector-id: data-architecture -->

This section provides a technical bridge between the user-facing features and the underlying data structures. It outlines the primary API endpoints and the database entities that power the Shopro POS ecosystem.

### 1. Menu & Presentation
**Visual Elements:** Menu Items, Categories, Modifiers.

| UI Feature | Primary API Endpoint | Backend Entity (JPA) |
|---|---|---|
| Menu Categories | `/api/menu/categories` | `MenuCategory` |
| Item Catalog | `/api/menu/items` | `MenuItem`, `MenuItemStatus` |
| Customizations | `/api/menu/modifiers` | `ModifierGroup`, `ModifierOption` |

**Data Flow:**
Menu items are linked to `MenuCategory` for organizational hierarchy. Availability is controlled via the `MenuItemStatus` enum, which triggers the "86'd" visual state in the UI.

### 2. Service & Floor Management
**Visual Elements:** Live Floor Plan, Waitlist, Tableside Requests.

| UI Feature | Primary API Endpoint | Backend Entity (JPA) |
|---|---|---|
| Floor Layout | `/api/floor/tables` | `TableShape`, `Section` |
| Guest Waitlist | `/api/floor/waitlist` | `WaitlistEntry`, `WaitlistStatus` |
| Table Actions | `/api/floor/tables/{id}/status` | `TableStatus` (Enum/Mapping) |

**Data Flow:**
The `TableShape` entity stores the spatial coordinates (X, Y) and dimensions used by the Floor Designer. Seating a guest creates a link between a `WaitlistEntry` and a `Table`, transitioning both to an active service state.

### 3. Inventory & Procurement
**Visual Elements:** Stock Dashboard, Purchase Orders, Recipe Builder.

| UI Feature | Primary API Endpoint | Backend Entity (JPA) |
|---|---|---|
| Ingredient Tracking | `/api/inventory/ingredients` | `RawIngredient` |
| Purchase Orders | `/api/procurement/orders` | `PurchaseOrder`, `PurchaseOrderLine` |
| Recipe Costing | `/api/inventory/recipes` | `Recipe`, `RecipeIngredient` |

**Data Flow:**
Sales in the POS trigger a "depletion" event. The system looks up the `Recipe` for the sold item, identifies the `RecipeIngredient` quantities, and decrements the `RawIngredient` stock levels in real-time.

### 4. CRM & Loyalty
**Visual Elements:** Guest Database, Persistence Notes, Points Balance.

| UI Feature | Primary API Endpoint | Backend Entity (JPA) |
|---|---|---|
| Guest Profiles | `/api/crm/customers` | `CustomerProfile` |
| Loyalty Tiers | `/api/crm/tiers` | `LoyaltyTier` |
| Points Ledger | `/api/crm/transactions` | `LoyaltyTransaction` |

**Data Flow:**
The `CustomerProfile` acts as a central hub, linking to `CustomerOccasion` and `CustomerDietaryTag` for personalization. All financial spend is recorded in `LoyaltyTransaction`, which incrementally updates the guest's `availablePoints`.

---

### 5. Taxes & Financial Compliance
**Visual Elements:** Tax Jurisdictions, Rule Overrides, Bill Simulator.

| UI Feature | Primary API Endpoint | Backend Entity (JPA) |
|---|---|---|
| Jurisdictions | `/api/taxes/countries` | `Country` |
| Rules & Overrides | `/api/taxes/rules` | `TaxRule`, `VenueTaxConfig` |
| Compliance Audit | `/api/taxes/audit` | `TaxAuditLog` |

**Data Flow:**
The `TaxEngine` evaluates every line item in an order against active `TaxRule` definitions. It considers attributes like `isAlcohol`, `itemTemperature`, and `isTakeaway` to produce a `TaxCalculationResult`, which is then persisted for financial reporting.

---
