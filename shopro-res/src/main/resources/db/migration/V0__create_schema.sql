-- ============================================================================
-- V0__create_schema.sql
-- Full DDL for shopro_pos database.
-- Generated from Hibernate schema (ddl-auto: create) via pg_dump.
-- ============================================================================
-- This migration creates ALL application tables so that Flyway can manage the
-- complete lifecycle.  Hibernate ddl-auto is set to "validate" so that JPA
-- only checks that the schema matches the entities — it never creates or
-- alters tables on its own.
-- ============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- PostgreSQL database dump
--

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: -
--


-- Enable pgcrypto for sha256/digest functions used by seed data
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE public.audit_log (
    id bigint NOT NULL,
    "timestamp" timestamp(6) without time zone NOT NULL,
    ip_address character varying(45),
    action character varying(50) NOT NULL,
    entity_id character varying(50),
    entity_name character varying(100) NOT NULL,
    username character varying(100) NOT NULL,
    details character varying(500),
    CONSTRAINT audit_log_action_check CHECK (((action)::text = ANY ((ARRAY['CREATE'::character varying, 'READ'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying])::text[])))
);

--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_log_id_seq OWNED BY public.audit_log.id;

--
-- Name: auth_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth_audit (
    success boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    audit_id uuid NOT NULL,
    user_id uuid NOT NULL,
    action character varying(50) NOT NULL,
    ip_address character varying(255),
    details jsonb
);

--
-- Name: banquet_event_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.banquet_event_order (
    actual_count integer,
    guaranteed_count integer NOT NULL,
    total_cost numeric(12,2),
    total_revenue numeric(12,2),
    created_at timestamp(6) without time zone NOT NULL,
    event_end timestamp(6) without time zone,
    event_start timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    equipment_notes character varying(1000),
    event_name character varying(255) NOT NULL,
    event_type character varying(255) NOT NULL,
    location character varying(255),
    status character varying(255) NOT NULL,
    CONSTRAINT banquet_event_order_status_check CHECK (((status)::text = ANY ((ARRAY['PROPOSAL'::character varying, 'CONFIRMED'::character varying, 'FINALIZED'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: banquet_event_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.banquet_event_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: banquet_event_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.banquet_event_order_id_seq OWNED BY public.banquet_event_order.id;

--
-- Name: build_chart_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.build_chart_line (
    step_number integer NOT NULL,
    build_chart_id bigint NOT NULL,
    id bigint NOT NULL,
    instruction character varying(255) NOT NULL,
    step_image_key character varying(255)
);

--
-- Name: build_chart_line_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.build_chart_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: build_chart_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.build_chart_line_id_seq OWNED BY public.build_chart_line.id;

--
-- Name: daily_sales_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_sales_entry (
    bottle_beer_sales numeric(12,2),
    comps_discounts numeric(12,2),
    draft_beer_sales numeric(12,2),
    food_sales numeric(12,2),
    guest_count integer,
    liquor_sales numeric(12,2),
    merch_sales numeric(12,2),
    sales_date date NOT NULL,
    soft_bev_sales numeric(12,2),
    wine_sales numeric(12,2),
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    source character varying(255) NOT NULL
);

--
-- Name: daily_sales_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_sales_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: daily_sales_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_sales_entry_id_seq OWNED BY public.daily_sales_entry.id;

--
-- Name: dining_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dining_table (
    capacity integer NOT NULL,
    pos_x integer,
    pos_y integer,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    status character varying(255) NOT NULL,
    table_number character varying(255) NOT NULL,
    CONSTRAINT dining_table_status_check CHECK (((status)::text = ANY ((ARRAY['AVAILABLE'::character varying, 'OCCUPIED'::character varying, 'RESERVED'::character varying, 'DIRTY'::character varying])::text[])))
);

--
-- Name: dining_table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dining_table_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: dining_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dining_table_id_seq OWNED BY public.dining_table.id;

--
-- Name: employee; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee (
    annual_salary numeric(12,2),
    hourly_rate numeric(8,2),
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    employee_type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    CONSTRAINT employee_employee_type_check CHECK (((employee_type)::text = ANY ((ARRAY['MANAGEMENT'::character varying, 'HOURLY'::character varying])::text[])))
);

--
-- Name: employee_attendance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_attendance (
    clock_in_time timestamp(6) without time zone NOT NULL,
    clock_out_time timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    employee_id bigint NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT employee_attendance_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'COMPLETED'::character varying, 'VOIDED'::character varying])::text[])))
);

--
-- Name: employee_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: employee_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_attendance_id_seq OWNED BY public.employee_attendance.id;

--
-- Name: employee_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: employee_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_id_seq OWNED BY public.employee.id;

--
-- Name: employee_labor_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_labor_record (
    hours_fri numeric(5,2),
    hours_mon numeric(5,2),
    hours_sat numeric(5,2),
    hours_sun numeric(5,2),
    hours_thu numeric(5,2),
    hours_tue numeric(5,2),
    hours_wed numeric(5,2),
    rate_snapshot numeric(8,2),
    week_start_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    employee_id bigint NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone
);

--
-- Name: employee_labor_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employee_labor_record_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: employee_labor_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employee_labor_record_id_seq OWNED BY public.employee_labor_record.id;

--
-- Name: experiment_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiment_events (
    created_at timestamp(6) without time zone NOT NULL,
    experiment_id uuid NOT NULL,
    id uuid NOT NULL,
    event_type character varying(255) NOT NULL,
    triggered_by character varying(255),
    event_data jsonb
);

--
-- Name: experiment_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiment_metrics (
    metric_date date NOT NULL,
    metric_value numeric(15,4) NOT NULL,
    sample_size integer,
    created_at timestamp(6) without time zone NOT NULL,
    experiment_id uuid NOT NULL,
    id uuid NOT NULL,
    variant_id uuid,
    metric_type character varying(255) NOT NULL,
    dimensions jsonb
);

--
-- Name: experiment_variants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiment_variants (
    allocation numeric(5,4) NOT NULL,
    is_control boolean,
    experiment_id uuid NOT NULL,
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(255),
    variant_key character varying(255) NOT NULL,
    config jsonb NOT NULL,
    CONSTRAINT experiment_variants_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'INACTIVE'::character varying, 'DISABLED'::character varying])::text[])))
);

--
-- Name: experiments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiments (
    created_at timestamp(6) without time zone NOT NULL,
    end_date timestamp(6) without time zone,
    restaurant_id bigint NOT NULL,
    start_date timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    version bigint,
    created_by uuid NOT NULL,
    id uuid NOT NULL,
    experiment_key character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    owner_role character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    execution_config jsonb NOT NULL,
    hypothesis jsonb NOT NULL,
    randomization_config jsonb NOT NULL,
    CONSTRAINT experiments_owner_role_check CHECK (((owner_role)::text = ANY ((ARRAY['CFO'::character varying, 'CHEF'::character varying, 'GM'::character varying, 'FOH_MANAGER'::character varying, 'BAR_MANAGER'::character varying, 'CATERING_MANAGER'::character varying])::text[]))),
    CONSTRAINT experiments_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'RUNNING'::character varying, 'PAUSED'::character varying, 'COMPLETED'::character varying, 'ROLLED_BACK'::character varying])::text[]))),
    CONSTRAINT experiments_type_check CHECK (((type)::text = ANY ((ARRAY['AB_TEST'::character varying, 'MULTI_ARMED'::character varying, 'FACTORIAL'::character varying, 'LOYALTY'::character varying, 'SPEED'::character varying, 'MARGIN'::character varying, 'UPSELL'::character varying, 'MENU'::character varying])::text[])))
);

--
-- Name: goods_receipt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goods_receipt (
    total_amount numeric(12,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    purchase_order_id bigint,
    received_date timestamp(6) without time zone NOT NULL,
    restaurant_id bigint NOT NULL,
    supplier_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    notes text,
    status character varying(255) NOT NULL,
    CONSTRAINT goods_receipt_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'RECEIVED'::character varying, 'CONFLICT'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: goods_receipt_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.goods_receipt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: goods_receipt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.goods_receipt_id_seq OWNED BY public.goods_receipt.id;

--
-- Name: guest_experiment_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_experiment_assignments (
    assigned_at timestamp(6) without time zone NOT NULL,
    fallback_session_id bigint,
    experiment_id uuid NOT NULL,
    guest_id uuid,
    id uuid NOT NULL,
    variant_id uuid NOT NULL
);

--
-- Name: guest_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_feedback (
    ambience_rating integer,
    food_rating integer,
    nps_score integer NOT NULL,
    service_rating integer,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    order_id bigint,
    restaurant_id bigint NOT NULL,
    comment character varying(1000),
    complaint_category character varying(255),
    guest_name character varying(255)
);

--
-- Name: guest_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.guest_feedback_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: guest_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.guest_feedback_id_seq OWNED BY public.guest_feedback.id;

--
-- Name: guest_oauth_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_oauth_accounts (
    linked_at timestamp(6) without time zone,
    token_expires_at timestamp(6) without time zone,
    guest_id uuid NOT NULL,
    oauth_id uuid NOT NULL,
    access_token character varying(255),
    provider character varying(255) NOT NULL,
    provider_avatar_url character varying(255),
    provider_display_name character varying(255),
    provider_email character varying(255),
    provider_subject character varying(255) NOT NULL,
    refresh_token character varying(255),
    CONSTRAINT guest_oauth_accounts_provider_check CHECK (((provider)::text = ANY ((ARRAY['GOOGLE'::character varying, 'FACEBOOK'::character varying, 'X'::character varying, 'APPLE'::character varying])::text[])))
);

--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    date_of_birth date,
    is_active boolean,
    is_oauth_only boolean,
    is_verified boolean,
    loyalty_points integer,
    created_at timestamp(6) without time zone,
    last_login_at timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    verification_expires_at timestamp(6) without time zone,
    guest_id uuid NOT NULL,
    avatar_url character varying(255),
    display_name character varying(255),
    email character varying(255),
    last_login_ip character varying(255),
    loyalty_tier character varying(255),
    password_hash character varying(255),
    phone character varying(255),
    verification_token character varying(255),
    allergies jsonb,
    dietary_restrictions jsonb,
    favorite_cuisines jsonb,
    CONSTRAINT guests_loyalty_tier_check CHECK (((loyalty_tier)::text = ANY ((ARRAY['BRONZE'::character varying, 'SILVER'::character varying, 'GOLD'::character varying, 'PLATINUM'::character varying])::text[])))
);

--
-- Name: haccp_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.haccp_log (
    is_compliant boolean NOT NULL,
    reading_value numeric(5,2),
    created_at timestamp(6) without time zone NOT NULL,
    employee_id bigint,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    corrective_action character varying(500),
    check_type character varying(255) NOT NULL,
    equipment_name character varying(255) NOT NULL
);

--
-- Name: haccp_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.haccp_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: haccp_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.haccp_log_id_seq OWNED BY public.haccp_log.id;

--
-- Name: ingredient; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredient (
    is_active boolean NOT NULL,
    iu_per_pu numeric(10,4) NOT NULL,
    on_hand numeric(10,3),
    oz_weight_per_cup numeric(8,4),
    par_level numeric(10,3),
    purchase_unit_price numeric(10,4) NOT NULL,
    ru_per_pu numeric(10,4) NOT NULL,
    yield_pct numeric(6,4) NOT NULL,
    item_code character varying(6) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    case_pack_size character varying(255),
    category character varying(255) NOT NULL,
    description character varying(255) NOT NULL,
    image_storage_key character varying(255),
    inventory_type character varying(255) NOT NULL,
    inventory_unit character varying(255) NOT NULL,
    packed_by character varying(255),
    purchase_unit character varying(255) NOT NULL,
    recipe_unit character varying(255) NOT NULL,
    CONSTRAINT ingredient_category_check CHECK (((category)::text = ANY ((ARRAY['MEAT'::character varying, 'SEAFOOD'::character varying, 'POULTRY'::character varying, 'PRODUCE'::character varying, 'DAIRY'::character varying, 'BAKERY'::character varying, 'GROCERY_DRY_GOODS'::character varying, 'DRY_GOODS'::character varying, 'DRINKS'::character varying, 'BEVERAGES'::character varying, 'LIQUOR'::character varying, 'BOTTLE_BEER'::character varying, 'DRAFT_BEER'::character varying, 'BEER'::character varying, 'WINE'::character varying, 'BAR_CONSUMABLES'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT ingredient_inventory_type_check CHECK (((inventory_type)::text = ANY ((ARRAY['FOOD'::character varying, 'BAR'::character varying])::text[]))),
    CONSTRAINT ingredient_inventory_unit_check CHECK (((inventory_unit)::text = ANY ((ARRAY['LB'::character varying, 'OZ'::character varying, 'OZ_FLUID'::character varying, 'EACH'::character varying, 'BOX'::character varying, 'CARTON'::character varying, 'CASE'::character varying, 'BOTTLE'::character varying, 'CAN'::character varying, 'JAR'::character varying, 'BAG'::character varying, 'KEG'::character varying, 'DOZEN'::character varying, 'GALLON'::character varying, 'KG'::character varying, 'ML'::character varying, 'LITER'::character varying, 'BUNCH'::character varying])::text[]))),
    CONSTRAINT ingredient_packed_by_check CHECK (((packed_by)::text = ANY ((ARRAY['WEIGHT'::character varying, 'VOLUME'::character varying])::text[]))),
    CONSTRAINT ingredient_purchase_unit_check CHECK (((purchase_unit)::text = ANY ((ARRAY['LB'::character varying, 'OZ'::character varying, 'KG'::character varying, 'EACH'::character varying, 'CASE'::character varying, 'BOTTLE'::character varying, 'BAG'::character varying, 'BOX'::character varying, 'CARTON'::character varying, 'CAN'::character varying, 'ROLL'::character varying, 'JAR'::character varying, 'PACK_12'::character varying, 'KEG'::character varying, 'CYLINDER'::character varying, 'BUNCH'::character varying, 'DOZEN'::character varying, 'GALLON'::character varying, 'HALF_GALLON'::character varying, 'LITER'::character varying, 'ML'::character varying])::text[]))),
    CONSTRAINT ingredient_recipe_unit_check CHECK (((recipe_unit)::text = ANY ((ARRAY['OZ_WEIGHT'::character varying, 'OZ_FLUID'::character varying, 'OZ'::character varying, 'LB'::character varying, 'KG'::character varying, 'GRAM'::character varying, 'TSP'::character varying, 'TBSP'::character varying, 'CUP'::character varying, 'PINT'::character varying, 'QUART'::character varying, 'GALLON'::character varying, 'EACH'::character varying, 'BUNCH'::character varying, 'SLICE'::character varying, 'WHOLE'::character varying, 'LITER'::character varying, 'ML'::character varying, 'JAR'::character varying])::text[])))
);

--
-- Name: ingredient_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: ingredient_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredient_id_seq OWNED BY public.ingredient.id;

--
-- Name: inventory_active_lot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_active_lot (
    available_qty numeric(12,4) NOT NULL,
    expiry_date date,
    initial_qty numeric(12,4) NOT NULL,
    is_active boolean NOT NULL,
    tax_amount numeric(12,4),
    unit_price numeric(12,4) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    grn_id bigint,
    id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    received_at timestamp(6) without time zone NOT NULL,
    restaurant_id bigint NOT NULL,
    supplier_id bigint,
    updated_at timestamp(6) without time zone,
    lot_number character varying(255)
);

--
-- Name: inventory_active_lot_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_active_lot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: inventory_active_lot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_active_lot_id_seq OWNED BY public.inventory_active_lot.id;

--
-- Name: inventory_ingredient_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_ingredient_ledger (
    quantity numeric(12,4) NOT NULL,
    tax_amount numeric(12,4),
    total_value numeric(12,4) NOT NULL,
    unit_cost numeric(12,4) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    grn_id bigint,
    id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    line_item_id bigint,
    lot_id bigint,
    menu_id bigint,
    order_id bigint,
    po_id bigint,
    recipe_id bigint,
    restaurant_id bigint NOT NULL,
    supplier_id bigint,
    created_by character varying(255),
    event_type character varying(255) NOT NULL,
    reason_code character varying(255),
    CONSTRAINT inventory_ingredient_ledger_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['RECEIVING'::character varying, 'DEPLETION'::character varying, 'PRODUCTION_IN'::character varying, 'PRODUCTION_OUT'::character varying, 'MISFIRE'::character varying, 'DISCARD'::character varying, 'RECONCILIATION'::character varying, 'RETURN'::character varying, 'STOCK_REVERSAL'::character varying, 'COST_BASIS_UPDATE'::character varying])::text[])))
);

--
-- Name: inventory_ingredient_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_ingredient_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: inventory_ingredient_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_ingredient_ledger_id_seq OWNED BY public.inventory_ingredient_ledger.id;

--
-- Name: inventory_waste_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_waste_registry (
    created_at timestamp(6) without time zone NOT NULL,
    employee_id bigint,
    id bigint NOT NULL,
    ledger_id bigint NOT NULL,
    menu_id bigint,
    order_id bigint,
    notes character varying(500),
    created_by character varying(255),
    disposal_method character varying(255),
    reason_code character varying(255) NOT NULL
);

--
-- Name: inventory_waste_registry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.inventory_waste_registry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: inventory_waste_registry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.inventory_waste_registry_id_seq OWNED BY public.inventory_waste_registry.id;

--
-- Name: kds_daily_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_daily_stats (
    avg_prep_time_seconds integer,
    max_prep_time_seconds integer,
    p50_prep_time_seconds integer,
    p90_prep_time_seconds integer,
    peak_hour integer,
    recall_count integer,
    stat_date date NOT NULL,
    tickets_over_alert integer,
    tickets_over_warn integer,
    total_items integer,
    total_tickets integer,
    void_count integer,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    outlet_id bigint NOT NULL,
    station_id bigint NOT NULL
);

--
-- Name: kds_daily_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_daily_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_daily_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_daily_stats_id_seq OWNED BY public.kds_daily_stats.id;

--
-- Name: kds_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_device (
    is_active boolean NOT NULL,
    pairing_code character varying(6),
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    last_seen_at timestamp(6) without time zone,
    pairing_code_expires_at timestamp(6) without time zone,
    station_id bigint NOT NULL,
    auth_token_hash character varying(64),
    device_type character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    orientation character varying(255) NOT NULL,
    CONSTRAINT kds_device_device_type_check CHECK (((device_type)::text = ANY ((ARRAY['FULL_SCREEN'::character varying, 'TABLET'::character varying, 'PHONE'::character varying, 'BROWSER'::character varying])::text[]))),
    CONSTRAINT kds_device_orientation_check CHECK (((orientation)::text = ANY ((ARRAY['LANDSCAPE'::character varying, 'PORTRAIT'::character varying])::text[])))
);

--
-- Name: kds_device_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_device_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_device_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_device_id_seq OWNED BY public.kds_device.id;

--
-- Name: kds_event_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_event_log (
    device_id bigint,
    id bigint NOT NULL,
    occurred_at timestamp(6) without time zone NOT NULL,
    outlet_id bigint NOT NULL,
    station_id bigint,
    ticket_id bigint,
    ticket_item_id bigint,
    event_type character varying(255) NOT NULL,
    payload jsonb,
    CONSTRAINT kds_event_log_event_type_check CHECK (((event_type)::text = ANY ((ARRAY['TICKET_FIRED'::character varying, 'TICKET_COMPLETE'::character varying, 'TICKET_VOIDED'::character varying, 'TICKET_RECALLED'::character varying, 'TICKET_PRIORITY'::character varying, 'ITEM_BUMPED'::character varying, 'ITEM_STARTED'::character varying, 'ITEM_VOIDED'::character varying, 'ITEM_RECALLED'::character varying, 'DEVICE_ONLINE'::character varying, 'DEVICE_OFFLINE'::character varying])::text[])))
);

--
-- Name: kds_event_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_event_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_event_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_event_log_id_seq OWNED BY public.kds_event_log.id;

--
-- Name: kds_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_settings (
    alert_threshold_seconds integer NOT NULL,
    enable_audio_alerts boolean NOT NULL,
    enable_course_management boolean NOT NULL,
    enable_recall boolean NOT NULL,
    enable_runner_notification boolean NOT NULL,
    enable_start_action boolean NOT NULL,
    highlight_allergens boolean NOT NULL,
    max_tickets_per_screen integer NOT NULL,
    recall_window_seconds integer NOT NULL,
    warn_threshold_seconds integer NOT NULL,
    id bigint NOT NULL,
    outlet_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    sort_order character varying(255) NOT NULL,
    CONSTRAINT kds_settings_sort_order_check CHECK (((sort_order)::text = ANY ((ARRAY['FIRED_ASC'::character varying, 'PRIORITY_FIRST'::character varying, 'TABLE_NUMBER'::character varying])::text[])))
);

--
-- Name: kds_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_settings_id_seq OWNED BY public.kds_settings.id;

--
-- Name: kds_station; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_station (
    alert_threshold_seconds integer,
    display_order integer,
    is_active boolean NOT NULL,
    is_expo boolean NOT NULL,
    warn_threshold_seconds integer,
    id bigint NOT NULL,
    outlet_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    station_type character varying(255) NOT NULL,
    CONSTRAINT kds_station_station_type_check CHECK (((station_type)::text = ANY ((ARRAY['GRILL'::character varying, 'FRYER'::character varying, 'COLD_APPS'::character varying, 'HOT_APPS'::character varying, 'SAUTE'::character varying, 'PASTRY'::character varying, 'PIZZA'::character varying, 'BAR'::character varying, 'PREP'::character varying, 'EXPO'::character varying, 'RUNNER'::character varying, 'CUSTOM'::character varying])::text[])))
);

--
-- Name: kds_station_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_station_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_station_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_station_id_seq OWNED BY public.kds_station.id;

--
-- Name: kds_ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_ticket (
    course_number integer,
    guest_count integer,
    prep_time_seconds integer,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    fired_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    outlet_id bigint NOT NULL,
    pos_order_id bigint,
    server_note character varying(200),
    priority character varying(255) NOT NULL,
    source character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    ticket_number character varying(255) NOT NULL,
    CONSTRAINT kds_ticket_priority_check CHECK (((priority)::text = ANY ((ARRAY['NORMAL'::character varying, 'RUSH'::character varying])::text[]))),
    CONSTRAINT kds_ticket_source_check CHECK (((source)::text = ANY ((ARRAY['POS'::character varying, 'DELIVERY'::character varying, 'ONLINE'::character varying, 'MANUAL'::character varying, 'RECALL'::character varying])::text[]))),
    CONSTRAINT kds_ticket_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'COMPLETE'::character varying, 'VOIDED'::character varying, 'RECALLED'::character varying])::text[])))
);

--
-- Name: kds_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_ticket_id_seq OWNED BY public.kds_ticket.id;

--
-- Name: kds_ticket_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kds_ticket_item (
    course_number integer,
    plu_number integer,
    prep_time_minutes integer,
    quantity integer NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    menu_item_id bigint,
    pos_order_line_id bigint,
    ticket_id bigint NOT NULL,
    allergen_flags character varying(200),
    menu_item_name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    modifications jsonb,
    CONSTRAINT kds_ticket_item_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'IN_PROGRESS'::character varying, 'DONE'::character varying, 'VOIDED'::character varying, 'HELD'::character varying])::text[])))
);

--
-- Name: kds_ticket_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kds_ticket_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: kds_ticket_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kds_ticket_item_id_seq OWNED BY public.kds_ticket_item.id;

--
-- Name: menu_cost_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_cost_group (
    display_order integer NOT NULL,
    target_food_cost_pct numeric(5,2),
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    revenue_category character varying(255) NOT NULL,
    CONSTRAINT menu_cost_group_revenue_category_check CHECK (((revenue_category)::text = ANY ((ARRAY['FOOD'::character varying, 'SOFT_BEV'::character varying, 'LIQUOR'::character varying, 'BEER'::character varying, 'WINE'::character varying, 'MERCH'::character varying])::text[])))
);

--
-- Name: menu_cost_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menu_cost_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: menu_cost_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menu_cost_group_id_seq OWNED BY public.menu_cost_group.id;

--
-- Name: menu_engineering_period; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_engineering_period (
    end_date date NOT NULL,
    start_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    run_at timestamp(6) without time zone,
    period_name character varying(255) NOT NULL,
    results_json text,
    status character varying(255) NOT NULL,
    CONSTRAINT menu_engineering_period_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'COMPLETE'::character varying, 'FINALIZED'::character varying])::text[])))
);

--
-- Name: menu_engineering_period_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menu_engineering_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: menu_engineering_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menu_engineering_period_id_seq OWNED BY public.menu_engineering_period.id;

--
-- Name: menu_engineering_recommendation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_engineering_recommendation (
    estimated_implementation_cost numeric(10,2),
    projected_impact_margin numeric(5,2),
    projected_impact_profit numeric(10,2),
    projected_impact_revenue numeric(10,2),
    approved_at timestamp(6) without time zone,
    completed_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone NOT NULL,
    due_date timestamp(6) without time zone,
    menu_item_id bigint,
    period_id bigint NOT NULL,
    restaurant_id bigint,
    updated_at timestamp(6) without time zone,
    id uuid NOT NULL,
    approved_by character varying(100),
    assigned_to character varying(100),
    approval_comment character varying(500),
    dismissed_reason character varying(500),
    title character varying(500) NOT NULL,
    comment character varying(1000),
    action_plan character varying(2000),
    description character varying(2000),
    classification character varying(255) NOT NULL,
    priority character varying(255),
    recommendation_type character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT menu_engineering_recommendation_classification_check CHECK (((classification)::text = ANY ((ARRAY['WINNER'::character varying, 'WORKHORSE'::character varying, 'OPPORTUNITY'::character varying, 'LOSER'::character varying])::text[]))),
    CONSTRAINT menu_engineering_recommendation_priority_check CHECK (((priority)::text = ANY ((ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying, 'CRITICAL'::character varying])::text[]))),
    CONSTRAINT menu_engineering_recommendation_recommendation_type_check CHECK (((recommendation_type)::text = ANY ((ARRAY['RETAIN'::character varying, 'PROTECT'::character varying, 'FEATURE'::character varying, 'HIGHLIGHT'::character varying, 'INCREASE_VISIBILITY'::character varying, 'REPOSITION'::character varying, 'ENHANCE_DESCRIPTION'::character varying, 'PROMOTE'::character varying, 'TRAIN_STAFF'::character varying, 'REPRICE_UP'::character varying, 'REFORMULATE'::character varying, 'REDUCE_PORTION_COST'::character varying, 'BUNDLE'::character varying, 'REMOVE'::character varying, 'REDESIGN'::character varying, 'REPLACE'::character varying, 'SEASONAL_ONLY'::character varying, 'CONVERT_TO_SPECIAL'::character varying, 'MONITOR'::character varying, 'INVESTIGATE'::character varying, 'ANALYZE'::character varying])::text[]))),
    CONSTRAINT menu_engineering_recommendation_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'IN_PROGRESS'::character varying, 'COMPLETED'::character varying, 'DISMISSED'::character varying, 'DEFERRED'::character varying, 'PENDING_APPROVAL'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying])::text[])))
);

--
-- Name: menu_engineering_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_engineering_settings (
    auto_generate_recommendations boolean,
    email_notifications_enabled boolean,
    food_cost_warning_threshold numeric(38,2) NOT NULL,
    min_contribution_margin numeric(38,2) NOT NULL,
    popularity_threshold_factor numeric(38,2) NOT NULL,
    reminder_days_before integer,
    target_loser_pct numeric(5,2),
    target_winner_pct numeric(5,2),
    winner_margin_threshold numeric(10,2),
    winner_popularity_threshold numeric(5,2),
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    notification_emails character varying(500),
    default_daypart character varying(255),
    restaurant_type character varying(255)
);

--
-- Name: menu_engineering_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menu_engineering_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: menu_engineering_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menu_engineering_settings_id_seq OWNED BY public.menu_engineering_settings.id;

--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.menu_item (
    display_order integer NOT NULL,
    is_active boolean NOT NULL,
    plate_cost numeric(12,2),
    prep_time_minutes integer,
    sell_price numeric(12,2) NOT NULL,
    target_fc_pct numeric(6,4),
    created_at timestamp(6) without time zone NOT NULL,
    group_id bigint NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    image_url character varying(255),
    name character varying(255) NOT NULL,
    pos_id character varying(255) NOT NULL
);

--
-- Name: menu_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.menu_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: menu_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.menu_item_id_seq OWNED BY public.menu_item.id;

--
-- Name: operations_manual_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operations_manual_entry (
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    category character varying(255) NOT NULL,
    content_markdown text NOT NULL,
    title character varying(255) NOT NULL
);

--
-- Name: operations_manual_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.operations_manual_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: operations_manual_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.operations_manual_entry_id_seq OWNED BY public.operations_manual_entry.id;

--
-- Name: order_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_line (
    quantity integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    id bigint NOT NULL,
    menu_item_id bigint NOT NULL,
    order_id bigint NOT NULL
);

--
-- Name: order_line_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: order_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_line_id_seq OWNED BY public.order_line.id;

--
-- Name: outlet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outlet (
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    timezone character varying(255) NOT NULL
);

--
-- Name: outlet_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.outlet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: outlet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.outlet_id_seq OWNED BY public.outlet.id;

--
-- Name: physical_inventory_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.physical_inventory_line (
    counted_qty numeric(12,4),
    expected_qty numeric(12,4),
    variance numeric(12,4),
    id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    period_id bigint NOT NULL,
    updated_at timestamp(6) without time zone
);

--
-- Name: physical_inventory_line_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.physical_inventory_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: physical_inventory_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.physical_inventory_line_id_seq OWNED BY public.physical_inventory_line.id;

--
-- Name: physical_inventory_period; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.physical_inventory_period (
    count_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    finalised_at timestamp(6) without time zone,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    inventory_type character varying(255) NOT NULL,
    period_name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT physical_inventory_period_inventory_type_check CHECK (((inventory_type)::text = ANY ((ARRAY['FOOD'::character varying, 'BAR'::character varying])::text[]))),
    CONSTRAINT physical_inventory_period_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'FINALISED'::character varying])::text[])))
);

--
-- Name: physical_inventory_period_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.physical_inventory_period_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: physical_inventory_period_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.physical_inventory_period_id_seq OWNED BY public.physical_inventory_period.id;

--
-- Name: prime_cost_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prime_cost_report (
    actual_bev_cos numeric(12,2),
    actual_food_cos numeric(12,2),
    beg_inventory_bev numeric(12,2),
    beg_inventory_food numeric(12,2),
    check_average numeric(8,2),
    comps_discounts numeric(12,2),
    end_inventory_bev numeric(12,2),
    end_inventory_food numeric(12,2),
    gross_margin numeric(12,2),
    gross_margin_pct numeric(6,4),
    gross_sales numeric(12,2),
    hourly_labor numeric(12,2),
    labor_cost_per_cover numeric(8,2),
    labor_variance numeric(12,2),
    mgmt_labor numeric(12,2),
    net_sales numeric(12,2),
    payroll_taxes_benefits numeric(12,2),
    prime_cost_gross numeric(12,2),
    prime_cost_gross_pct numeric(6,4),
    prime_cost_net numeric(12,2),
    prime_cost_net_pct numeric(6,4),
    purchases_bev numeric(12,2),
    purchases_food numeric(12,2),
    sales_per_labor_hour numeric(8,2),
    scheduled_labor numeric(12,2),
    shrinkage_variance numeric(12,2),
    shrinkage_variance_pct numeric(6,4),
    theoretical_cos numeric(12,2),
    theoretical_cos_pct numeric(6,4),
    total_actual_cos numeric(12,2),
    total_actual_cos_pct numeric(6,4),
    total_covers integer,
    total_labor numeric(12,2),
    total_labor_pct numeric(6,4),
    week_start_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    status character varying(255) NOT NULL,
    CONSTRAINT prime_cost_report_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'FINALISED'::character varying])::text[])))
);

--
-- Name: prime_cost_report_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prime_cost_report_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: prime_cost_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prime_cost_report_id_seq OWNED BY public.prime_cost_report.id;

--
-- Name: purchase_invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_invoice (
    invoice_amount numeric(12,2) NOT NULL,
    invoice_date date NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    goods_receipt_id bigint,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    supplier_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    invoice_number character varying(255),
    status character varying(255) NOT NULL,
    CONSTRAINT purchase_invoice_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'POSTED'::character varying, 'VOID'::character varying])::text[])))
);

--
-- Name: purchase_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_invoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: purchase_invoice_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_invoice_id_seq OWNED BY public.purchase_invoice.id;

--
-- Name: purchase_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order (
    total_amount numeric(12,2) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    issue_date timestamp(6) without time zone NOT NULL,
    restaurant_id bigint NOT NULL,
    supplier_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    notes text,
    status character varying(255) NOT NULL,
    CONSTRAINT purchase_order_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SENT'::character varying, 'RECEIVED'::character varying, 'PARTIAL'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: purchase_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: purchase_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_id_seq OWNED BY public.purchase_order.id;

--
-- Name: purchase_order_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_line (
    has_conflict boolean NOT NULL,
    ordered_qty numeric(12,3) NOT NULL,
    received_qty numeric(12,3) NOT NULL,
    unit_price numeric(12,4) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    purchase_order_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    conflict_reason text
);

--
-- Name: purchase_order_line_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: purchase_order_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_line_id_seq OWNED BY public.purchase_order_line.id;

--
-- Name: recipe; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe (
    is_active boolean NOT NULL,
    yield_quantity numeric(10,3) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    menu_item_id bigint,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    position_notes character varying(500),
    tools_equipment character varying(500),
    name character varying(255) NOT NULL,
    recipe_type character varying(255) NOT NULL,
    shelf_life character varying(255),
    station character varying(255) NOT NULL,
    yield_unit character varying(255),
    CONSTRAINT recipe_recipe_type_check CHECK (((recipe_type)::text = ANY ((ARRAY['PLATE'::character varying, 'BATCH'::character varying])::text[]))),
    CONSTRAINT recipe_shelf_life_check CHECK (((shelf_life)::text = ANY ((ARRAY['ONE_SHIFT'::character varying, 'ONE_DAY'::character varying, 'TWO_DAYS'::character varying, 'THREE_DAYS'::character varying, 'FOUR_DAYS'::character varying, 'FIVE_DAYS'::character varying, 'SIX_DAYS'::character varying, 'SEVEN_DAYS'::character varying, 'EIGHT_DAYS'::character varying, 'NINE_DAYS'::character varying, 'TEN_DAYS'::character varying])::text[]))),
    CONSTRAINT recipe_station_check CHECK (((station)::text = ANY ((ARRAY['LINE_COOK'::character varying, 'PREP_COOK'::character varying, 'PANTRY'::character varying, 'SOUS_CHEF'::character varying, 'DISHWASHER'::character varying, 'SERVER'::character varying, 'CUSTOM'::character varying, 'SALAD'::character varying, 'FRY'::character varying, 'SAUTE'::character varying, 'GRILL'::character varying, 'OVEN'::character varying, 'BRK'::character varying, 'BAR'::character varying, 'PASS'::character varying, 'WOK'::character varying, 'PLATE'::character varying, 'PASTRY'::character varying])::text[]))),
    CONSTRAINT recipe_yield_unit_check CHECK (((yield_unit)::text = ANY ((ARRAY['OZ_WEIGHT'::character varying, 'OZ_FLUID'::character varying, 'OZ'::character varying, 'LB'::character varying, 'KG'::character varying, 'GRAM'::character varying, 'TSP'::character varying, 'TBSP'::character varying, 'CUP'::character varying, 'PINT'::character varying, 'QUART'::character varying, 'GALLON'::character varying, 'EACH'::character varying, 'BUNCH'::character varying, 'SLICE'::character varying, 'WHOLE'::character varying, 'LITER'::character varying, 'ML'::character varying, 'JAR'::character varying])::text[])))
);

--
-- Name: recipe_build_chart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_build_chart (
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    menu_item_id bigint NOT NULL,
    assembly_notes character varying(1000),
    final_presentation_image_key character varying(255)
);

--
-- Name: recipe_build_chart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_build_chart_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: recipe_build_chart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_build_chart_id_seq OWNED BY public.recipe_build_chart.id;

--
-- Name: recipe_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: recipe_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_id_seq OWNED BY public.recipe.id;

--
-- Name: recipe_ingredient_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_ingredient_line (
    line_number integer NOT NULL,
    quantity_ru numeric(10,4) NOT NULL,
    id bigint NOT NULL,
    ingredient_id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    recipe_unit character varying(255) NOT NULL,
    CONSTRAINT recipe_ingredient_line_recipe_unit_check CHECK (((recipe_unit)::text = ANY ((ARRAY['OZ_WEIGHT'::character varying, 'OZ_FLUID'::character varying, 'OZ'::character varying, 'LB'::character varying, 'KG'::character varying, 'GRAM'::character varying, 'TSP'::character varying, 'TBSP'::character varying, 'CUP'::character varying, 'PINT'::character varying, 'QUART'::character varying, 'GALLON'::character varying, 'EACH'::character varying, 'BUNCH'::character varying, 'SLICE'::character varying, 'WHOLE'::character varying, 'LITER'::character varying, 'ML'::character varying, 'JAR'::character varying])::text[])))
);

--
-- Name: recipe_ingredient_line_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_ingredient_line_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: recipe_ingredient_line_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_ingredient_line_id_seq OWNED BY public.recipe_ingredient_line.id;

--
-- Name: recipe_procedure_step; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_procedure_step (
    is_critical_control_point boolean NOT NULL,
    step_number integer NOT NULL,
    id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    instruction text NOT NULL
);

--
-- Name: recipe_procedure_step_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipe_procedure_step_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: recipe_procedure_step_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipe_procedure_step_id_seq OWNED BY public.recipe_procedure_step.id;

--
-- Name: restaurant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant (
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    name character varying(255) NOT NULL,
    timezone character varying(255) NOT NULL
);

--
-- Name: restaurant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restaurant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: restaurant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restaurant_id_seq OWNED BY public.restaurant.id;

--
-- Name: restaurant_order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.restaurant_order (
    discount_amount numeric(12,2),
    tax_amount numeric(12,2),
    tip_amount numeric(12,2),
    total_amount numeric(12,2),
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    session_id bigint NOT NULL,
    void_employee_id bigint,
    order_number character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    void_reason character varying(255),
    CONSTRAINT restaurant_order_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'PAID'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: restaurant_order_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.restaurant_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: restaurant_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.restaurant_order_id_seq OWNED BY public.restaurant_order.id;

--
-- Name: scheduled_shift; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_shift (
    end_time time(6) without time zone NOT NULL,
    shift_date date NOT NULL,
    start_time time(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    employee_id bigint NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    notes character varying(200),
    station character varying(255),
    CONSTRAINT scheduled_shift_station_check CHECK (((station)::text = ANY ((ARRAY['LINE_COOK'::character varying, 'PREP_COOK'::character varying, 'PANTRY'::character varying, 'SOUS_CHEF'::character varying, 'DISHWASHER'::character varying, 'SERVER'::character varying, 'CUSTOM'::character varying])::text[])))
);

--
-- Name: scheduled_shift_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.scheduled_shift_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: scheduled_shift_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.scheduled_shift_id_seq OWNED BY public.scheduled_shift.id;

--
-- Name: shopro_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopro_users (
    failed_login_attempts integer,
    is_active boolean,
    is_super_admin boolean,
    mfa_enabled boolean,
    require_password_change boolean,
    created_at timestamp(6) without time zone,
    last_login_at timestamp(6) without time zone,
    locked_until timestamp(6) without time zone,
    password_changed_at timestamp(6) without time zone,
    refresh_token_expires_at timestamp(6) without time zone,
    restaurant_id bigint,
    updated_at timestamp(6) without time zone,
    shopro_id uuid NOT NULL,
    avatar_url character varying(255),
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    last_login_ip character varying(255),
    mfa_secret character varying(255),
    password_hash character varying(255) NOT NULL,
    phone character varying(255),
    refresh_token_hash character varying(255),
    username character varying(255) NOT NULL,
    permissions jsonb
);

--
-- Name: staff; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff (
    can_manage_tables boolean,
    can_process_payments boolean,
    can_take_orders boolean,
    can_view_reports boolean,
    failed_pin_attempts integer,
    hourly_rate numeric(12,2),
    is_active boolean,
    pin_length integer NOT NULL,
    shift_active boolean,
    created_at timestamp(6) without time zone,
    last_login_at timestamp(6) without time zone,
    locked_until timestamp(6) without time zone,
    restaurant_id bigint NOT NULL,
    termination_date timestamp(6) without time zone,
    updated_at timestamp(6) without time zone,
    staff_id uuid NOT NULL,
    device_fingerprint character varying(255),
    display_name character varying(255) NOT NULL,
    last_login_ip character varying(255),
    pin_hash character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    CONSTRAINT staff_role_check CHECK (((role)::text = ANY ((ARRAY['OWNER'::character varying, 'MANAGER'::character varying, 'GENERAL_MANAGER'::character varying, 'ASSISTANT_MANAGER'::character varying, 'FB_MANAGER'::character varying, 'KITCHEN_MANAGER'::character varying, 'EXECUTIVE_CHEF'::character varying, 'SOUS_CHEF'::character varying, 'CHEF_DE_PARTIE'::character varying, 'LINE_COOK'::character varying, 'PREP_COOK'::character varying, 'DISHWASHER'::character varying, 'MAITRE_D'::character varying, 'HOST'::character varying, 'BARTENDER'::character varying, 'BUSSER'::character varying, 'RUNNER'::character varying, 'SENIOR_SERVER'::character varying, 'JUNIOR_SERVER'::character varying])::text[])))
);

--
-- Name: staff_compensation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_compensation (
    base_hourly_rate numeric(12,2) NOT NULL,
    holiday_rate numeric(12,2),
    overtime_rate numeric(12,2),
    standard_weekly_hours integer,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    compensation_id uuid NOT NULL,
    staff_id uuid NOT NULL
);

--
-- Name: staff_shift; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.staff_shift (
    is_active boolean,
    clock_in timestamp(6) without time zone NOT NULL,
    clock_out timestamp(6) without time zone,
    created_at timestamp(6) without time zone,
    duration_minutes bigint,
    restaurant_id bigint NOT NULL,
    shift_id uuid NOT NULL,
    staff_id uuid NOT NULL
);

--
-- Name: station_routing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.station_routing (
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    station_id bigint NOT NULL,
    label character varying(255),
    routing_key character varying(255) NOT NULL,
    routing_type character varying(255) NOT NULL,
    CONSTRAINT station_routing_routing_type_check CHECK (((routing_type)::text = ANY ((ARRAY['MENU_ITEM_ID'::character varying, 'PLU'::character varying, 'CATEGORY'::character varying])::text[])))
);

--
-- Name: station_routing_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.station_routing_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: station_routing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.station_routing_id_seq OWNED BY public.station_routing.id;

--
-- Name: station_ticket_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.station_ticket_item (
    prep_time_seconds integer,
    bumped_at timestamp(6) without time zone,
    bumped_by_device_id bigint,
    created_at timestamp(6) without time zone,
    id bigint NOT NULL,
    recalled_at timestamp(6) without time zone,
    started_at timestamp(6) without time zone,
    station_id bigint NOT NULL,
    ticket_item_id bigint NOT NULL,
    status character varying(255) NOT NULL,
    CONSTRAINT station_ticket_item_status_check CHECK (((status)::text = ANY ((ARRAY['NEW'::character varying, 'IN_PROGRESS'::character varying, 'DONE'::character varying, 'VOIDED'::character varying, 'RECALLED'::character varying])::text[])))
);

--
-- Name: station_ticket_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.station_ticket_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: station_ticket_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.station_ticket_item_id_seq OWNED BY public.station_ticket_item.id;

--
-- Name: supplier; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplier (
    is_active boolean NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone,
    account_number character varying(255),
    contact_name character varying(255),
    email character varying(255),
    name character varying(255) NOT NULL,
    phone character varying(255)
);

--
-- Name: supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supplier_id_seq OWNED BY public.supplier.id;

--
-- Name: table_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.table_session (
    guest_count integer NOT NULL,
    closed_at timestamp(6) without time zone,
    id bigint NOT NULL,
    opened_at timestamp(6) without time zone NOT NULL,
    restaurant_id bigint NOT NULL,
    table_id bigint NOT NULL,
    guest_id uuid,
    server_name character varying(255),
    server_role character varying(255)
);

--
-- Name: table_session_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.table_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: table_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.table_session_id_seq OWNED BY public.table_session.id;

--
-- Name: waitlist_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.waitlist_entry (
    party_size integer NOT NULL,
    quoted_wait_mins integer,
    abandoned_at timestamp(6) without time zone,
    id bigint NOT NULL,
    joined_at timestamp(6) without time zone NOT NULL,
    restaurant_id bigint NOT NULL,
    seated_at timestamp(6) without time zone,
    guest_name character varying(255) NOT NULL,
    phone_number character varying(255),
    status character varying(255),
    CONSTRAINT waitlist_entry_status_check CHECK (((status)::text = ANY ((ARRAY['WAITING'::character varying, 'SEATED'::character varying, 'ABANDONED'::character varying, 'CANCELLED'::character varying])::text[])))
);

--
-- Name: waitlist_entry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.waitlist_entry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: waitlist_entry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.waitlist_entry_id_seq OWNED BY public.waitlist_entry.id;

--
-- Name: weekly_budget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_budget (
    benefits_rate numeric(5,4),
    bev_cos_pct_target numeric(5,4),
    bottle_beer_sales_pct numeric(5,4),
    comps_pct numeric(5,4),
    draft_beer_sales_pct numeric(5,4),
    fixed_costs numeric(12,2),
    food_cos_pct_target numeric(5,4),
    food_sales_pct numeric(5,4),
    hourly_labor_pct_target numeric(5,4),
    liquor_sales_pct numeric(5,4),
    mgmt_labor_pct_target numeric(5,4),
    soft_bev_sales_pct numeric(5,4),
    total_sales_forecast numeric(12,2),
    week_start_date date NOT NULL,
    wine_sales_pct numeric(5,4),
    created_at timestamp(6) without time zone NOT NULL,
    id bigint NOT NULL,
    restaurant_id bigint NOT NULL,
    updated_at timestamp(6) without time zone
);

--
-- Name: weekly_budget_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.weekly_budget_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- Name: weekly_budget_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.weekly_budget_id_seq OWNED BY public.weekly_budget.id;

--
-- Name: audit_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log ALTER COLUMN id SET DEFAULT nextval('public.audit_log_id_seq'::regclass);

--
-- Name: banquet_event_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banquet_event_order ALTER COLUMN id SET DEFAULT nextval('public.banquet_event_order_id_seq'::regclass);

--
-- Name: build_chart_line id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.build_chart_line ALTER COLUMN id SET DEFAULT nextval('public.build_chart_line_id_seq'::regclass);

--
-- Name: daily_sales_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_entry ALTER COLUMN id SET DEFAULT nextval('public.daily_sales_entry_id_seq'::regclass);

--
-- Name: dining_table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_table ALTER COLUMN id SET DEFAULT nextval('public.dining_table_id_seq'::regclass);

--
-- Name: employee id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee ALTER COLUMN id SET DEFAULT nextval('public.employee_id_seq'::regclass);

--
-- Name: employee_attendance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_attendance ALTER COLUMN id SET DEFAULT nextval('public.employee_attendance_id_seq'::regclass);

--
-- Name: employee_labor_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_labor_record ALTER COLUMN id SET DEFAULT nextval('public.employee_labor_record_id_seq'::regclass);

--
-- Name: goods_receipt id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt ALTER COLUMN id SET DEFAULT nextval('public.goods_receipt_id_seq'::regclass);

--
-- Name: guest_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_feedback ALTER COLUMN id SET DEFAULT nextval('public.guest_feedback_id_seq'::regclass);

--
-- Name: haccp_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.haccp_log ALTER COLUMN id SET DEFAULT nextval('public.haccp_log_id_seq'::regclass);

--
-- Name: ingredient id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient ALTER COLUMN id SET DEFAULT nextval('public.ingredient_id_seq'::regclass);

--
-- Name: inventory_active_lot id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot ALTER COLUMN id SET DEFAULT nextval('public.inventory_active_lot_id_seq'::regclass);

--
-- Name: inventory_ingredient_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ingredient_ledger ALTER COLUMN id SET DEFAULT nextval('public.inventory_ingredient_ledger_id_seq'::regclass);

--
-- Name: inventory_waste_registry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_waste_registry ALTER COLUMN id SET DEFAULT nextval('public.inventory_waste_registry_id_seq'::regclass);

--
-- Name: kds_daily_stats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_daily_stats ALTER COLUMN id SET DEFAULT nextval('public.kds_daily_stats_id_seq'::regclass);

--
-- Name: kds_device id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_device ALTER COLUMN id SET DEFAULT nextval('public.kds_device_id_seq'::regclass);

--
-- Name: kds_event_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_event_log ALTER COLUMN id SET DEFAULT nextval('public.kds_event_log_id_seq'::regclass);

--
-- Name: kds_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_settings ALTER COLUMN id SET DEFAULT nextval('public.kds_settings_id_seq'::regclass);

--
-- Name: kds_station id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_station ALTER COLUMN id SET DEFAULT nextval('public.kds_station_id_seq'::regclass);

--
-- Name: kds_ticket id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_ticket ALTER COLUMN id SET DEFAULT nextval('public.kds_ticket_id_seq'::regclass);

--
-- Name: kds_ticket_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_ticket_item ALTER COLUMN id SET DEFAULT nextval('public.kds_ticket_item_id_seq'::regclass);

--
-- Name: menu_cost_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_cost_group ALTER COLUMN id SET DEFAULT nextval('public.menu_cost_group_id_seq'::regclass);

--
-- Name: menu_engineering_period id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_period ALTER COLUMN id SET DEFAULT nextval('public.menu_engineering_period_id_seq'::regclass);

--
-- Name: menu_engineering_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_settings ALTER COLUMN id SET DEFAULT nextval('public.menu_engineering_settings_id_seq'::regclass);

--
-- Name: menu_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item ALTER COLUMN id SET DEFAULT nextval('public.menu_item_id_seq'::regclass);

--
-- Name: operations_manual_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operations_manual_entry ALTER COLUMN id SET DEFAULT nextval('public.operations_manual_entry_id_seq'::regclass);

--
-- Name: order_line id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line ALTER COLUMN id SET DEFAULT nextval('public.order_line_id_seq'::regclass);

--
-- Name: outlet id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outlet ALTER COLUMN id SET DEFAULT nextval('public.outlet_id_seq'::regclass);

--
-- Name: physical_inventory_line id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_line ALTER COLUMN id SET DEFAULT nextval('public.physical_inventory_line_id_seq'::regclass);

--
-- Name: physical_inventory_period id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_period ALTER COLUMN id SET DEFAULT nextval('public.physical_inventory_period_id_seq'::regclass);

--
-- Name: prime_cost_report id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prime_cost_report ALTER COLUMN id SET DEFAULT nextval('public.prime_cost_report_id_seq'::regclass);

--
-- Name: purchase_invoice id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice ALTER COLUMN id SET DEFAULT nextval('public.purchase_invoice_id_seq'::regclass);

--
-- Name: purchase_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_id_seq'::regclass);

--
-- Name: purchase_order_line id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_line_id_seq'::regclass);

--
-- Name: recipe id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe ALTER COLUMN id SET DEFAULT nextval('public.recipe_id_seq'::regclass);

--
-- Name: recipe_build_chart id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_build_chart ALTER COLUMN id SET DEFAULT nextval('public.recipe_build_chart_id_seq'::regclass);

--
-- Name: recipe_ingredient_line id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredient_line ALTER COLUMN id SET DEFAULT nextval('public.recipe_ingredient_line_id_seq'::regclass);

--
-- Name: recipe_procedure_step id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_procedure_step ALTER COLUMN id SET DEFAULT nextval('public.recipe_procedure_step_id_seq'::regclass);

--
-- Name: restaurant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant ALTER COLUMN id SET DEFAULT nextval('public.restaurant_id_seq'::regclass);

--
-- Name: restaurant_order id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order ALTER COLUMN id SET DEFAULT nextval('public.restaurant_order_id_seq'::regclass);

--
-- Name: scheduled_shift id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shift ALTER COLUMN id SET DEFAULT nextval('public.scheduled_shift_id_seq'::regclass);

--
-- Name: station_routing id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_routing ALTER COLUMN id SET DEFAULT nextval('public.station_routing_id_seq'::regclass);

--
-- Name: station_ticket_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_ticket_item ALTER COLUMN id SET DEFAULT nextval('public.station_ticket_item_id_seq'::regclass);

--
-- Name: supplier id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier ALTER COLUMN id SET DEFAULT nextval('public.supplier_id_seq'::regclass);

--
-- Name: table_session id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_session ALTER COLUMN id SET DEFAULT nextval('public.table_session_id_seq'::regclass);

--
-- Name: waitlist_entry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entry ALTER COLUMN id SET DEFAULT nextval('public.waitlist_entry_id_seq'::regclass);

--
-- Name: weekly_budget id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_budget ALTER COLUMN id SET DEFAULT nextval('public.weekly_budget_id_seq'::regclass);

--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);

--
-- Name: auth_audit auth_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth_audit
    ADD CONSTRAINT auth_audit_pkey PRIMARY KEY (audit_id);

--
-- Name: banquet_event_order banquet_event_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banquet_event_order
    ADD CONSTRAINT banquet_event_order_pkey PRIMARY KEY (id);

--
-- Name: build_chart_line build_chart_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.build_chart_line
    ADD CONSTRAINT build_chart_line_pkey PRIMARY KEY (id);

--
-- Name: daily_sales_entry daily_sales_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_entry
    ADD CONSTRAINT daily_sales_entry_pkey PRIMARY KEY (id);

--
-- Name: daily_sales_entry daily_sales_entry_restaurant_id_sales_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_entry
    ADD CONSTRAINT daily_sales_entry_restaurant_id_sales_date_key UNIQUE (restaurant_id, sales_date);

--
-- Name: dining_table dining_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_table
    ADD CONSTRAINT dining_table_pkey PRIMARY KEY (id);

--
-- Name: dining_table dining_table_restaurant_id_table_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_table
    ADD CONSTRAINT dining_table_restaurant_id_table_number_key UNIQUE (restaurant_id, table_number);

--
-- Name: employee_attendance employee_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT employee_attendance_pkey PRIMARY KEY (id);

--
-- Name: employee_labor_record employee_labor_record_employee_id_week_start_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_labor_record
    ADD CONSTRAINT employee_labor_record_employee_id_week_start_date_key UNIQUE (employee_id, week_start_date);

--
-- Name: employee_labor_record employee_labor_record_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_labor_record
    ADD CONSTRAINT employee_labor_record_pkey PRIMARY KEY (id);

--
-- Name: employee employee_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_pkey PRIMARY KEY (id);

--
-- Name: employee employee_restaurant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT employee_restaurant_id_name_key UNIQUE (restaurant_id, name);

--
-- Name: experiment_events experiment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_events
    ADD CONSTRAINT experiment_events_pkey PRIMARY KEY (id);

--
-- Name: experiment_metrics experiment_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_metrics
    ADD CONSTRAINT experiment_metrics_pkey PRIMARY KEY (id);

--
-- Name: experiment_variants experiment_variants_experiment_id_variant_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_variants
    ADD CONSTRAINT experiment_variants_experiment_id_variant_key_key UNIQUE (experiment_id, variant_key);

--
-- Name: experiment_variants experiment_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_variants
    ADD CONSTRAINT experiment_variants_pkey PRIMARY KEY (id);

--
-- Name: experiments experiments_experiment_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_experiment_key_key UNIQUE (experiment_key);

--
-- Name: experiments experiments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT experiments_pkey PRIMARY KEY (id);

--
-- Name: goods_receipt goods_receipt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt
    ADD CONSTRAINT goods_receipt_pkey PRIMARY KEY (id);

--
-- Name: guest_experiment_assignments guest_experiment_assignments_guest_id_experiment_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_experiment_assignments
    ADD CONSTRAINT guest_experiment_assignments_guest_id_experiment_id_key UNIQUE (guest_id, experiment_id);

--
-- Name: guest_experiment_assignments guest_experiment_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_experiment_assignments
    ADD CONSTRAINT guest_experiment_assignments_pkey PRIMARY KEY (id);

--
-- Name: guest_feedback guest_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_feedback
    ADD CONSTRAINT guest_feedback_pkey PRIMARY KEY (id);

--
-- Name: guest_oauth_accounts guest_oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_oauth_accounts
    ADD CONSTRAINT guest_oauth_accounts_pkey PRIMARY KEY (oauth_id);

--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (guest_id);

--
-- Name: haccp_log haccp_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.haccp_log
    ADD CONSTRAINT haccp_log_pkey PRIMARY KEY (id);

--
-- Name: ingredient ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT ingredient_pkey PRIMARY KEY (id);

--
-- Name: ingredient ingredient_restaurant_id_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT ingredient_restaurant_id_item_code_key UNIQUE (restaurant_id, item_code);

--
-- Name: inventory_active_lot inventory_active_lot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot
    ADD CONSTRAINT inventory_active_lot_pkey PRIMARY KEY (id);

--
-- Name: inventory_ingredient_ledger inventory_ingredient_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ingredient_ledger
    ADD CONSTRAINT inventory_ingredient_ledger_pkey PRIMARY KEY (id);

--
-- Name: inventory_waste_registry inventory_waste_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_waste_registry
    ADD CONSTRAINT inventory_waste_registry_pkey PRIMARY KEY (id);

--
-- Name: kds_daily_stats kds_daily_stats_outlet_id_station_id_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_daily_stats
    ADD CONSTRAINT kds_daily_stats_outlet_id_station_id_stat_date_key UNIQUE (outlet_id, station_id, stat_date);

--
-- Name: kds_daily_stats kds_daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_daily_stats
    ADD CONSTRAINT kds_daily_stats_pkey PRIMARY KEY (id);

--
-- Name: kds_device kds_device_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_device
    ADD CONSTRAINT kds_device_pkey PRIMARY KEY (id);

--
-- Name: kds_event_log kds_event_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_event_log
    ADD CONSTRAINT kds_event_log_pkey PRIMARY KEY (id);

--
-- Name: kds_settings kds_settings_outlet_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_settings
    ADD CONSTRAINT kds_settings_outlet_id_key UNIQUE (outlet_id);

--
-- Name: kds_settings kds_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_settings
    ADD CONSTRAINT kds_settings_pkey PRIMARY KEY (id);

--
-- Name: kds_station kds_station_outlet_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_station
    ADD CONSTRAINT kds_station_outlet_id_name_key UNIQUE (outlet_id, name);

--
-- Name: kds_station kds_station_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_station
    ADD CONSTRAINT kds_station_pkey PRIMARY KEY (id);

--
-- Name: kds_ticket_item kds_ticket_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_ticket_item
    ADD CONSTRAINT kds_ticket_item_pkey PRIMARY KEY (id);

--
-- Name: kds_ticket kds_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_ticket
    ADD CONSTRAINT kds_ticket_pkey PRIMARY KEY (id);

--
-- Name: menu_cost_group menu_cost_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_cost_group
    ADD CONSTRAINT menu_cost_group_pkey PRIMARY KEY (id);

--
-- Name: menu_cost_group menu_cost_group_restaurant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_cost_group
    ADD CONSTRAINT menu_cost_group_restaurant_id_name_key UNIQUE (restaurant_id, name);

--
-- Name: menu_engineering_period menu_engineering_period_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_period
    ADD CONSTRAINT menu_engineering_period_pkey PRIMARY KEY (id);

--
-- Name: menu_engineering_recommendation menu_engineering_recommendation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_recommendation
    ADD CONSTRAINT menu_engineering_recommendation_pkey PRIMARY KEY (id);

--
-- Name: menu_engineering_settings menu_engineering_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_settings
    ADD CONSTRAINT menu_engineering_settings_pkey PRIMARY KEY (id);

--
-- Name: menu_engineering_settings menu_engineering_settings_restaurant_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_settings
    ADD CONSTRAINT menu_engineering_settings_restaurant_id_key UNIQUE (restaurant_id);

--
-- Name: menu_item menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);

--
-- Name: menu_item menu_item_restaurant_id_pos_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_restaurant_id_pos_id_key UNIQUE (restaurant_id, pos_id);

--
-- Name: operations_manual_entry operations_manual_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operations_manual_entry
    ADD CONSTRAINT operations_manual_entry_pkey PRIMARY KEY (id);

--
-- Name: order_line order_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line
    ADD CONSTRAINT order_line_pkey PRIMARY KEY (id);

--
-- Name: outlet outlet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outlet
    ADD CONSTRAINT outlet_pkey PRIMARY KEY (id);

--
-- Name: outlet outlet_restaurant_id_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outlet
    ADD CONSTRAINT outlet_restaurant_id_slug_key UNIQUE (restaurant_id, slug);

--
-- Name: physical_inventory_line physical_inventory_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_line
    ADD CONSTRAINT physical_inventory_line_pkey PRIMARY KEY (id);

--
-- Name: physical_inventory_period physical_inventory_period_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_period
    ADD CONSTRAINT physical_inventory_period_pkey PRIMARY KEY (id);

--
-- Name: prime_cost_report prime_cost_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prime_cost_report
    ADD CONSTRAINT prime_cost_report_pkey PRIMARY KEY (id);

--
-- Name: prime_cost_report prime_cost_report_restaurant_id_week_start_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prime_cost_report
    ADD CONSTRAINT prime_cost_report_restaurant_id_week_start_date_key UNIQUE (restaurant_id, week_start_date);

--
-- Name: purchase_invoice purchase_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice
    ADD CONSTRAINT purchase_invoice_pkey PRIMARY KEY (id);

--
-- Name: purchase_order_line purchase_order_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT purchase_order_line_pkey PRIMARY KEY (id);

--
-- Name: purchase_order purchase_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey PRIMARY KEY (id);

--
-- Name: recipe_build_chart recipe_build_chart_menu_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_build_chart
    ADD CONSTRAINT recipe_build_chart_menu_item_id_key UNIQUE (menu_item_id);

--
-- Name: recipe_build_chart recipe_build_chart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_build_chart
    ADD CONSTRAINT recipe_build_chart_pkey PRIMARY KEY (id);

--
-- Name: recipe_ingredient_line recipe_ingredient_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredient_line
    ADD CONSTRAINT recipe_ingredient_line_pkey PRIMARY KEY (id);

--
-- Name: recipe recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_pkey PRIMARY KEY (id);

--
-- Name: recipe_procedure_step recipe_procedure_step_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_procedure_step
    ADD CONSTRAINT recipe_procedure_step_pkey PRIMARY KEY (id);

--
-- Name: recipe recipe_restaurant_id_name_menu_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_restaurant_id_name_menu_item_id_key UNIQUE (restaurant_id, name, menu_item_id);

--
-- Name: restaurant_order restaurant_order_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order
    ADD CONSTRAINT restaurant_order_order_number_key UNIQUE (order_number);

--
-- Name: restaurant_order restaurant_order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order
    ADD CONSTRAINT restaurant_order_pkey PRIMARY KEY (id);

--
-- Name: restaurant_order restaurant_order_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order
    ADD CONSTRAINT restaurant_order_session_id_key UNIQUE (session_id);

--
-- Name: restaurant restaurant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant
    ADD CONSTRAINT restaurant_pkey PRIMARY KEY (id);

--
-- Name: scheduled_shift scheduled_shift_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shift
    ADD CONSTRAINT scheduled_shift_pkey PRIMARY KEY (id);

--
-- Name: shopro_users shopro_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopro_users
    ADD CONSTRAINT shopro_users_email_key UNIQUE (email);

--
-- Name: shopro_users shopro_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopro_users
    ADD CONSTRAINT shopro_users_pkey PRIMARY KEY (shopro_id);

--
-- Name: shopro_users shopro_users_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shopro_users
    ADD CONSTRAINT shopro_users_username_key UNIQUE (username);

--
-- Name: staff_compensation staff_compensation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_compensation
    ADD CONSTRAINT staff_compensation_pkey PRIMARY KEY (compensation_id);

--
-- Name: staff_compensation staff_compensation_staff_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_compensation
    ADD CONSTRAINT staff_compensation_staff_id_key UNIQUE (staff_id);

--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (staff_id);

--
-- Name: staff_shift staff_shift_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_shift
    ADD CONSTRAINT staff_shift_pkey PRIMARY KEY (shift_id);

--
-- Name: station_routing station_routing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_routing
    ADD CONSTRAINT station_routing_pkey PRIMARY KEY (id);

--
-- Name: station_ticket_item station_ticket_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_ticket_item
    ADD CONSTRAINT station_ticket_item_pkey PRIMARY KEY (id);

--
-- Name: station_ticket_item station_ticket_item_ticket_item_id_station_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_ticket_item
    ADD CONSTRAINT station_ticket_item_ticket_item_id_station_id_key UNIQUE (ticket_item_id, station_id);

--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);

--
-- Name: supplier supplier_restaurant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_restaurant_id_name_key UNIQUE (restaurant_id, name);

--
-- Name: table_session table_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_session
    ADD CONSTRAINT table_session_pkey PRIMARY KEY (id);

--
-- Name: waitlist_entry waitlist_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT waitlist_entry_pkey PRIMARY KEY (id);

--
-- Name: weekly_budget weekly_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_budget
    ADD CONSTRAINT weekly_budget_pkey PRIMARY KEY (id);

--
-- Name: weekly_budget weekly_budget_restaurant_id_week_start_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_budget
    ADD CONSTRAINT weekly_budget_restaurant_id_week_start_date_key UNIQUE (restaurant_id, week_start_date);

--
-- Name: idx_attend_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_attend_active ON public.employee_attendance USING btree (employee_id, status);

--
-- Name: idx_audit_log_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log USING btree (action);

--
-- Name: idx_audit_log_entity_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_log_entity_name ON public.audit_log USING btree (entity_name);

--
-- Name: idx_audit_log_timestamp; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log USING btree ("timestamp");

--
-- Name: idx_audit_log_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_audit_log_username ON public.audit_log USING btree (username);

--
-- Name: idx_kds_event_outlet_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_kds_event_outlet_time ON public.kds_event_log USING btree (outlet_id, occurred_at DESC);

--
-- Name: idx_labor_res_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_labor_res_week ON public.employee_labor_record USING btree (restaurant_id, week_start_date);

--
-- Name: idx_mep_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_mep_restaurant ON public.menu_engineering_period USING btree (restaurant_id);

--
-- Name: idx_pcr_res_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_pcr_res_week ON public.prime_cost_report USING btree (restaurant_id, week_start_date);

--
-- Name: idx_pil_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_pil_period ON public.physical_inventory_line USING btree (period_id);

--
-- Name: idx_pip_restaurant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_pip_restaurant ON public.physical_inventory_period USING btree (restaurant_id);

--
-- Name: idx_sales_res_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_sales_res_date ON public.daily_sales_entry USING btree (restaurant_id, sales_date);

--
-- Name: idx_shift_res_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX IF NOT EXISTS idx_shift_res_date ON public.scheduled_shift USING btree (restaurant_id, shift_date);

--
-- Name: build_chart_line fk1odabesyxmbua36ff8nn7t8w7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.build_chart_line
    ADD CONSTRAINT fk1odabesyxmbua36ff8nn7t8w7 FOREIGN KEY (build_chart_id) REFERENCES public.recipe_build_chart(id);

--
-- Name: recipe_procedure_step fk1qh89klu4k1jho34n0ry1howo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_procedure_step
    ADD CONSTRAINT fk1qh89klu4k1jho34n0ry1howo FOREIGN KEY (recipe_id) REFERENCES public.recipe(id);

--
-- Name: purchase_order_line fk210t80fsgdi4s4g7tlg9vdgkd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT fk210t80fsgdi4s4g7tlg9vdgkd FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(id);

--
-- Name: employee_labor_record fk2abuhe9ptufdfkhhiasxsu8xr; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_labor_record
    ADD CONSTRAINT fk2abuhe9ptufdfkhhiasxsu8xr FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: guest_experiment_assignments fk2ghjv0tob2v5mscqc112n693y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_experiment_assignments
    ADD CONSTRAINT fk2ghjv0tob2v5mscqc112n693y FOREIGN KEY (guest_id) REFERENCES public.guests(guest_id);

--
-- Name: physical_inventory_period fk3aq98376bc9kxw1dda5sdik70; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_period
    ADD CONSTRAINT fk3aq98376bc9kxw1dda5sdik70 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: inventory_active_lot fk3h3w1p84j2qlseyi078g7mc0m; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot
    ADD CONSTRAINT fk3h3w1p84j2qlseyi078g7mc0m FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id);

--
-- Name: menu_engineering_settings fk3s96soiyg2stnoib8d4wn0cnl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_settings
    ADD CONSTRAINT fk3s96soiyg2stnoib8d4wn0cnl FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: kds_station fk45uube64pm6irfxns24x1w9by; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_station
    ADD CONSTRAINT fk45uube64pm6irfxns24x1w9by FOREIGN KEY (outlet_id) REFERENCES public.outlet(id);

--
-- Name: restaurant_order fk4a4c6bxp0ww8rtp8dj6cq92i5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order
    ADD CONSTRAINT fk4a4c6bxp0ww8rtp8dj6cq92i5 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: employee_attendance fk4etfn1lxqdotj4i1kkjfayrec; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT fk4etfn1lxqdotj4i1kkjfayrec FOREIGN KEY (employee_id) REFERENCES public.employee(id);

--
-- Name: dining_table fk4mid64p7bx9e0pymsbvfa5ki7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dining_table
    ADD CONSTRAINT fk4mid64p7bx9e0pymsbvfa5ki7 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: station_ticket_item fk4sfcwht8ktrnemdumg8y4ld33; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_ticket_item
    ADD CONSTRAINT fk4sfcwht8ktrnemdumg8y4ld33 FOREIGN KEY (ticket_item_id) REFERENCES public.kds_ticket_item(id);

--
-- Name: purchase_order fk4traogu3jriq9u7e8rvm86k7i; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fk4traogu3jriq9u7e8rvm86k7i FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);

--
-- Name: menu_engineering_period fk5dstmsra9sykj5fquo52b6oca; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_engineering_period
    ADD CONSTRAINT fk5dstmsra9sykj5fquo52b6oca FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: employee_attendance fk5m05y4j0534e1ofdlne7qyurb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_attendance
    ADD CONSTRAINT fk5m05y4j0534e1ofdlne7qyurb FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: supplier fk6icqame0pwjqlkb0t513dngj8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT fk6icqame0pwjqlkb0t513dngj8 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: recipe_ingredient_line fk70derpg89txr07u1qgk1ek1m1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredient_line
    ADD CONSTRAINT fk70derpg89txr07u1qgk1ek1m1 FOREIGN KEY (recipe_id) REFERENCES public.recipe(id);

--
-- Name: scheduled_shift fk7hlu7e98pq9tjdpkvd8r55r0t; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shift
    ADD CONSTRAINT fk7hlu7e98pq9tjdpkvd8r55r0t FOREIGN KEY (employee_id) REFERENCES public.employee(id);

--
-- Name: station_ticket_item fk7u4e2lkr3nellsq415t6evd9u; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_ticket_item
    ADD CONSTRAINT fk7u4e2lkr3nellsq415t6evd9u FOREIGN KEY (station_id) REFERENCES public.kds_station(id);

--
-- Name: employee fk7v8v03ymb3dp2vo4g4umno5tg; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee
    ADD CONSTRAINT fk7v8v03ymb3dp2vo4g4umno5tg FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: experiment_metrics fk7yeha5eipch30k33ps7vga00; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_metrics
    ADD CONSTRAINT fk7yeha5eipch30k33ps7vga00 FOREIGN KEY (variant_id) REFERENCES public.experiment_variants(id);

--
-- Name: recipe fk83y05y1clk76nvrt8q85a74xa; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT fk83y05y1clk76nvrt8q85a74xa FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: kds_device fk86yc6yi1iybrr7hqrpo1gwq5d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_device
    ADD CONSTRAINT fk86yc6yi1iybrr7hqrpo1gwq5d FOREIGN KEY (station_id) REFERENCES public.kds_station(id);

--
-- Name: experiment_events fk88ervxvql84nk14dbh1yacvnx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_events
    ADD CONSTRAINT fk88ervxvql84nk14dbh1yacvnx FOREIGN KEY (experiment_id) REFERENCES public.experiments(id);

--
-- Name: purchase_order_line fk8mfs2cquexf1h0qhi6d1jg8sj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT fk8mfs2cquexf1h0qhi6d1jg8sj FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id);

--
-- Name: inventory_ingredient_ledger fk952jppj4rb5xgn07vqdlq1ir9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ingredient_ledger
    ADD CONSTRAINT fk952jppj4rb5xgn07vqdlq1ir9 FOREIGN KEY (lot_id) REFERENCES public.inventory_active_lot(id);

--
-- Name: haccp_log fk9doyprp23x0x154mvnpep0xh1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.haccp_log
    ADD CONSTRAINT fk9doyprp23x0x154mvnpep0xh1 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: purchase_invoice fk9o2wjysyul5j27hl1jvy189ku; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice
    ADD CONSTRAINT fk9o2wjysyul5j27hl1jvy189ku FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: inventory_active_lot fka29qubo8m7b5e917tlr95iosh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot
    ADD CONSTRAINT fka29qubo8m7b5e917tlr95iosh FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: waitlist_entry fkagkv69fp4d26awj18lx2d7wat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT fkagkv69fp4d26awj18lx2d7wat FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: guest_experiment_assignments fkbavxxxsx9c6e90kq0uvgibny6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_experiment_assignments
    ADD CONSTRAINT fkbavxxxsx9c6e90kq0uvgibny6 FOREIGN KEY (variant_id) REFERENCES public.experiment_variants(id);

--
-- Name: recipe_build_chart fkc864fyxotu15kvyllqt27t5tc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_build_chart
    ADD CONSTRAINT fkc864fyxotu15kvyllqt27t5tc FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);

--
-- Name: inventory_ingredient_ledger fkcgevgf9ro5ii55k38ja4twmxu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ingredient_ledger
    ADD CONSTRAINT fkcgevgf9ro5ii55k38ja4twmxu FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: employee_labor_record fkchnyws8uu5rdy6ms1kpl18ko1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_labor_record
    ADD CONSTRAINT fkchnyws8uu5rdy6ms1kpl18ko1 FOREIGN KEY (employee_id) REFERENCES public.employee(id);

--
-- Name: menu_cost_group fkcx3d1wvnp4sjy686vderx3ste; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_cost_group
    ADD CONSTRAINT fkcx3d1wvnp4sjy686vderx3ste FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: experiment_metrics fkd1pei04fuccpw2sfatx8r2gu5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_metrics
    ADD CONSTRAINT fkd1pei04fuccpw2sfatx8r2gu5 FOREIGN KEY (experiment_id) REFERENCES public.experiments(id);

--
-- Name: recipe fkd3f7vl4cki6sg8u6gbabs2oov; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT fkd3f7vl4cki6sg8u6gbabs2oov FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);

--
-- Name: menu_item fkd833yuo6tyxr2vc0j23udlia9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT fkd833yuo6tyxr2vc0j23udlia9 FOREIGN KEY (group_id) REFERENCES public.menu_cost_group(id);

--
-- Name: inventory_ingredient_ledger fkdgwswhcwutyd6a205qw3gc7p3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_ingredient_ledger
    ADD CONSTRAINT fkdgwswhcwutyd6a205qw3gc7p3 FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id);

--
-- Name: table_session fkdjnfq9eh557jrv0l6c1kxf595; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_session
    ADD CONSTRAINT fkdjnfq9eh557jrv0l6c1kxf595 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: recipe_ingredient_line fke6ma9oyesqolv85hkawe618ah; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_ingredient_line
    ADD CONSTRAINT fke6ma9oyesqolv85hkawe618ah FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id);

--
-- Name: operations_manual_entry fke8xslhgpwdumgf3br3hy6pp4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operations_manual_entry
    ADD CONSTRAINT fke8xslhgpwdumgf3br3hy6pp4a FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: menu_item fkewir7fwbqeuvrnk6c0aa2d2wu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT fkewir7fwbqeuvrnk6c0aa2d2wu FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: station_routing fkf0v70gpdbnvftbdeqk6ungipl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.station_routing
    ADD CONSTRAINT fkf0v70gpdbnvftbdeqk6ungipl FOREIGN KEY (station_id) REFERENCES public.kds_station(id);

--
-- Name: goods_receipt fkfe9lu9yqs6ic9kgjk99hx09g9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt
    ADD CONSTRAINT fkfe9lu9yqs6ic9kgjk99hx09g9 FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(id);

--
-- Name: staff_shift fkfn9rkxk6xyj0xlx7f521ckohj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_shift
    ADD CONSTRAINT fkfn9rkxk6xyj0xlx7f521ckohj FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);

--
-- Name: staff_compensation fkghpxkbycemnsc4g89o8nwhwwm; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.staff_compensation
    ADD CONSTRAINT fkghpxkbycemnsc4g89o8nwhwwm FOREIGN KEY (staff_id) REFERENCES public.staff(staff_id);

--
-- Name: inventory_active_lot fkh1h0hd3omxjjmvfllua4qsth2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot
    ADD CONSTRAINT fkh1h0hd3omxjjmvfllua4qsth2 FOREIGN KEY (grn_id) REFERENCES public.goods_receipt(id);

--
-- Name: banquet_event_order fkhjnkkmhp91kcatvvfkxpua0ti; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.banquet_event_order
    ADD CONSTRAINT fkhjnkkmhp91kcatvvfkxpua0ti FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: weekly_budget fkhrb5uxqmo15wock29clr6m2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_budget
    ADD CONSTRAINT fkhrb5uxqmo15wock29clr6m2c FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: table_session fkif7i3is2cocm9px8btstgjc7q; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_session
    ADD CONSTRAINT fkif7i3is2cocm9px8btstgjc7q FOREIGN KEY (guest_id) REFERENCES public.guests(guest_id);

--
-- Name: order_line fkij5pxq0uusau9yiapsjpaib2a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line
    ADD CONSTRAINT fkij5pxq0uusau9yiapsjpaib2a FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);

--
-- Name: order_line fkj78wevefx6qrlrxp5mjoe2w1g; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_line
    ADD CONSTRAINT fkj78wevefx6qrlrxp5mjoe2w1g FOREIGN KEY (order_id) REFERENCES public.restaurant_order(id);

--
-- Name: ingredient fkkbghrhyvdym7iplts7p6q6wdy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredient
    ADD CONSTRAINT fkkbghrhyvdym7iplts7p6q6wdy FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: kds_ticket_item fkkconinxth4tsue7pk6frkaqat; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kds_ticket_item
    ADD CONSTRAINT fkkconinxth4tsue7pk6frkaqat FOREIGN KEY (ticket_id) REFERENCES public.kds_ticket(id);

--
-- Name: table_session fkm9yl7hh86beq1t3uebxgda9ie; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.table_session
    ADD CONSTRAINT fkm9yl7hh86beq1t3uebxgda9ie FOREIGN KEY (table_id) REFERENCES public.dining_table(id);

--
-- Name: inventory_active_lot fkmhyt7ro41p3w2megvg6kyqjwr; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_active_lot
    ADD CONSTRAINT fkmhyt7ro41p3w2megvg6kyqjwr FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);

--
-- Name: guest_feedback fkn2d2k4eksoyd5stsrkcw8hb66; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_feedback
    ADD CONSTRAINT fkn2d2k4eksoyd5stsrkcw8hb66 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: experiments fkndu2e3y4bqbg4vb0p4b6o7q4f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiments
    ADD CONSTRAINT fkndu2e3y4bqbg4vb0p4b6o7q4f FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: goods_receipt fknekmqp9hg62cijvvhtlouqbtd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt
    ADD CONSTRAINT fknekmqp9hg62cijvvhtlouqbtd FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);

--
-- Name: experiment_variants fknwst77upge8k6gqnh4h07gobo; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiment_variants
    ADD CONSTRAINT fknwst77upge8k6gqnh4h07gobo FOREIGN KEY (experiment_id) REFERENCES public.experiments(id);

--
-- Name: daily_sales_entry fko7h8yk1ta1od8yb3xhc7ddh84; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_entry
    ADD CONSTRAINT fko7h8yk1ta1od8yb3xhc7ddh84 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: purchase_invoice fkohyl1dil2sw5494m28a0h4iuk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice
    ADD CONSTRAINT fkohyl1dil2sw5494m28a0h4iuk FOREIGN KEY (goods_receipt_id) REFERENCES public.goods_receipt(id);

--
-- Name: scheduled_shift fkokglfdf0r4eglsuvvwhnetyt3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_shift
    ADD CONSTRAINT fkokglfdf0r4eglsuvvwhnetyt3 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: goods_receipt fkpbqpp5crfgkrf6gysud9j5tv8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goods_receipt
    ADD CONSTRAINT fkpbqpp5crfgkrf6gysud9j5tv8 FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: guest_oauth_accounts fkpqlshlwa20vomt0g27e1tcit9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_oauth_accounts
    ADD CONSTRAINT fkpqlshlwa20vomt0g27e1tcit9 FOREIGN KEY (guest_id) REFERENCES public.guests(guest_id);

--
-- Name: physical_inventory_line fkqka5cddg57cvash0rh7b99nf2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_line
    ADD CONSTRAINT fkqka5cddg57cvash0rh7b99nf2 FOREIGN KEY (period_id) REFERENCES public.physical_inventory_period(id);

--
-- Name: purchase_invoice fkqtx4kjstn77n9v4wowt0mlxkx; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_invoice
    ADD CONSTRAINT fkqtx4kjstn77n9v4wowt0mlxkx FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);

--
-- Name: restaurant_order fks01ueibbtfjwn5yscg2b7t5ow; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.restaurant_order
    ADD CONSTRAINT fks01ueibbtfjwn5yscg2b7t5ow FOREIGN KEY (session_id) REFERENCES public.table_session(id);

--
-- Name: inventory_waste_registry fks4letpyyprugysbmyx1c9insl; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_waste_registry
    ADD CONSTRAINT fks4letpyyprugysbmyx1c9insl FOREIGN KEY (ledger_id) REFERENCES public.inventory_ingredient_ledger(id);

--
-- Name: physical_inventory_line fks85p4vo9tru9oafc2s8gr2nai; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.physical_inventory_line
    ADD CONSTRAINT fks85p4vo9tru9oafc2s8gr2nai FOREIGN KEY (ingredient_id) REFERENCES public.ingredient(id);

--
-- Name: guest_experiment_assignments fkt4tutt23p7nmsr0igw4t2ja49; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_experiment_assignments
    ADD CONSTRAINT fkt4tutt23p7nmsr0igw4t2ja49 FOREIGN KEY (experiment_id) REFERENCES public.experiments(id);

--
-- Name: prime_cost_report fktj3m0t3269ghqnn6qkvx13vjh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prime_cost_report
    ADD CONSTRAINT fktj3m0t3269ghqnn6qkvx13vjh FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- Name: purchase_order fktqxssbyrayqm2387bx4qj68yh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT fktqxssbyrayqm2387bx4qj68yh FOREIGN KEY (restaurant_id) REFERENCES public.restaurant(id);

--
-- PostgreSQL database dump complete
--

