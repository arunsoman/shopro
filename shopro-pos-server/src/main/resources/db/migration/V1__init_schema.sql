-- V1__init_schema.sql
-- Consolidated schema and seed data for Shopro POS.
-- This file contains all tables and initial demonstration data.

-- 1. Staff & Authentication
CREATE TABLE staff_member (
    id UUID PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 2. Menu Management
CREATE TABLE menu_category (
    id UUID PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE menu_item (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES menu_category(id),
    name VARCHAR(60) NOT NULL,
    description VARCHAR(500),
    base_price NUMERIC(10, 2) NOT NULL,
    photo_url VARCHAR(1024),
    status VARCHAR(20) NOT NULL, -- e.g. 'PUBLISHED', 'DRAFT'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE modifier_group (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    required BOOLEAN NOT NULL,
    min_selections INTEGER NOT NULL DEFAULT 0,
    max_selections INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE modifier_option (
    id UUID PRIMARY KEY,
    modifier_group_id UUID NOT NULL REFERENCES modifier_group(id),
    label VARCHAR(80) NOT NULL,
    upcharge_amount NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE menu_item_modifier_group (
    id UUID PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES menu_item(id),
    modifier_group_id UUID NOT NULL REFERENCES modifier_group(id),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    CONSTRAINT uq_item_modifier_group UNIQUE (menu_item_id, modifier_group_id)
);

-- 3. Floor Plan
CREATE TABLE section (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE table_shape (
    id UUID PRIMARY KEY,
    section_id UUID NOT NULL REFERENCES section(id),
    name VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    shape_type VARCHAR(20) NOT NULL DEFAULT 'RECTANGLE',
    nfc_tag_id VARCHAR(64) UNIQUE,
    assigned_staff_id UUID REFERENCES staff_member(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE waitlist_entry (
    id UUID PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    party_size INTEGER NOT NULL,
    phone_number VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    seated_at_table_id UUID REFERENCES table_shape(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE reservation (
    id UUID PRIMARY KEY,
    table_id UUID NOT NULL REFERENCES table_shape(id),
    customer_name VARCHAR(100) NOT NULL,
    reservation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    party_size INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    handled_by_id UUID REFERENCES staff_member(id),
    created_by_id UUID REFERENCES staff_member(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 4. CRM & Loyalty
CREATE TABLE loyalty_tier (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    spend_threshold NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    point_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE customer_profile (
    id UUID PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    loyalty_tier_id UUID REFERENCES loyalty_tier(id),
    lifetime_spend NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    available_points INTEGER NOT NULL DEFAULT 0,
    preference_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE marketing_campaign (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    campaign_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 5. Order Management
CREATE TABLE order_ticket (
    id UUID PRIMARY KEY,
    table_id UUID REFERENCES table_shape(id),
    server_id UUID NOT NULL REFERENCES staff_member(id),
    customer_profile_id UUID REFERENCES customer_profile(id),
    status VARCHAR(20) NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'DINE_IN',
    parent_ticket_id UUID REFERENCES order_ticket(id),
    cover_count INTEGER NOT NULL DEFAULT 1,
    delivery_address VARCHAR(500),
    vehicle_model VARCHAR(50),
    vehicle_color VARCHAR(30),
    vehicle_plate VARCHAR(20),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tip_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE order_item (
    id UUID PRIMARY KEY,
    ticket_id UUID NOT NULL REFERENCES order_ticket(id),
    menu_item_id UUID NOT NULL REFERENCES menu_item(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    modifier_upcharge_total NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL,
    custom_note VARCHAR(100),
    has_allergy_flag BOOLEAN NOT NULL DEFAULT FALSE,
    is_subtraction BOOLEAN NOT NULL DEFAULT FALSE,
    course_number INTEGER NOT NULL DEFAULT 1,
    fired_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE order_item_modifier (
    id UUID PRIMARY KEY,
    order_item_id UUID NOT NULL REFERENCES order_item(id),
    modifier_option_id UUID NOT NULL REFERENCES modifier_option(id),
    upcharge_amount NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE loyalty_transaction (
    id UUID PRIMARY KEY,
    customer_profile_id UUID NOT NULL REFERENCES customer_profile(id),
    order_ticket_id UUID REFERENCES order_ticket(id),
    points INTEGER NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE order_audit_log (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES order_ticket(id),
    event_type VARCHAR(50) NOT NULL,
    details TEXT,
    performed_by UUID REFERENCES staff_member(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 6. Inventory Management
CREATE TABLE supplier (
    id UUID PRIMARY KEY,
    company_name VARCHAR(120) NOT NULL UNIQUE,
    contact_name VARCHAR(100),
    contact_email VARCHAR(254),
    contact_phone VARCHAR(30),
    lead_time_days INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE raw_ingredient (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    unit_of_measure VARCHAR(20) NOT NULL,
    cost_per_unit NUMERIC(10,4) NOT NULL,
    yield_pct NUMERIC(5,4) NOT NULL DEFAULT 1.0000,
    effective_cost_per_unit NUMERIC(10,4) GENERATED ALWAYS AS (cost_per_unit / NULLIF(yield_pct, 0)) STORED,
    current_stock NUMERIC(12,4) NOT NULL DEFAULT 0,
    par_level NUMERIC(12,4) NOT NULL DEFAULT 0,
    reorder_point NUMERIC(12,4) NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES supplier(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE recipe (
    id UUID PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES menu_item(id),
    recipe_version INTEGER NOT NULL,
    effective_from TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by_id UUID REFERENCES staff_member(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    UNIQUE(menu_item_id, recipe_version)
);

CREATE TABLE recipe_ingredient (
    id UUID PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    quantity NUMERIC(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL,
    UNIQUE(recipe_id, ingredient_id)
);

CREATE TABLE inventory_transaction (
    id UUID PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    transaction_type VARCHAR(30) NOT NULL,
    quantity_delta NUMERIC(12,4) NOT NULL,
    unit_cost_at_time NUMERIC(10,4),
    reason VARCHAR(256),
    reference_id UUID,
    metadata JSONB,
    created_by_id UUID REFERENCES staff_member(id),
    transacted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE purchase_order (
    id UUID PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    generated_by_id UUID NOT NULL REFERENCES staff_member(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    sent_at TIMESTAMP WITH TIME ZONE,
    received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

CREATE TABLE purchase_order_line (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    ordered_qty NUMERIC(12,4) NOT NULL,
    received_qty NUMERIC(12,4),
    unit_cost NUMERIC(10,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 7. Kitchen Display System (KDS)
CREATE TABLE kds_station (
    id UUID PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    station_type VARCHAR(30) NOT NULL,
    online BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE kds_routing_rule (
    id UUID PRIMARY KEY,
    station_id UUID NOT NULL REFERENCES kds_station(id),
    target_type VARCHAR(20) NOT NULL,
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_routing_station_target UNIQUE (station_id, target_type, target_id)
);

CREATE TABLE kds_ticket (
    id UUID NOT NULL,
    order_ticket_id UUID NOT NULL,
    station_id UUID NOT NULL REFERENCES kds_station(id),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    fired_at TIMESTAMP WITH TIME ZONE NOT NULL,
    bumped_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE kds_ticket_p0 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE kds_ticket_p1 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE kds_ticket_p2 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE kds_ticket_p3 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 3);

CREATE TABLE kds_ticket_item (
    id UUID PRIMARY KEY,
    kds_ticket_id UUID NOT NULL REFERENCES kds_ticket(id),
    order_item_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    ready_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- 8. Tableside Ordering
CREATE TABLE tableside_session (
    id UUID PRIMARY KEY,
    table_id UUID NOT NULL REFERENCES table_shape(id),
    qr_token UUID NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE guest_cart_item (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES tableside_session(id),
    device_fingerprint VARCHAR(128) NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu_item(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    modifiers JSONB,
    custom_note VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

-- 9. Analytics & AI Insights
CREATE TABLE ai_insight (
    id UUID PRIMARY KEY,
    insight_type VARCHAR(60) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    action_suggestion VARCHAR(500),
    confidence_score NUMERIC(4, 3) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL
);

-- 10. Indexes
CREATE INDEX idx_item_category ON menu_item (category_id);
CREATE INDEX idx_table_section ON table_shape (section_id);
CREATE INDEX idx_ticket_table ON order_ticket (table_id);
CREATE INDEX idx_item_ticket ON order_item (ticket_id);
CREATE INDEX idx_kds_ticket_station ON kds_ticket (station_id);
CREATE INDEX idx_kds_item_ticket ON kds_ticket_item (kds_ticket_id);
CREATE INDEX idx_ai_insight_type ON ai_insight (insight_type);
CREATE INDEX idx_ai_insight_valid ON ai_insight (valid_until);

--------------------------------------------------------------------------------
-- SEED DATA
--------------------------------------------------------------------------------

-- 1. Staff Members (PINs: Alex 1111, Maria 2222, Hannah 3333, Sam 4444, Carlos 5555, Brie 6666)
INSERT INTO staff_member (id, full_name, pin_hash, role, active, created_at, updated_at, version)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alex Owner', '$2a$10$cuRLesBMc68B6FMcGLyfkeN11Qh4xjTKGhdQcLTXaZbjSMFx3R2W2', 'OWNER', true, NOW(), NOW(), 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Maria Manager', '$2a$10$vwRlvaykjS3Je/7EJXlKkOLCIZGrAguY9nR8a1Daq66HHASRNer/.', 'MANAGER', true, NOW(), NOW(), 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hannah Host', '$2a$10$DkWN.f8uJam5vZoSgbnr3efSfHq2z4XFahxIEsO8d.6cORf5hssUK', 'HOST', true, NOW(), NOW(), 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Sam Server', '$2a$10$nJnSnlQjK6xHIy6lt6STkuhHF0Tl9ivb1B9yj.b.DzCBryLa0xdp2', 'SERVER', true, NOW(), NOW(), 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Carlos Cashier', '$2a$10$LXAT3Ev69vdJY/Sw8BwEDOrBGwJQf3kdfDoQqRvysRgaaJ4oCYZbO', 'CASHIER', true, NOW(), NOW(), 0),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Brie Busser', '$2a$10$uO3i1hJfgMvJ4nlqp0YZbO6sWCIZCzureSc3gEJE0n1R5rzvg/NIO', 'BUSSER', true, NOW(), NOW(), 0);

-- 2. Menu Categories
INSERT INTO menu_category (id, name, display_order, created_at, updated_at, version)
VALUES 
('a1000000-0000-0000-0000-000000000001', 'Starters', 1, NOW(), NOW(), 0),
('a1000000-0000-0000-0000-000000000002', 'Burgers', 2, NOW(), NOW(), 0),
('a1000000-0000-0000-0000-000000000003', 'Mains', 3, NOW(), NOW(), 0),
('a1000000-0000-0000-0000-000000000004', 'Drinks', 4, NOW(), NOW(), 0);

-- 3. Modifier Groups
INSERT INTO modifier_group (id, name, required, min_selections, max_selections, created_at, updated_at, version)
VALUES 
('b1000000-0000-0000-0000-000000000001', 'Meat Temperature', true, 1, 1, NOW(), NOW(), 0),
('b1000000-0000-0000-0000-000000000002', 'Burger Add-ons', false, 0, 3, NOW(), NOW(), 0);

-- 4. Modifier Options
INSERT INTO modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version)
VALUES 
('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Rare', 0.00, 1, NOW(), NOW(), 0),
('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Medium Rare', 0.00, 2, NOW(), NOW(), 0),
('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Medium', 0.00, 3, NOW(), NOW(), 0),
('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Well Done', 0.00, 4, NOW(), NOW(), 0),
('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Extra Cheese', 1.50, 1, NOW(), NOW(), 0),
('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Bacon Strips', 2.00, 2, NOW(), NOW(), 0);

-- 5. Menu Items
INSERT INTO menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version)
VALUES 
-- Starters
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Crispy Calamari', 'Fried golden brown with aioli.', 12.00, 'https://images.unsplash.com/photo-1590594507435-06775f0a0c4f?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Caesar Salad', 'Romaine, croutons, parmesan.', 14.50, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000010-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Quesadillas', 'Chicken, peppers, cheese.', 10.00, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000010-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Truffle Fries', 'Parmesan and herb garnish.', 9.00, '/api/v1/media/menu-items/truffle_fries_jpg_1772537607878.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000010-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Garlic Shrimp', 'Sizzling butter and herbs.', 16.00, '/api/v1/media/menu-items/garlic_shrimp_jpg_1772537627472.png', 'PUBLISHED', NOW(), NOW(), 0),

-- Burgers
('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Classic Smash Burger', 'American cheese, special sauce.', 17.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000020-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'BBQ Brisket Burger', 'Juicy beef, melted cheddar.', 22.00, '/api/v1/media/menu-items/brisket_burger_jpg_1772537657313.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000020-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Mushroom Burger', 'Portobello and avocado.', 19.50, '/api/v1/media/menu-items/mushroom_burger_jpg_1772537679240.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000020-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Falafel Burger', 'Chickpea patty, tahini.', 16.50, 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),

-- Mains
('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Ribeye Steak', 'Grain-fed 300g.', 45.00, 'https://images.unsplash.com/photo-1546964124-0cce43429215?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000030-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Grilled Salmon', 'Lemon butter and asparagus.', 34.00, '/api/v1/media/menu-items/salmon_main_jpg_1772537697260.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000030-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Lamb Shank', 'Slow-roasted with rosemary.', 38.50, '/api/v1/media/menu-items/lamb_shank_jpg_1772537730593.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000030-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Chicken Alfredo', 'Creamy sauce and pasta.', 28.00, 'https://images.unsplash.com/photo-1645112481338-3560e9bcad5d?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000030-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Fish and Chips', 'Beer battered with tartar.', 24.00, 'https://images.unsplash.com/photo-1524339102451-897f2560567a?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),

-- Drinks
('d1000040-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Passion Mojito', 'Fresh passion fruit and mint.', 12.00, '/api/v1/media/menu-items/passion_mojito_jpg_1772537754674.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000040-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Iced Macchiato', 'Espresso with caramel.', 6.50, '/api/v1/media/menu-items/iced_macchiato_jpg_1772537772518.png', 'PUBLISHED', NOW(), NOW(), 0),
('d1000040-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Espresso', 'Rich single shot.', 4.00, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0),
('d1000040-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Fresh Orange Juice', 'Cold pressed oranges.', 5.50, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', NOW(), NOW(), 0);

-- 6. Link Items to Modifier Groups
INSERT INTO menu_item_modifier_group (id, menu_item_id, modifier_group_id, display_order, created_at, updated_at, version)
VALUES 
('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 1, NOW(), NOW(), 0),
('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 2, NOW(), NOW(), 0),
('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 1, NOW(), NOW(), 0);

-- 7. Sections
INSERT INTO section (id, name, created_at, updated_at, version)
VALUES 
('f1000000-0000-0000-0000-000000000010', 'WINDOW', NOW(), NOW(), 0),
('f1000000-0000-0000-0000-000000000011', 'BAR', NOW(), NOW(), 0),
('f1000000-0000-0000-0000-000000000012', 'PATIO', NOW(), NOW(), 0);

-- 8. Tables
INSERT INTO table_shape (id, section_id, name, capacity, status, pos_x, pos_y, width, height, shape_type, assigned_staff_id, created_at, updated_at, version)
VALUES 
-- WINDOW SECTION (f1000000-0000-0000-0000-000000000010) - Sam Server (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14)
('f2000000-0000-0000-0010-000000000001', 'f1000000-0000-0000-0000-000000000010', 'W-1', 4, 'AVAILABLE', 40, 60, 80, 80, 'RECTANGLE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000002', 'f1000000-0000-0000-0000-000000000010', 'W-2', 4, 'OCCUPIED', 140, 60, 80, 80, 'RECTANGLE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000003', 'f1000000-0000-0000-0000-000000000010', 'W-3', 4, 'AVAILABLE', 240, 60, 80, 80, 'RECTANGLE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000004', 'f1000000-0000-0000-0000-000000000010', 'W-4', 4, 'ORDERED', 340, 60, 80, 80, 'RECTANGLE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000005', 'f1000000-0000-0000-0000-000000000010', 'W-5', 2, 'AVAILABLE', 40, 160, 60, 60, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000006', 'f1000000-0000-0000-0000-000000000010', 'W-6', 2, 'AVAILABLE', 120, 160, 60, 60, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000007', 'f1000000-0000-0000-0000-000000000010', 'W-7', 2, 'AVAILABLE', 200, 160, 60, 60, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
('f2000000-0000-0000-0010-000000000008', 'f1000000-0000-0000-0000-000000000010', 'W-8', 2, 'AVAILABLE', 280, 160, 60, 60, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), NOW(), 0),
-- BAR SECTION (f2000000-0000-0000-0011-000000000001, etc.)
('f2000000-0000-0000-0011-000000000001', 'f1000000-0000-0000-0000-000000000011', 'B-1', 1, 'OCCUPIED', 820, 60, 45, 45, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW(), 0),
('f2000000-0000-0000-0011-000000000002', 'f1000000-0000-0000-0000-000000000011', 'B-2', 1, 'AVAILABLE', 820, 120, 45, 45, 'ROUND', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', NOW(), NOW(), 0),
-- PATIO SECTION
('f2000000-0000-0000-0012-000000000001', 'f1000000-0000-0000-0000-000000000012', 'P-1', 6, 'AVAILABLE', 40, 360, 140, 80, 'RECTANGLE', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', NOW(), NOW(), 0);

-- 9. Loyalty Tiers
INSERT INTO loyalty_tier (id, name, spend_threshold, point_multiplier, created_at, updated_at, version) 
VALUES 
('a2000000-0000-0000-0000-000000000001', 'BRONZE', 0.00, 1.00, NOW(), NOW(), 0),
('a2000000-0000-0000-0000-000000000002', 'SILVER', 1000.00, 1.25, NOW(), NOW(), 0);

-- 10. KDS Stations (canonical UUIDs used by V3 migration and Flutter app)
INSERT INTO kds_station (id, name, station_type, online, created_at, updated_at, version)
VALUES 
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11', 'EXPO Aggregator', 'EXPO',  true, NOW(), NOW(), 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'Grill Station',   'GRILL', true, NOW(), NOW(), 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'Fry Station',     'FRY',   true, NOW(), NOW(), 0),
('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44', 'Bar Station',     'BAR',   true, NOW(), NOW(), 0);

--------------------------------------------------------------------------------
-- ORDER HISTORY SEED DATA
--------------------------------------------------------------------------------

-- Order 1: Ribeye Steak Dinner (W-1)
INSERT INTO order_ticket (id, status, order_type, table_id, server_id, cover_count, subtotal, tax_amount, tip_amount, total_amount, created_at, updated_at, paid_at, version)
VALUES ('e1000000-0000-0000-0000-000000001001', 'PAID', 'DINE_IN', 'f2000000-0000-0000-0010-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, 57.00, 2.85, 10.00, 69.85, NOW() - INTERVAL '3 days', NOW(), NOW() - INTERVAL '3 days' + INTERVAL '1 hour', 0);

INSERT INTO order_item (id, ticket_id, menu_item_id, quantity, unit_price, modifier_upcharge_total, status, course_number, created_at, updated_at, version)
VALUES ('e1000000-0000-0000-0000-000000002001', 'e1000000-0000-0000-0000-000000001001', 'd1000000-0000-0000-0000-000000000005', 1, 45.00, 0.00, 'DELIVERED', 2, NOW() - INTERVAL '3 days', NOW(), 0),
       ('e1000000-0000-0000-0000-000000002002', 'e1000000-0000-0000-0000-000000001001', 'd1000000-0000-0000-0000-000000000001', 1, 12.00, 0.00, 'DELIVERED', 1, NOW() - INTERVAL '3 days', NOW(), 0);

INSERT INTO order_audit_log (id, order_id, event_type, details, performed_by, created_at)
VALUES (gen_random_uuid(), 'e1000000-0000-0000-0000-000000001001', 'ORDER_CREATED', 'Order started for DINE_IN', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW() - INTERVAL '3 days'),
       (gen_random_uuid(), 'e1000000-0000-0000-0000-000000001001', 'KITCHEN_SENT', 'Items sent to kitchen', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),
       (gen_random_uuid(), 'e1000000-0000-0000-0000-000000001001', 'ORDER_PAID', 'Order finalized and paid', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW() - INTERVAL '3 days' + INTERVAL '1 hour');

-- Order 2-12: Bulk seeding using a loop
INSERT INTO order_ticket (id, status, order_type, table_id, server_id, cover_count, subtotal, tax_amount, tip_amount, total_amount, created_at, updated_at, paid_at, version)
SELECT 
    gen_random_uuid(), 
    'PAID', 
    'DINE_IN', 
    'f2000000-0000-0000-0010-000000000002', 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 
    2, 35.00, 1.75, 5.00, 41.75, 
    NOW() - (i || ' hours')::interval, 
    NOW(),
    NOW() - (i || ' hours')::interval + INTERVAL '45 minutes', 
    0
FROM generate_series(2, 12) i;

-- Add items for generated orders
INSERT INTO order_item (id, ticket_id, menu_item_id, quantity, unit_price, modifier_upcharge_total, status, course_number, created_at, updated_at, version)
SELECT 
    gen_random_uuid(), 
    t.id, 
    'd1000000-0000-0000-0000-000000000003', 
    2, 17.50, 0.00, 'DELIVERED', 1, 
    t.created_at, 
    NOW(),
    0
FROM order_ticket t WHERE t.subtotal = 35.00 AND t.status = 'PAID' AND t.id != 'e1000000-0000-0000-0000-000000001001';

-- Add audit logs for generated orders
INSERT INTO order_audit_log (id, order_id, event_type, details, performed_by, created_at)
SELECT gen_random_uuid(), t.id, 'ORDER_CREATED', 'Automated History Seed', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', t.created_at
FROM order_ticket t WHERE t.subtotal = 35.00 AND t.status = 'PAID' AND t.id != 'e1000000-0000-0000-0000-000000001001';

INSERT INTO order_audit_log (id, order_id, event_type, details, performed_by, created_at)
SELECT gen_random_uuid(), t.id, 'ORDER_PAID', 'Automated Finalize Seed', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', t.paid_at
FROM order_ticket t WHERE t.subtotal = 35.00 AND t.status = 'PAID' AND t.id != 'e1000000-0000-0000-0000-000000001001';
