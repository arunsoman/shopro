-- V1__init_schema.sql (Auto-reconstructed from Hibernate metadata)
BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE ai_insight (
    confidence_score numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    valid_until timestamp with time zone,
    version bigint NOT NULL,
    id uuid NOT NULL,
    insight_type character varying NOT NULL,
    title character varying NOT NULL,
    action_suggestion character varying,
    description character varying NOT NULL,
    metadata jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE audit_log (
    created_at timestamp with time zone NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    actor_id uuid,
    entity_id uuid NOT NULL,
    id uuid NOT NULL,
    entity_type character varying NOT NULL,
    action character varying NOT NULL,
    after_state jsonb,
    before_state jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE automated_campaign (
    delay_hours integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid NOT NULL,
    template_id uuid,
    trigger_event character varying NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE batch_record (
    produced_qty numeric NOT NULL,
    remaining_qty numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expiry_at timestamp with time zone,
    produced_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    produced_by_id uuid NOT NULL,
    sub_recipe_id uuid NOT NULL,
    status character varying NOT NULL,
    notes character varying,
    PRIMARY KEY (id)
);

CREATE TABLE bonus_point_event (
    is_active boolean NOT NULL,
    multiplier numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    scope_reference_id uuid,
    scope character varying NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE campaign_message_log (
    converted_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    opened_at timestamp with time zone,
    sent_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    customer_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    marketing_campaign_id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE channels (
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    type character varying NOT NULL,
    name character varying NOT NULL,
    config jsonb NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE countries (
    currency_code character varying NOT NULL,
    tax_included boolean NOT NULL,
    currency_symbol character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    iso_code character varying NOT NULL,
    id uuid NOT NULL,
    tax_model character varying NOT NULL,
    name character varying NOT NULL,
    notes text,
    PRIMARY KEY (id)
);

CREATE TABLE customer_dietary_tag (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    customer_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    tag_type character varying NOT NULL,
    custom_description character varying,
    PRIMARY KEY (id)
);

CREATE TABLE customer_occasion (
    occasion_day integer NOT NULL,
    occasion_month integer NOT NULL,
    occasion_year integer,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    customer_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    occasion_type character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE customer_profile (
    available_points integer NOT NULL,
    email_opt_in boolean NOT NULL,
    is_churned boolean NOT NULL,
    lifetime_spend numeric NOT NULL,
    sms_opt_in boolean NOT NULL,
    visit_count integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_visit_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    loyalty_tier_id uuid,
    phone_number character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    email character varying,
    preference_notes text,
    PRIMARY KEY (id)
);

CREATE TABLE customer_segment (
    is_active boolean NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    id uuid NOT NULL,
    name character varying NOT NULL,
    description character varying,
    PRIMARY KEY (id)
);

CREATE TABLE daily_sales_snapshot (
    apple_pay_total numeric NOT NULL,
    card_total numeric NOT NULL,
    cash_total numeric NOT NULL,
    cover_count integer NOT NULL,
    gift_card_total numeric NOT NULL,
    google_pay_total numeric NOT NULL,
    gross_sales numeric NOT NULL,
    net_sales numeric NOT NULL,
    snapshot_date date NOT NULL,
    ticket_count integer NOT NULL,
    total_discounts numeric NOT NULL,
    total_tax numeric NOT NULL,
    total_tips numeric NOT NULL,
    total_voids numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE delivery_dispatch (
    created_at timestamp with time zone NOT NULL,
    dispatch_time timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    driver_id uuid,
    id uuid NOT NULL,
    order_ticket_id uuid NOT NULL,
    delivery_status character varying NOT NULL,
    aggregator_reference_id character varying,
    PRIMARY KEY (id)
);

CREATE TABLE demand_forecast (
    confidence_score numeric,
    forecast_date date NOT NULL,
    projected_quantity numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    model_version character varying,
    PRIMARY KEY (id)
);

CREATE TABLE eod_record (
    cash_variance numeric NOT NULL,
    close_date date NOT NULL,
    closing_float numeric NOT NULL,
    counted_cash numeric NOT NULL,
    gross_sales numeric NOT NULL,
    net_sales numeric NOT NULL,
    opening_float numeric NOT NULL,
    total_discounts numeric NOT NULL,
    total_tax_collected numeric NOT NULL,
    total_tips numeric NOT NULL,
    total_voids numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    closed_by_id uuid NOT NULL,
    id uuid NOT NULL,
    z_report_path character varying,
    PRIMARY KEY (id)
);

CREATE TABLE goods_receipt_note (
    created_at timestamp with time zone NOT NULL,
    received_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    received_by_id uuid NOT NULL,
    delivery_note_reference character varying,
    notes character varying,
    PRIMARY KEY (id)
);

CREATE TABLE goods_receipt_note_line (
    damaged_qty numeric,
    received_qty numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    goods_receipt_note_id uuid NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE guest_cart_item (
    quantity integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    session_id uuid NOT NULL,
    custom_note character varying,
    device_fingerprint character varying NOT NULL,
    modifiers jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE guest_feedback (
    rating integer NOT NULL,
    created_at timestamp with time zone,
    customer_id uuid NOT NULL,
    id uuid NOT NULL,
    sentiment character varying,
    source character varying NOT NULL,
    order_id character varying,
    comments text,
    PRIMARY KEY (id)
);

CREATE TABLE in_app_notifications (
    is_dismissed boolean NOT NULL,
    is_read boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    type_code character varying NOT NULL,
    body text NOT NULL,
    correlation_id character varying,
    title character varying NOT NULL,
    data jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE inventory_batch (
    cost_at_receipt numeric NOT NULL,
    current_quantity numeric NOT NULL,
    received_quantity numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expiry_date timestamp with time zone,
    received_date timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    location_id uuid,
    supplier_id uuid,
    status character varying,
    batch_number character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE inventory_location (
    humidity_target numeric,
    temperature_target numeric,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    storage_type character varying NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE inventory_transaction (
    quantity_delta numeric NOT NULL,
    unit_cost_at_time numeric,
    created_at timestamp with time zone NOT NULL,
    transacted_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    created_by_id uuid,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    reference_id uuid,
    transaction_type character varying NOT NULL,
    reason character varying,
    metadata jsonb,
    PRIMARY KEY (id, transacted_at)
) PARTITION BY RANGE (transacted_at);

CREATE TABLE item_tax_tags (
    is_basic_staple boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    temperature character varying,
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    item_category character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_routing_rule (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    station_id uuid NOT NULL,
    target_id uuid NOT NULL,
    target_type character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_station (
    online boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    station_type character varying NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE kds_ticket (
    bumped_at timestamp with time zone,
    cooking_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    fired_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    order_ticket_id uuid NOT NULL,
    station_id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE kds_ticket_item (
    priority integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    ready_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    kds_ticket_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE loyalty_config (
    default_email_opt_in boolean NOT NULL,
    default_sms_opt_in boolean NOT NULL,
    earning_rate numeric NOT NULL,
    email_gateway_enabled boolean NOT NULL,
    feedback_window_hours integer NOT NULL,
    minimum_redemption_points integer NOT NULL,
    point_expiration_days integer NOT NULL,
    redemption_value numeric NOT NULL,
    sms_gateway_enabled boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE loyalty_tier (
    point_multiplier numeric NOT NULL,
    spend_threshold numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE loyalty_transaction (
    points integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    bonus_event_id uuid,
    customer_profile_id uuid NOT NULL,
    id uuid NOT NULL,
    order_ticket_id uuid,
    transaction_type character varying NOT NULL,
    description character varying,
    PRIMARY KEY (id)
);

CREATE TABLE marketing_campaign (
    is_executed boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    scheduled_for timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    promo_code character varying,
    name character varying NOT NULL,
    target_filter_description character varying,
    message_template text NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_category (
    default_course integer NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item (
    base_price numeric NOT NULL,
    preparation_time_minutes integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    category_id uuid NOT NULL,
    id uuid NOT NULL,
    status character varying NOT NULL,
    name character varying NOT NULL,
    description character varying,
    photo_url character varying,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item_modifier_group (
    display_order integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE menu_item_rating (
    rating integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    order_id character varying,
    comment text,
    PRIMARY KEY (id)
);

CREATE TABLE modifier_group (
    max_selections integer NOT NULL,
    min_selections integer NOT NULL,
    required boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE modifier_option (
    display_order integer NOT NULL,
    upcharge_amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    label character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE notification_logs (
    attempt_count integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    sent_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    channel_id uuid,
    dispatch_id uuid NOT NULL,
    id uuid NOT NULL,
    notification_type_id uuid,
    status character varying NOT NULL,
    error_message text,
    recipient_identifier character varying,
    payload jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE notification_templates (
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    channel_id uuid NOT NULL,
    id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    subject character varying,
    body_template text NOT NULL,
    meta jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE notification_type_channels (
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    channel_id uuid NOT NULL,
    fallback_channel_id uuid,
    id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    recipient_group_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE notification_types (
    is_active boolean NOT NULL,
    is_mutable boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    severity character varying NOT NULL,
    code character varying NOT NULL,
    description text,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE order_audit_log (
    created_at timestamp with time zone NOT NULL,
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    performed_by uuid,
    details character varying,
    device_jkt character varying,
    event_type character varying NOT NULL,
    signature_hash character varying,
    PRIMARY KEY (id)
);

CREATE TABLE order_item (
    course_number integer NOT NULL,
    has_allergy_flag boolean NOT NULL,
    is_subtraction boolean NOT NULL,
    modifier_upcharge_total numeric NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    fired_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    status character varying NOT NULL,
    custom_note character varying,
    PRIMARY KEY (id)
);

CREATE TABLE order_item_modifier (
    upcharge_amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    modifier_option_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE order_ticket (
    cover_count integer NOT NULL,
    discount_amount numeric NOT NULL,
    subtotal numeric NOT NULL,
    tax_amount numeric NOT NULL,
    tip_amount numeric NOT NULL,
    total_amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    paid_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    customer_profile_id uuid,
    id uuid NOT NULL,
    parent_ticket_id uuid,
    server_id uuid NOT NULL,
    table_id uuid,
    order_type character varying NOT NULL,
    status character varying NOT NULL,
    vehicle_plate character varying,
    vehicle_color character varying,
    vehicle_model character varying,
    delivery_address character varying,
    PRIMARY KEY (id)
);

CREATE TABLE payment (
    amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    method character varying NOT NULL,
    status character varying NOT NULL,
    processor_reference character varying,
    decline_reason character varying,
    PRIMARY KEY (id)
);

CREATE TABLE physical_count (
    count_date date NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    counted_by_id uuid NOT NULL,
    id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE physical_count_line (
    counted_qty numeric NOT NULL,
    expected_qty numeric NOT NULL,
    variance numeric,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    physical_count_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE po_status_history (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    actor_id uuid NOT NULL,
    id uuid NOT NULL,
    po_id uuid NOT NULL,
    from_status character varying,
    to_status character varying NOT NULL,
    reason text,
    PRIMARY KEY (id)
);

CREATE TABLE pos_terminal (
    dark_mode boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_active_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    active_staff_id uuid,
    id uuid NOT NULL,
    device_name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE promo_code (
    current_uses integer NOT NULL,
    discount_value numeric NOT NULL,
    is_active boolean NOT NULL,
    max_uses integer,
    created_at timestamp with time zone,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    id uuid NOT NULL,
    segment_id uuid,
    discount_type character varying NOT NULL,
    code character varying NOT NULL,
    description character varying,
    PRIMARY KEY (id)
);

CREATE TABLE purchase_order (
    counter_offer_price numeric,
    counter_offer_qty numeric,
    expected_delivery_date date,
    total_value numeric NOT NULL,
    acknowledged_at timestamp with time zone,
    approved_at timestamp with time zone,
    counter_offer_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    received_at timestamp with time zone,
    sent_at timestamp with time zone,
    shipped_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    approved_by_id uuid,
    generated_by_id uuid NOT NULL,
    id uuid NOT NULL,
    invoice_file_id uuid,
    source_bid_id uuid,
    source_proposal_id uuid,
    supplier_id uuid NOT NULL,
    order_type character varying NOT NULL,
    status character varying NOT NULL,
    delivery_note_ref character varying,
    tracking_number character varying,
    counter_offer_notes text,
    PRIMARY KEY (id)
) PARTITION BY HASH (id);

CREATE TABLE purchase_order_line (
    invoice_unit_price numeric,
    ordered_qty numeric NOT NULL,
    received_qty numeric,
    unit_cost numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE raw_ingredient (
    auto_replenish boolean NOT NULL,
    cost_per_unit numeric NOT NULL,
    critical_level numeric NOT NULL,
    current_stock numeric NOT NULL,
    daily_restock_enrolled boolean NOT NULL,
    effective_cost_per_unit numeric,
    max_stock_level numeric NOT NULL,
    par_level numeric NOT NULL,
    reorder_point numeric NOT NULL,
    safety_level numeric NOT NULL,
    shelf_life_days integer NOT NULL,
    yield_pct numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    supplier_id uuid,
    restocking_mode character varying NOT NULL,
    storage_type character varying NOT NULL,
    unit_of_measure character varying NOT NULL,
    category character varying,
    name character varying NOT NULL,
    bid_supplier_pool jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE raw_ingredient_allergen (
    ingredient_id uuid NOT NULL,
    allergen character varying
);

CREATE TABLE recipe (
    recipe_version integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    created_by_id uuid,
    id uuid NOT NULL,
    menu_item_id uuid,
    sub_recipe_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE recipe_ingredient (
    quantity numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid,
    recipe_id uuid NOT NULL,
    sub_recipe_id uuid,
    PRIMARY KEY (id)
);

CREATE TABLE recipient_group_members (
    group_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    PRIMARY KEY (group_id, recipient_id)
);

CREATE TABLE recipient_groups (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    role_code character varying,
    description text,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE recipients (
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    channel_id uuid NOT NULL,
    id uuid NOT NULL,
    user_id uuid,
    address character varying NOT NULL,
    name character varying,
    meta jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE reservation (
    party_size integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    reservation_time timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    created_by_id uuid,
    customer_id uuid,
    handled_by_id uuid,
    id uuid NOT NULL,
    table_id uuid NOT NULL,
    status character varying NOT NULL,
    cancellation_reason character varying,
    customer_name character varying NOT NULL,
    notes character varying,
    phone_number character varying,
    PRIMARY KEY (id)
);

CREATE TABLE rfq (
    desired_delivery_date date NOT NULL,
    required_qty numeric NOT NULL,
    bid_deadline timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE role_permissions (
    permission_id uuid NOT NULL,
    role_id uuid NOT NULL,
    PRIMARY KEY (permission_id, role_id)
);

CREATE TABLE section (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE segment_rule (
    created_at timestamp with time zone,
    id uuid NOT NULL,
    segment_id uuid NOT NULL,
    field character varying NOT NULL,
    operator character varying NOT NULL,
    rule_value character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE staff_device_bindings (
    revoked boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_active_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    staff_id uuid NOT NULL,
    public_key_thumbprint character varying NOT NULL,
    device_name character varying,
    PRIMARY KEY (id)
);

CREATE TABLE staff_member (
    active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_login_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    role_id uuid,
    full_name character varying NOT NULL,
    pin_hash character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE staff_permissions (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    category character varying NOT NULL,
    description character varying,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE staff_roles (
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    parent_role_id uuid,
    description character varying,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE sub_recipe (
    cost_per_unit numeric NOT NULL,
    yield_quantity numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    unit_of_measure character varying NOT NULL,
    name character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE supplier (
    bid_eligible boolean NOT NULL,
    lead_time_days integer NOT NULL,
    lead_time_variance numeric NOT NULL,
    min_order_value numeric NOT NULL,
    reliability_score numeric NOT NULL,
    vendor_rating numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    contact_phone character varying,
    contact_name character varying,
    payment_terms character varying,
    company_name character varying NOT NULL,
    contact_email character varying,
    categories jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE supplier_ingredient_pricing (
    unit_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_updated_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    vendor_sku character varying,
    PRIMARY KEY (id)
);

CREATE TABLE supplier_policy (
    auto_acknowledge boolean NOT NULL,
    counter_offer_allowed boolean NOT NULL,
    price_tolerance numeric,
    qty_tolerance numeric,
    supplier_id uuid NOT NULL,
    payment_terms character varying,
    PRIMARY KEY (supplier_id)
);

CREATE TABLE supplier_user (
    active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    last_login_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    phone_number character varying,
    role character varying NOT NULL,
    full_name character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE table_shape (
    capacity integer NOT NULL,
    height integer NOT NULL,
    pos_x integer NOT NULL,
    pos_y integer NOT NULL,
    width integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    assigned_staff_id uuid,
    id uuid NOT NULL,
    section_id uuid NOT NULL,
    name character varying NOT NULL,
    shape_type character varying NOT NULL,
    status character varying NOT NULL,
    nfc_tag_id character varying,
    PRIMARY KEY (id)
);

CREATE TABLE tableside_session (
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    qr_token uuid NOT NULL,
    table_id uuid NOT NULL,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tax_audit_logs (
    new_rate numeric,
    old_rate numeric,
    changed_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    changed_by uuid NOT NULL,
    id uuid NOT NULL,
    tax_rule_id uuid,
    venue_id uuid NOT NULL,
    action character varying NOT NULL,
    change_reason text,
    ip_address character varying,
    PRIMARY KEY (id)
);

CREATE TABLE tax_calculation_results (
    base_amount numeric NOT NULL,
    tax_amount numeric NOT NULL,
    tax_rate numeric NOT NULL,
    calculated_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    item_temperature character varying,
    id uuid NOT NULL,
    tax_rule_id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    ticket_item_id uuid NOT NULL,
    order_type character varying NOT NULL,
    rule_code character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE tax_rules (
    applies_to_alcohol boolean NOT NULL,
    applies_to_cold boolean,
    applies_to_dine_in boolean NOT NULL,
    applies_to_hot boolean,
    applies_to_takeaway boolean NOT NULL,
    default_rate numeric NOT NULL,
    is_active boolean NOT NULL,
    is_cascading boolean NOT NULL,
    max_allowed_rate numeric NOT NULL,
    min_allowed_rate numeric NOT NULL,
    price_threshold_max numeric,
    price_threshold_min numeric,
    sort_order integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    cascade_on_rule_id uuid,
    country_id uuid NOT NULL,
    id uuid NOT NULL,
    item_category character varying,
    rule_code character varying NOT NULL,
    tax_type character varying NOT NULL,
    rule_name character varying NOT NULL,
    description text,
    PRIMARY KEY (id)
);

CREATE TABLE user_notification_preferences (
    is_muted boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    channel_id uuid NOT NULL,
    id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    user_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_bid (
    delivery_date date NOT NULL,
    quantity_available numeric NOT NULL,
    unit_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    submitted_by_id uuid,
    supplier_id uuid NOT NULL,
    status character varying NOT NULL,
    payment_terms character varying,
    notes character varying,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_invoice (
    invoice_date date NOT NULL,
    tax_amount numeric,
    total_amount numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    invoice_number character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_invoice_line (
    invoiced_qty numeric NOT NULL,
    unit_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    vendor_invoice_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE vendor_price_proposal (
    proposed_price numeric NOT NULL,
    proposed_quantity numeric,
    created_at timestamp with time zone NOT NULL,
    reviewed_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    generated_po_id uuid,
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    reviewed_by uuid,
    submitted_by uuid,
    supplier_id uuid NOT NULL,
    notes text,
    status character varying NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE venue_country_assignments (
    is_active boolean NOT NULL,
    assigned_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    assigned_by uuid NOT NULL,
    country_id uuid NOT NULL,
    id uuid NOT NULL,
    venue_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE venue_tax_configs (
    is_active boolean NOT NULL,
    override_rate numeric NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    tax_rule_id uuid NOT NULL,
    venue_id uuid NOT NULL,
    override_reason text,
    PRIMARY KEY (id)
);

CREATE TABLE waitlist_entry (
    estimated_wait_minutes integer,
    party_size integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    notified_at timestamp with time zone,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    handled_by_id uuid,
    id uuid NOT NULL,
    seated_at_table_id uuid,
    status character varying NOT NULL,
    customer_name character varying NOT NULL,
    phone_number character varying,
    PRIMARY KEY (id)
);

-- Partitions
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

-- Foreign Keys
ALTER TABLE audit_log ADD CONSTRAINT fk_audit_log_actor_id FOREIGN KEY (actor_id) REFERENCES staff_member(id);
ALTER TABLE batch_record ADD CONSTRAINT fk_batch_record_produced_by_id FOREIGN KEY (produced_by_id) REFERENCES staff_member(id);
ALTER TABLE batch_record ADD CONSTRAINT fk_batch_record_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE campaign_message_log ADD CONSTRAINT fk_campaign_message_log_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE campaign_message_log ADD CONSTRAINT fk_campaign_message_log_marketing_campaign_id FOREIGN KEY (marketing_campaign_id) REFERENCES marketing_campaign(id);
ALTER TABLE customer_dietary_tag ADD CONSTRAINT fk_customer_dietary_tag_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE customer_occasion ADD CONSTRAINT fk_customer_occasion_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE customer_profile ADD CONSTRAINT fk_customer_profile_loyalty_tier_id FOREIGN KEY (loyalty_tier_id) REFERENCES loyalty_tier(id);
ALTER TABLE delivery_dispatch ADD CONSTRAINT fk_delivery_dispatch_driver_id FOREIGN KEY (driver_id) REFERENCES staff_member(id);
ALTER TABLE delivery_dispatch ADD CONSTRAINT fk_delivery_dispatch_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE demand_forecast ADD CONSTRAINT fk_demand_forecast_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE eod_record ADD CONSTRAINT fk_eod_record_closed_by_id FOREIGN KEY (closed_by_id) REFERENCES staff_member(id);
ALTER TABLE goods_receipt_note ADD CONSTRAINT fk_goods_receipt_note_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE goods_receipt_note ADD CONSTRAINT fk_goods_receipt_note_received_by_id FOREIGN KEY (received_by_id) REFERENCES staff_member(id);
ALTER TABLE goods_receipt_note_line ADD CONSTRAINT fk_goods_receipt_note_line_goods_receipt_note_id FOREIGN KEY (goods_receipt_note_id) REFERENCES goods_receipt_note(id);
ALTER TABLE goods_receipt_note_line ADD CONSTRAINT fk_goods_receipt_note_line_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE guest_cart_item ADD CONSTRAINT fk_guest_cart_item_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE guest_cart_item ADD CONSTRAINT fk_guest_cart_item_session_id FOREIGN KEY (session_id) REFERENCES tableside_session(id);
ALTER TABLE guest_feedback ADD CONSTRAINT fk_guest_feedback_customer_id FOREIGN KEY (customer_id) REFERENCES customer_profile(id);
ALTER TABLE inventory_batch ADD CONSTRAINT fk_inventory_batch_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE inventory_batch ADD CONSTRAINT fk_inventory_batch_location_id FOREIGN KEY (location_id) REFERENCES inventory_location(id);
ALTER TABLE inventory_batch ADD CONSTRAINT fk_inventory_batch_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE inventory_transaction ADD CONSTRAINT fk_inventory_transaction_created_by_id FOREIGN KEY (created_by_id) REFERENCES staff_member(id);
ALTER TABLE inventory_transaction ADD CONSTRAINT fk_inventory_transaction_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE kds_routing_rule ADD CONSTRAINT fk_kds_routing_rule_station_id FOREIGN KEY (station_id) REFERENCES kds_station(id);
ALTER TABLE kds_ticket ADD CONSTRAINT fk_kds_ticket_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE kds_ticket ADD CONSTRAINT fk_kds_ticket_station_id FOREIGN KEY (station_id) REFERENCES kds_station(id);
ALTER TABLE kds_ticket_item ADD CONSTRAINT fk_kds_ticket_item_kds_ticket_id FOREIGN KEY (kds_ticket_id) REFERENCES kds_ticket(id);
ALTER TABLE kds_ticket_item ADD CONSTRAINT fk_kds_ticket_item_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_item(id);
ALTER TABLE loyalty_transaction ADD CONSTRAINT fk_loyalty_transaction_bonus_event_id FOREIGN KEY (bonus_event_id) REFERENCES bonus_point_event(id);
ALTER TABLE loyalty_transaction ADD CONSTRAINT fk_loyalty_transaction_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE loyalty_transaction ADD CONSTRAINT fk_loyalty_transaction_order_ticket_id FOREIGN KEY (order_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE menu_item ADD CONSTRAINT fk_menu_item_category_id FOREIGN KEY (category_id) REFERENCES menu_category(id);
ALTER TABLE menu_item_modifier_group ADD CONSTRAINT fk_menu_item_modifier_group_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE menu_item_modifier_group ADD CONSTRAINT fk_menu_item_modifier_group_modifier_group_id FOREIGN KEY (modifier_group_id) REFERENCES modifier_group(id);
ALTER TABLE menu_item_rating ADD CONSTRAINT fk_menu_item_rating_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE modifier_option ADD CONSTRAINT fk_modifier_option_modifier_group_id FOREIGN KEY (modifier_group_id) REFERENCES modifier_group(id);
ALTER TABLE notification_logs ADD CONSTRAINT fk_notification_logs_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id);
ALTER TABLE notification_logs ADD CONSTRAINT fk_notification_logs_notification_type_id FOREIGN KEY (notification_type_id) REFERENCES notification_types(id);
ALTER TABLE notification_templates ADD CONSTRAINT fk_notification_templates_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id);
ALTER TABLE notification_templates ADD CONSTRAINT fk_notification_templates_notification_type_id FOREIGN KEY (notification_type_id) REFERENCES notification_types(id);
ALTER TABLE notification_type_channels ADD CONSTRAINT fk_notification_type_channels_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id);
ALTER TABLE notification_type_channels ADD CONSTRAINT fk_notification_type_channels_fallback_channel_id FOREIGN KEY (fallback_channel_id) REFERENCES channels(id);
ALTER TABLE notification_type_channels ADD CONSTRAINT fk_notification_type_channels_notification_type_id FOREIGN KEY (notification_type_id) REFERENCES notification_types(id);
ALTER TABLE notification_type_channels ADD CONSTRAINT fk_notification_type_channels_recipient_group_id FOREIGN KEY (recipient_group_id) REFERENCES recipient_groups(id);
ALTER TABLE order_audit_log ADD CONSTRAINT fk_order_audit_log_order_id FOREIGN KEY (order_id) REFERENCES order_ticket(id);
ALTER TABLE order_audit_log ADD CONSTRAINT fk_order_audit_log_performed_by FOREIGN KEY (performed_by) REFERENCES staff_member(id);
ALTER TABLE order_item ADD CONSTRAINT fk_order_item_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE order_item ADD CONSTRAINT fk_order_item_ticket_id FOREIGN KEY (ticket_id) REFERENCES order_ticket(id);
ALTER TABLE order_item_modifier ADD CONSTRAINT fk_order_item_modifier_modifier_option_id FOREIGN KEY (modifier_option_id) REFERENCES modifier_option(id);
ALTER TABLE order_item_modifier ADD CONSTRAINT fk_order_item_modifier_order_item_id FOREIGN KEY (order_item_id) REFERENCES order_item(id);
ALTER TABLE order_ticket ADD CONSTRAINT fk_order_ticket_customer_profile_id FOREIGN KEY (customer_profile_id) REFERENCES customer_profile(id);
ALTER TABLE order_ticket ADD CONSTRAINT fk_order_ticket_parent_ticket_id FOREIGN KEY (parent_ticket_id) REFERENCES order_ticket(id);
ALTER TABLE order_ticket ADD CONSTRAINT fk_order_ticket_server_id FOREIGN KEY (server_id) REFERENCES staff_member(id);
ALTER TABLE order_ticket ADD CONSTRAINT fk_order_ticket_table_id FOREIGN KEY (table_id) REFERENCES table_shape(id);
ALTER TABLE payment ADD CONSTRAINT fk_payment_ticket_id FOREIGN KEY (ticket_id) REFERENCES order_ticket(id);
ALTER TABLE physical_count ADD CONSTRAINT fk_physical_count_counted_by_id FOREIGN KEY (counted_by_id) REFERENCES staff_member(id);
ALTER TABLE physical_count_line ADD CONSTRAINT fk_physical_count_line_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE physical_count_line ADD CONSTRAINT fk_physical_count_line_physical_count_id FOREIGN KEY (physical_count_id) REFERENCES physical_count(id);
ALTER TABLE po_status_history ADD CONSTRAINT fk_po_status_history_po_id FOREIGN KEY (po_id) REFERENCES purchase_order(id);
ALTER TABLE pos_terminal ADD CONSTRAINT fk_pos_terminal_active_staff_id FOREIGN KEY (active_staff_id) REFERENCES staff_member(id);
ALTER TABLE promo_code ADD CONSTRAINT fk_promo_code_segment_id FOREIGN KEY (segment_id) REFERENCES customer_segment(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_approved_by_id FOREIGN KEY (approved_by_id) REFERENCES staff_member(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_generated_by_id FOREIGN KEY (generated_by_id) REFERENCES staff_member(id);
ALTER TABLE purchase_order ADD CONSTRAINT fk_purchase_order_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE purchase_order_line ADD CONSTRAINT fk_purchase_order_line_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE purchase_order_line ADD CONSTRAINT fk_purchase_order_line_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE raw_ingredient ADD CONSTRAINT fk_raw_ingredient_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE raw_ingredient_allergen ADD CONSTRAINT fk_raw_ingredient_allergen_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE recipe ADD CONSTRAINT fk_recipe_created_by_id FOREIGN KEY (created_by_id) REFERENCES staff_member(id);
ALTER TABLE recipe ADD CONSTRAINT fk_recipe_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_item(id);
ALTER TABLE recipe ADD CONSTRAINT fk_recipe_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE recipe_ingredient ADD CONSTRAINT fk_recipe_ingredient_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE recipe_ingredient ADD CONSTRAINT fk_recipe_ingredient_recipe_id FOREIGN KEY (recipe_id) REFERENCES recipe(id);
ALTER TABLE recipe_ingredient ADD CONSTRAINT fk_recipe_ingredient_sub_recipe_id FOREIGN KEY (sub_recipe_id) REFERENCES sub_recipe(id);
ALTER TABLE recipient_group_members ADD CONSTRAINT fk_recipient_group_members_group_id FOREIGN KEY (group_id) REFERENCES recipient_groups(id);
ALTER TABLE recipient_group_members ADD CONSTRAINT fk_recipient_group_members_recipient_id FOREIGN KEY (recipient_id) REFERENCES recipients(id);
ALTER TABLE recipients ADD CONSTRAINT fk_recipients_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id);
ALTER TABLE reservation ADD CONSTRAINT fk_reservation_created_by_id FOREIGN KEY (created_by_id) REFERENCES staff_member(id);
ALTER TABLE reservation ADD CONSTRAINT fk_reservation_customer_id FOREIGN KEY (customer_id) REFERENCES customer_profile(id);
ALTER TABLE reservation ADD CONSTRAINT fk_reservation_handled_by_id FOREIGN KEY (handled_by_id) REFERENCES staff_member(id);
ALTER TABLE reservation ADD CONSTRAINT fk_reservation_table_id FOREIGN KEY (table_id) REFERENCES table_shape(id);
ALTER TABLE rfq ADD CONSTRAINT fk_rfq_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES staff_permissions(id);
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role_id FOREIGN KEY (role_id) REFERENCES staff_roles(id);
ALTER TABLE segment_rule ADD CONSTRAINT fk_segment_rule_segment_id FOREIGN KEY (segment_id) REFERENCES customer_segment(id);
ALTER TABLE staff_device_bindings ADD CONSTRAINT fk_staff_device_bindings_staff_id FOREIGN KEY (staff_id) REFERENCES staff_member(id);
ALTER TABLE staff_member ADD CONSTRAINT fk_staff_member_role_id FOREIGN KEY (role_id) REFERENCES staff_roles(id);
ALTER TABLE staff_roles ADD CONSTRAINT fk_staff_roles_parent_role_id FOREIGN KEY (parent_role_id) REFERENCES staff_roles(id);
ALTER TABLE supplier_ingredient_pricing ADD CONSTRAINT fk_supplier_ingredient_pricing_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE supplier_ingredient_pricing ADD CONSTRAINT fk_supplier_ingredient_pricing_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE supplier_policy ADD CONSTRAINT fk_supplier_policy_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE supplier_user ADD CONSTRAINT fk_supplier_user_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE table_shape ADD CONSTRAINT fk_table_shape_assigned_staff_id FOREIGN KEY (assigned_staff_id) REFERENCES staff_member(id);
ALTER TABLE table_shape ADD CONSTRAINT fk_table_shape_section_id FOREIGN KEY (section_id) REFERENCES section(id);
ALTER TABLE tableside_session ADD CONSTRAINT fk_tableside_session_table_id FOREIGN KEY (table_id) REFERENCES table_shape(id);
ALTER TABLE tax_audit_logs ADD CONSTRAINT fk_tax_audit_logs_tax_rule_id FOREIGN KEY (tax_rule_id) REFERENCES tax_rules(id);
ALTER TABLE tax_calculation_results ADD CONSTRAINT fk_tax_calculation_results_tax_rule_id FOREIGN KEY (tax_rule_id) REFERENCES tax_rules(id);
ALTER TABLE tax_rules ADD CONSTRAINT fk_tax_rules_cascade_on_rule_id FOREIGN KEY (cascade_on_rule_id) REFERENCES tax_rules(id);
ALTER TABLE tax_rules ADD CONSTRAINT fk_tax_rules_country_id FOREIGN KEY (country_id) REFERENCES countries(id);
ALTER TABLE user_notification_preferences ADD CONSTRAINT fk_user_notification_preferences_channel_id FOREIGN KEY (channel_id) REFERENCES channels(id);
ALTER TABLE user_notification_preferences ADD CONSTRAINT fk_user_notification_preferences_notification_type_id FOREIGN KEY (notification_type_id) REFERENCES notification_types(id);
ALTER TABLE vendor_bid ADD CONSTRAINT fk_vendor_bid_rfq_id FOREIGN KEY (rfq_id) REFERENCES rfq(id);
ALTER TABLE vendor_bid ADD CONSTRAINT fk_vendor_bid_submitted_by_id FOREIGN KEY (submitted_by_id) REFERENCES supplier_user(id);
ALTER TABLE vendor_bid ADD CONSTRAINT fk_vendor_bid_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE vendor_invoice ADD CONSTRAINT fk_vendor_invoice_purchase_order_id FOREIGN KEY (purchase_order_id) REFERENCES purchase_order(id);
ALTER TABLE vendor_invoice_line ADD CONSTRAINT fk_vendor_invoice_line_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE vendor_invoice_line ADD CONSTRAINT fk_vendor_invoice_line_vendor_invoice_id FOREIGN KEY (vendor_invoice_id) REFERENCES vendor_invoice(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_generated_po_id FOREIGN KEY (generated_po_id) REFERENCES purchase_order(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES raw_ingredient(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES staff_member(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_submitted_by FOREIGN KEY (submitted_by) REFERENCES supplier_user(id);
ALTER TABLE vendor_price_proposal ADD CONSTRAINT fk_vendor_price_proposal_supplier_id FOREIGN KEY (supplier_id) REFERENCES supplier(id);
ALTER TABLE venue_country_assignments ADD CONSTRAINT fk_venue_country_assignments_country_id FOREIGN KEY (country_id) REFERENCES countries(id);
ALTER TABLE venue_tax_configs ADD CONSTRAINT fk_venue_tax_configs_tax_rule_id FOREIGN KEY (tax_rule_id) REFERENCES tax_rules(id);
ALTER TABLE waitlist_entry ADD CONSTRAINT fk_waitlist_entry_handled_by_id FOREIGN KEY (handled_by_id) REFERENCES staff_member(id);
ALTER TABLE waitlist_entry ADD CONSTRAINT fk_waitlist_entry_seated_at_table_id FOREIGN KEY (seated_at_table_id) REFERENCES table_shape(id);

COMMIT;