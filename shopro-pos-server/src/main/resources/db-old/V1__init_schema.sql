-- V1__init_schema.sql
BEGIN;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE ai_insight (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    insight_type character varying(60) NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(2000) NOT NULL,
    action_suggestion character varying(500),
    confidence_score numeric(19,4) NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    valid_until timestamp with time zone,
    metadata jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE audit_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    actor_id uuid,
    action character varying(80) NOT NULL,
    entity_type character varying(60) NOT NULL,
    before_state jsonb,
    after_state jsonb,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE automated_campaign (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(150) NOT NULL,
    trigger_type character varying(80) NOT NULL,
    status character varying(30) NOT NULL DEFAULT 'DRAFT',
    channel character varying(50),
    message_template text,
    valid_from date,
    valid_until date,
    PRIMARY KEY (id)
);

CREATE TABLE batch_record (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    sub_recipe_id uuid NOT NULL,
    produced_qty numeric(19,4) NOT NULL,
    remaining_qty numeric(19,4) NOT NULL,
    status character varying(50) NOT NULL,
    produced_at timestamp with time zone NOT NULL,
    expiry_at timestamp with time zone,
    notes character varying(500),
    produced_by_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE bonus_point_event (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(100) NOT NULL,
    multiplier numeric(19,4) NOT NULL,
    scope character varying(50) NOT NULL,
    scope_reference_id uuid,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE campaign_message_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    marketing_campaign_id uuid NOT NULL,
    customer_profile_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    sent_at timestamp with time zone,
    opened_at timestamp with time zone,
    converted_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    type character varying(50) NOT NULL,
    name character varying NOT NULL,
    config jsonb NOT NULL,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE countries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    iso_code character varying(10) NOT NULL UNIQUE,
    name character varying(100) NOT NULL,
    currency_code character varying(3) NOT NULL,
    currency_symbol character varying(5) NOT NULL,
    tax_model character varying(30) NOT NULL,
    tax_included boolean NOT NULL,
    notes character varying,
    PRIMARY KEY (id)
);

CREATE TABLE customer_dietary_tag (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    customer_profile_id uuid NOT NULL,
    tag_type character varying(50) NOT NULL,
    custom_description character varying(200),
    PRIMARY KEY (id)
);

CREATE TABLE customer_occasion (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    customer_profile_id uuid NOT NULL,
    occasion_type character varying(50) NOT NULL,
    occasion_month integer NOT NULL,
    occasion_day integer NOT NULL,
    occasion_year integer,
    PRIMARY KEY (id)
);

CREATE TABLE customer_profile (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    phone_number character varying(20) NOT NULL UNIQUE,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(100),
    loyalty_tier_id uuid,
    lifetime_spend numeric(19,4) NOT NULL,
    available_points integer NOT NULL,
    preference_notes character varying,
    visit_count integer NOT NULL,
    sms_opt_in boolean NOT NULL,
    email_opt_in boolean NOT NULL,
    last_visit_at timestamp with time zone,
    is_churned boolean NOT NULL,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE customer_segment (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(120) NOT NULL,
    description text,
    segment_type character varying(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE daily_sales_snapshot (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    snapshot_date character varying NOT NULL,
    gross_sales numeric(19,4) NOT NULL,
    net_sales numeric(19,4) NOT NULL,
    total_discounts numeric(19,4) NOT NULL,
    total_voids numeric(19,4) NOT NULL,
    total_tax numeric(19,4) NOT NULL,
    total_tips numeric(19,4) NOT NULL,
    cash_total numeric(19,4) NOT NULL,
    card_total numeric(19,4) NOT NULL,
    apple_pay_total numeric(19,4) NOT NULL,
    google_pay_total numeric(19,4) NOT NULL,
    gift_card_total numeric(19,4) NOT NULL,
    cover_count integer NOT NULL,
    ticket_count integer NOT NULL,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE demand_forecast (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ingredient_id uuid NOT NULL,
    forecast_date date NOT NULL,
    projected_quantity numeric(12,4) NOT NULL,
    confidence_score numeric(5,2),
    model_version character varying(20),
    PRIMARY KEY (id)
);

CREATE TABLE delivery_dispatch (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    order_ticket_id uuid NOT NULL,
    delivery_status character varying(50) NOT NULL,
    dispatch_time timestamp with time zone,
    driver_id uuid,
    aggregator_reference_id character varying(100),
    PRIMARY KEY (id)
);

CREATE TABLE eod_record (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    close_date character varying NOT NULL,
    closed_by_id uuid NOT NULL,
    opening_float numeric(19,4) NOT NULL,
    closing_float numeric(19,4) NOT NULL,
    counted_cash numeric(19,4) NOT NULL,
    cash_variance numeric(19,4) NOT NULL,
    z_report_path character varying(1024),
    gross_sales numeric(19,4) NOT NULL,
    net_sales numeric(19,4) NOT NULL,
    total_tax_collected numeric(19,4) NOT NULL,
    total_tips numeric(19,4) NOT NULL,
    total_voids numeric(19,4) NOT NULL,
    total_discounts numeric(19,4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE goods_receipt_note (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    purchase_order_id uuid NOT NULL,
    received_at timestamp with time zone NOT NULL,
    received_by_id uuid NOT NULL,
    delivery_note_reference character varying(100),
    notes character varying(500),
    PRIMARY KEY (id)
);

CREATE TABLE goods_receipt_note_line (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    goods_receipt_note_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    received_qty numeric(19,4) NOT NULL,
    damaged_qty numeric(19,4),
    PRIMARY KEY (id)
);

CREATE TABLE guest_cart_item (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    session_id uuid NOT NULL,
    device_fingerprint character varying(128) NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    custom_note character varying(100),
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE guest_feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    order_ticket_id uuid,
    customer_profile_id uuid,
    overall_rating integer NOT NULL,
    food_rating integer,
    service_rating integer,
    ambience_rating integer,
    comment text,
    is_flagged boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE in_app_notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    recipient_id uuid NOT NULL,
    type_code character varying(100) NOT NULL,
    correlation_id character varying(255),
    title character varying NOT NULL,
    body text NOT NULL,
    data jsonb,
    is_read boolean NOT NULL DEFAULT false,
    is_dismissed boolean NOT NULL DEFAULT false,
    expires_at timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE inventory_location (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(100) NOT NULL,
    description character varying(255),
    location_type character varying(50),
    active boolean NOT NULL DEFAULT true,
    PRIMARY KEY (id)
);

CREATE TABLE inventory_transaction (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ingredient_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    quantity_delta numeric(19,4) NOT NULL,
    unit_cost_at_time numeric(19,4),
    reason character varying(256),
    reference_id uuid,
    metadata jsonb,
    created_by_id uuid,
    transacted_at timestamp with time zone NOT NULL,
    PRIMARY KEY (id, transacted_at)
) PARTITION BY RANGE (transacted_at);

CREATE TABLE item_tax_tags (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    menu_item_id uuid NOT NULL UNIQUE,
    temperature character varying(10),
    item_category character varying(50) NOT NULL,
    is_basic_staple boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_routing_rule (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    station_id uuid NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_station (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(60) NOT NULL,
    station_type character varying(50) NOT NULL,
    online boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_ticket (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    order_ticket_id uuid NOT NULL,
    station_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    fired_at timestamp with time zone NOT NULL,
    bumped_at timestamp with time zone,
    cooking_at timestamp with time zone,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE kds_ticket_item (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    kds_ticket_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    priority integer NOT NULL,
    ready_at timestamp with time zone,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE loyalty_config (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    points_per_currency_unit integer NOT NULL DEFAULT 1,
    expiry_months integer NOT NULL DEFAULT 12,
    enabled boolean NOT NULL DEFAULT true,
    PRIMARY KEY (id)
);

-- Kept corrected definition (MISSING TABLES block)
CREATE TABLE loyalty_tier (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(60) NOT NULL,
    min_points integer NOT NULL,
    points_multiplier numeric(4,2) NOT NULL DEFAULT 1.00,
    discount_pct numeric(5,4) NOT NULL DEFAULT 0.00,
    free_item_eligible boolean NOT NULL DEFAULT false,
    PRIMARY KEY (id)
);

CREATE TABLE loyalty_transaction (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    customer_profile_id uuid NOT NULL,
    order_ticket_id uuid,
    points integer NOT NULL,
    description character varying(200),
    transaction_type character varying(50) NOT NULL,
    bonus_event_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE marketing_campaign (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(100) NOT NULL,
    message_template character varying NOT NULL,
    target_filter_description character varying(200),
    promo_code character varying(50),
    scheduled_for timestamp with time zone,
    is_executed boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_category (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(40) NOT NULL,
    display_order integer NOT NULL,
    default_course integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(60) NOT NULL,
    description character varying(500),
    base_price numeric(19,4) NOT NULL,
    photo_url character varying(1024),
    status character varying(50) NOT NULL,
    category_id uuid NOT NULL,
    preparation_time_minutes integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item_modifier_group (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    menu_item_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    display_order integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item_rating (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    menu_item_id uuid NOT NULL,
    order_id character varying(50),
    rating integer NOT NULL,
    comment character varying,
    PRIMARY KEY (id)
);

CREATE TABLE modifier_group (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(80) NOT NULL,
    required boolean NOT NULL,
    min_selections integer NOT NULL,
    max_selections integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE modifier_option (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    modifier_group_id uuid NOT NULL,
    label character varying(80) NOT NULL,
    upcharge_amount numeric(19,4) NOT NULL,
    display_order integer NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notification_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    dispatch_id uuid NOT NULL,
    notification_type_id uuid,
    channel_id uuid,
    recipient_identifier character varying,
    status character varying(50) NOT NULL,
    payload jsonb,
    error_message character varying,
    attempt_count integer NOT NULL,
    sent_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE notification_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    subject character varying(500),
    body_template character varying NOT NULL,
    meta jsonb,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notification_type_channels (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    recipient_group_id uuid,
    fallback_channel_id uuid,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notification_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    code character varying(100) NOT NULL UNIQUE,
    name character varying NOT NULL,
    description character varying,
    severity character varying(50) NOT NULL,
    is_mutable boolean NOT NULL,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE order_audit_log (
    id uuid,
    order_id uuid NOT NULL,
    event_type character varying NOT NULL,
    details character varying(1000),
    performed_by uuid,
    created_at timestamp with time zone NOT NULL,
    signature_hash character varying,
    device_jkt character varying,
    PRIMARY KEY (id)
);

CREATE TABLE order_item (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ticket_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(19,4) NOT NULL,
    modifier_upcharge_total numeric(19,4) NOT NULL,
    status character varying(50) NOT NULL,
    custom_note character varying(100),
    course_number integer NOT NULL,
    has_allergy_flag boolean NOT NULL,
    is_subtraction boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE order_item_modifier (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    order_item_id uuid NOT NULL,
    modifier_option_id uuid NOT NULL,
    upcharge_amount numeric(19,4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE order_ticket (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    table_id uuid,
    server_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    order_type character varying(50) NOT NULL,
    parent_ticket_id uuid,
    customer_profile_id uuid,
    delivery_address character varying(500),
    vehicle_model character varying(50),
    vehicle_color character varying(30),
    vehicle_plate character varying(20),
    cover_count integer NOT NULL,
    subtotal numeric(19,4) NOT NULL,
    tax_amount numeric(19,4) NOT NULL,
    tip_amount numeric(19,4) NOT NULL,
    discount_amount numeric(19,4) NOT NULL,
    total_amount numeric(19,4) NOT NULL,
    paid_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE payment (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ticket_id uuid NOT NULL,
    method character varying(50) NOT NULL,
    amount numeric(19,4) NOT NULL,
    status character varying(50) NOT NULL,
    processor_reference character varying(128),
    decline_reason character varying(256),
    PRIMARY KEY (id)
);

CREATE TABLE physical_count (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    count_date character varying NOT NULL,
    status character varying(50) NOT NULL,
    counted_by_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE physical_count_line (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    physical_count_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    expected_qty numeric(19,4) NOT NULL,
    counted_qty numeric(19,4) NOT NULL,
    variance numeric(19,4),
    PRIMARY KEY (id)
);

CREATE TABLE po_status_history (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    po_id uuid NOT NULL,
    from_status character varying(50),
    to_status character varying(50) NOT NULL,
    actor_id uuid NOT NULL,
    reason character varying,
    PRIMARY KEY (id)
);

CREATE TABLE pos_terminal (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    device_name character varying(80) NOT NULL,
    dark_mode boolean NOT NULL,
    active_staff_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE promo_code (
    id uuid,
    code character varying(50) NOT NULL UNIQUE,
    discount_type character varying(50) NOT NULL,
    discount_value numeric(19,4) NOT NULL,
    current_uses integer NOT NULL,
    is_active boolean NOT NULL,
    segment_id uuid,
    created_at character varying,
    PRIMARY KEY (id)
);

CREATE TABLE purchase_order (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    supplier_id uuid NOT NULL,
    generated_by_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    order_type character varying(50) NOT NULL,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    total_value numeric(12,4) DEFAULT 0 NOT NULL,
    expected_delivery_date date,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes character varying,
    acknowledged_at timestamp with time zone,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE purchase_order_line (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    purchase_order_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ordered_qty numeric(19,4) NOT NULL,
    received_qty numeric(19,4),
    unit_cost numeric(19,4) NOT NULL,
    invoice_unit_price numeric(19,4),
    PRIMARY KEY (id)
);

CREATE TABLE raw_ingredient (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(120) NOT NULL,
    unit_of_measure character varying(20) NOT NULL,
    cost_per_unit numeric(19,4) NOT NULL,
    yield_pct numeric(19,4) NOT NULL,
    effective_cost_per_unit numeric(19,4),
    current_stock numeric(19,4) NOT NULL,
    par_level numeric(19,4) NOT NULL,
    reorder_point numeric(19,4) NOT NULL,
    safety_level numeric(19,4) NOT NULL,
    critical_level numeric(19,4) NOT NULL,
    max_stock_level numeric(19,4) NOT NULL,
    auto_replenish boolean NOT NULL,
    restocking_mode character varying(50) NOT NULL,
    shelf_life_days integer NOT NULL,
    storage_type character varying(50) NOT NULL,
    daily_restock_enrolled boolean NOT NULL,
    category character varying(50),
    bid_supplier_pool jsonb,
    supplier_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE recipe (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    menu_item_id uuid,
    sub_recipe_id uuid,
    recipe_version integer NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    created_by_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE recipe_ingredient (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    recipe_id uuid NOT NULL,
    ingredient_id uuid,
    sub_recipe_id uuid,
    quantity numeric(19,4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE recipient_groups (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying NOT NULL,
    description character varying,
    role_code character varying(100),
    PRIMARY KEY (id)
);

CREATE TABLE recipients (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    channel_id uuid NOT NULL,
    user_id uuid,
    name character varying,
    address character varying(500) NOT NULL,
    meta jsonb,
    is_active boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE reservation (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    customer_id uuid,
    table_id uuid NOT NULL,
    reservation_time timestamp with time zone NOT NULL,
    customer_name character varying NOT NULL,
    phone_number character varying,
    party_size integer NOT NULL,
    notes character varying,
    cancellation_reason character varying,
    created_by_id uuid,
    handled_by_id uuid,
    status character varying(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE rfq (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ingredient_id uuid NOT NULL,
    required_qty numeric(19,4) NOT NULL,
    status character varying(50) NOT NULL,
    bid_deadline timestamp with time zone NOT NULL,
    desired_delivery_date date,
    PRIMARY KEY (id)
);

CREATE TABLE rfq_status_history (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    rfq_id uuid NOT NULL,
    from_status character varying(50),
    to_status character varying(50) NOT NULL,
    actor_id uuid NOT NULL,
    reason character varying,
    PRIMARY KEY (id)
);

CREATE TABLE section (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(80) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE segment_rule (
    id uuid,
    segment_id uuid NOT NULL,
    field character varying(50) NOT NULL,
    operator character varying(50) NOT NULL,
    rule_value character varying NOT NULL,
    created_at character varying,
    PRIMARY KEY (id)
);

CREATE TABLE staff_device_bindings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    staff_id uuid NOT NULL,
    public_key_thumbprint character varying(512) NOT NULL,
    device_name character varying,
    last_active_at timestamp with time zone,
    revoked boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE staff_member (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    full_name character varying(120) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    role_id uuid,
    active boolean NOT NULL,
    last_login_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE staff_permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying NOT NULL,
    description character varying,
    category character varying(50) NOT NULL,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE staff_roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying NOT NULL,
    description character varying,
    parent_role_id uuid,
    UNIQUE (name),
    PRIMARY KEY (id)
);

CREATE TABLE sub_recipe (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(100) NOT NULL,
    yield_quantity numeric(19,4) NOT NULL,
    unit_of_measure character varying(30) NOT NULL,
    cost_per_unit numeric(19,4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE supplier (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    company_name character varying(120) NOT NULL,
    contact_name character varying(100),
    contact_email character varying(254),
    contact_phone character varying(30),
    lead_time_days integer NOT NULL,
    vendor_rating numeric(19,4) NOT NULL,
    lead_time_variance numeric(19,4) NOT NULL,
    reliability_score numeric(19,4) NOT NULL,
    min_order_value numeric(19,4) NOT NULL,
    bid_eligible boolean NOT NULL,
    payment_terms character varying(100),
    categories jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE supplier_ingredient_pricing (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    supplier_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    unit_price numeric(19,4) NOT NULL,
    vendor_sku character varying(50),
    last_updated_at timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE supplier_policy (
    supplier_id uuid,
    auto_acknowledge boolean NOT NULL,
    counter_offer_allowed boolean NOT NULL,
    payment_terms character varying(100),
    qty_tolerance numeric(19,4),
    price_tolerance numeric(19,4),
    PRIMARY KEY (supplier_id)
);

CREATE TABLE supplier_user (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    supplier_id uuid NOT NULL,
    email character varying NOT NULL UNIQUE,
    phone_number character varying(30),
    password_hash character varying NOT NULL,
    full_name character varying(120) NOT NULL,
    role character varying(50) NOT NULL,
    active boolean NOT NULL,
    last_login_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE table_shape (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    name character varying(20) NOT NULL,
    capacity integer NOT NULL,
    section_id uuid NOT NULL,
    status character varying(50) NOT NULL,
    pos_x integer NOT NULL,
    pos_y integer NOT NULL,
    width integer NOT NULL,
    height integer NOT NULL,
    shape_type character varying(20) NOT NULL,
    nfc_tag_id character varying(64) UNIQUE,
    assigned_staff_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE tableside_session (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    table_id uuid NOT NULL,
    qr_token uuid NOT NULL,
    status character varying(50) NOT NULL,
    expires_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE tax_audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    venue_id uuid NOT NULL,
    tax_rule_id uuid,
    action character varying(30) NOT NULL,
    old_rate numeric(19,4),
    new_rate numeric(19,4),
    changed_by uuid NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    change_reason character varying,
    ip_address character varying,
    PRIMARY KEY (id)
);

CREATE TABLE tax_calculation_results (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ticket_id uuid NOT NULL,
    ticket_item_id uuid NOT NULL,
    tax_rule_id uuid NOT NULL,
    rule_code character varying(50) NOT NULL,
    base_amount numeric(19,4) NOT NULL,
    tax_rate numeric(19,4) NOT NULL,
    tax_amount numeric(19,4) NOT NULL,
    order_type character varying(20) NOT NULL,
    item_temperature character varying(10),
    calculated_at timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tax_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    country_id uuid NOT NULL,
    rule_code character varying(50) NOT NULL UNIQUE,
    rule_name character varying(150) NOT NULL,
    tax_type character varying(50) NOT NULL,
    default_rate numeric(19,4) NOT NULL,
    min_allowed_rate numeric(19,4) NOT NULL,
    max_allowed_rate numeric(19,4) NOT NULL,
    applies_to_dine_in boolean NOT NULL,
    applies_to_takeaway boolean NOT NULL,
    applies_to_hot boolean,
    applies_to_cold boolean,
    applies_to_alcohol boolean NOT NULL,
    item_category character varying(50),
    price_threshold_min numeric(19,4),
    price_threshold_max numeric(19,4),
    is_cascading boolean NOT NULL,
    cascade_on_rule_id uuid,
    is_active boolean NOT NULL,
    sort_order integer NOT NULL,
    description character varying,
    PRIMARY KEY (id)
);

CREATE TABLE user_notification_preferences (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    user_id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    is_muted boolean NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_bid (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    rfq_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    unit_price numeric(19,4) NOT NULL,
    quantity_available numeric(19,4) NOT NULL,
    payment_terms character varying(100),
    notes character varying(500),
    status character varying(50) NOT NULL,
    submitted_by_id uuid,
    delivery_date date,
    awarded_at timestamp with time zone,
    generated_po_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_invoice (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    purchase_order_id uuid NOT NULL,
    invoice_number character varying(100) NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    total_amount numeric(19,4) NOT NULL,
    tax_amount numeric(19,4),
    PRIMARY KEY (id)
);

CREATE TABLE vendor_invoice_line (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    vendor_invoice_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    invoiced_qty numeric(19,4) NOT NULL,
    unit_price numeric(19,4) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_price_proposal (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    supplier_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    proposed_price numeric(19,4) NOT NULL,
    proposed_quantity numeric(19,4),
    notes character varying,
    status character varying(50) NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    submitted_by uuid,
    generated_po_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE venue_country_assignments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    venue_id uuid NOT NULL UNIQUE,
    country_id uuid NOT NULL,
    is_active boolean NOT NULL,
    assigned_by uuid NOT NULL,
    assigned_at timestamp with time zone NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE venue_tax_configs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    venue_id uuid NOT NULL,
    tax_rule_id uuid NOT NULL,
    override_rate numeric(19,4) NOT NULL,
    override_reason character varying,
    is_active boolean NOT NULL,
    created_by uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE waitlist_entry (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    customer_name character varying NOT NULL,
    phone_number character varying,
    party_size integer NOT NULL,
    estimated_wait_minutes integer,
    notified_at timestamp with time zone,
    seated_at_table_id uuid,
    handled_by_id uuid,
    status character varying(50) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE recipient_group_members (
    group_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    PRIMARY KEY (group_id, recipient_id)
);

-- ============================================================
-- ELEMENT COLLECTIONS
-- ============================================================

CREATE TABLE raw_ingredient_allergen (
    ingredient_id uuid NOT NULL,
    allergen character varying(30) NOT NULL
);
ALTER TABLE raw_ingredient_allergen
    ADD CONSTRAINT fk_allergen_ingredient FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id) ON DELETE CASCADE;

-- ============================================================
-- INVENTORY BATCH
-- ============================================================

CREATE TABLE inventory_batch (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    version bigint NOT NULL DEFAULT 0,
    ingredient_id uuid NOT NULL,
    supplier_id uuid,
    batch_number character varying(100),
    quantity numeric(12,4) NOT NULL,
    unit_cost numeric(10,4) NOT NULL,
    received_at timestamp with time zone NOT NULL,
    expiry_date date,
    location_id uuid,
    notes character varying(500),
    PRIMARY KEY (id)
);
ALTER TABLE inventory_batch ADD CONSTRAINT fk_inventory_batch_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE inventory_batch ADD CONSTRAINT fk_inventory_batch_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);

-- ============================================================
-- PARTITIONS
-- ============================================================

CREATE TABLE inventory_transaction_y2024 PARTITION OF inventory_transaction FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE inventory_transaction_y2025 PARTITION OF inventory_transaction FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE purchase_order_p0 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE purchase_order_p1 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE purchase_order_p2 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE purchase_order_p3 PARTITION OF purchase_order FOR VALUES WITH (MODULUS 4, REMAINDER 3);
CREATE TABLE kds_ticket_p0 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE kds_ticket_p1 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE kds_ticket_p2 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE kds_ticket_p3 PARTITION OF kds_ticket FOR VALUES WITH (MODULUS 4, REMAINDER 3);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE batch_record ADD CONSTRAINT fk_batch_record_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE campaign_message_log ADD CONSTRAINT fk_campaign_message_log_marketing_campaign_id FOREIGN KEY (marketing_campaign_id) REFERENCES marketing_campaign(id);
ALTER TABLE campaign_message_log ADD CONSTRAINT fk_campaign_message_log_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE customer_dietary_tag ADD CONSTRAINT fk_customer_dietary_tag_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE customer_occasion ADD CONSTRAINT fk_customer_occasion_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE customer_profile ADD CONSTRAINT fk_customer_profile_loyalty_tier_id FOREIGN KEY (loyalty_tier_id) REFERENCES loyalty_tier(id);
ALTER TABLE delivery_dispatch ADD CONSTRAINT fk_delivery_dispatch_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE demand_forecast ADD CONSTRAINT fk_demand_forecast_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE goods_receipt_note ADD CONSTRAINT fk_goods_receipt_note_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE goods_receipt_note_line ADD CONSTRAINT fk_goods_receipt_note_line_goods_receipt_note_id FOREIGN KEY (goods_receipt_note_id) REFERENCES goods_receipt_note(id);
ALTER TABLE guest_cart_item ADD CONSTRAINT fk_guest_cart_item_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE kds_ticket ADD CONSTRAINT fk_kds_ticket_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE kds_ticket_item ADD CONSTRAINT fk_kds_ticket_item_kds_ticket_id FOREIGN KEY (kds_ticket_id) REFERENCES kds_ticket(id);
ALTER TABLE kds_ticket_item ADD CONSTRAINT fk_kds_ticket_item_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_item(id);
ALTER TABLE loyalty_transaction ADD CONSTRAINT fk_loyalty_transaction_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE loyalty_transaction ADD CONSTRAINT fk_loyalty_transaction_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE menu_item_modifier_group ADD CONSTRAINT fk_menu_item_modifier_group_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE menu_item_modifier_group ADD CONSTRAINT fk_menu_item_modifier_group_modifier_group_id FOREIGN KEY (modifier_group_id) REFERENCES modifier_group(id);
ALTER TABLE menu_item_rating ADD CONSTRAINT fk_menu_item_rating_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE modifier_option ADD CONSTRAINT fk_modifier_option_modifier_group_id FOREIGN KEY (modifier_group_id) REFERENCES modifier_group(id);
ALTER TABLE order_item ADD CONSTRAINT fk_order_item_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE order_item_modifier ADD CONSTRAINT fk_order_item_modifier_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_item(id);
ALTER TABLE order_item_modifier ADD CONSTRAINT fk_order_item_modifier_modifier_option_id FOREIGN KEY (modifier_option_id) REFERENCES modifier_option(id);
ALTER TABLE order_ticket ADD CONSTRAINT fk_order_ticket_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE physical_count_line ADD CONSTRAINT fk_physical_count_line_physical_count_id FOREIGN KEY (physical_count_id) REFERENCES physical_count(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE purchase_order_line ADD CONSTRAINT fk_purchase_order_line_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE raw_ingredient ADD CONSTRAINT fk_raw_ingredient_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE recipe ADD CONSTRAINT fk_recipe_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE recipe ADD CONSTRAINT fk_recipe_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE recipe_ingredient ADD CONSTRAINT fk_recipe_ingredient_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe(id);
ALTER TABLE recipe_ingredient ADD CONSTRAINT fk_recipe_ingredient_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE rfq_status_history ADD CONSTRAINT fk_rfq_status_history_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id);
ALTER TABLE supplier_ingredient_pricing ADD CONSTRAINT fk_supplier_ingredient_pricing_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE supplier_user ADD CONSTRAINT fk_supplier_user_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE table_shape ADD CONSTRAINT fk_table_shape_section_id FOREIGN KEY (section_id) REFERENCES section(id);
ALTER TABLE vendor_bid ADD CONSTRAINT fk_vendor_bid_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id);
ALTER TABLE vendor_bid ADD CONSTRAINT fk_vendor_bid_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE vendor_invoice ADD CONSTRAINT fk_vendor_invoice_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE vendor_invoice_line ADD CONSTRAINT fk_vendor_invoice_line_vendor_invoice_id FOREIGN KEY (vendor_invoice_id) REFERENCES vendor_invoice(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);

COMMIT;