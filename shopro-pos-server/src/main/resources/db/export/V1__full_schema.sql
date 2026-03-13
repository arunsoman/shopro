--
-- PostgreSQL database dump
--

\restrict VdBhNWzbcnEzDbiDuZy0XxEXztZBmpehaSzUdM3XxtumddG01DTOTERzmTHCD8E

-- Dumped from database version 18.3 (Debian 18.3-1.pgdg13+1)
-- Dumped by pg_dump version 18.3 (Debian 18.3-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_insight; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_insight (
    id uuid NOT NULL,
    insight_type character varying(60) NOT NULL,
    title character varying(200) NOT NULL,
    description character varying(2000) NOT NULL,
    action_suggestion character varying(500),
    confidence_score numeric(4,3) NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    valid_until timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.ai_insight OWNER TO postgres;

--
-- Name: automated_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.automated_campaign (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    trigger_event character varying(50) NOT NULL,
    delay_hours integer DEFAULT 0 NOT NULL,
    template_id uuid,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.automated_campaign OWNER TO postgres;

--
-- Name: batch_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.batch_record (
    id uuid NOT NULL,
    sub_recipe_id uuid NOT NULL,
    produced_qty numeric(12,4) NOT NULL,
    remaining_qty numeric(12,4) NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    produced_at timestamp with time zone NOT NULL,
    expiry_at timestamp with time zone,
    notes character varying(500),
    produced_by_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.batch_record OWNER TO postgres;

--
-- Name: bonus_point_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bonus_point_event (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    multiplier numeric(3,1) DEFAULT 2.0 NOT NULL,
    scope character varying(20) DEFAULT 'ALL'::character varying NOT NULL,
    scope_reference_id uuid,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT bonus_point_event_multiplier_check CHECK (((multiplier >= 1.0) AND (multiplier <= 5.0))),
    CONSTRAINT chk_bonus_event_dates CHECK ((ends_at > starts_at))
);


ALTER TABLE public.bonus_point_event OWNER TO postgres;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channels (
    id uuid NOT NULL,
    type character varying(50) NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.channels OWNER TO postgres;

--
-- Name: customer_dietary_tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_dietary_tag (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_profile_id uuid NOT NULL,
    tag_type character varying(30) NOT NULL,
    custom_description character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.customer_dietary_tag OWNER TO postgres;

--
-- Name: customer_occasion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_occasion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_profile_id uuid NOT NULL,
    occasion_type character varying(30) NOT NULL,
    occasion_month integer NOT NULL,
    occasion_day integer NOT NULL,
    occasion_year integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    CONSTRAINT customer_occasion_occasion_day_check CHECK (((occasion_day >= 1) AND (occasion_day <= 31))),
    CONSTRAINT customer_occasion_occasion_month_check CHECK (((occasion_month >= 1) AND (occasion_month <= 12)))
);


ALTER TABLE public.customer_occasion OWNER TO postgres;

--
-- Name: customer_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_profile (
    id uuid NOT NULL,
    phone_number character varying(20) NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(100),
    loyalty_tier_id uuid,
    lifetime_spend numeric(12,2) DEFAULT 0.00 NOT NULL,
    available_points integer DEFAULT 0 NOT NULL,
    preference_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    visit_count integer DEFAULT 0 NOT NULL,
    sms_opt_in boolean DEFAULT true NOT NULL,
    email_opt_in boolean DEFAULT true NOT NULL,
    last_visit_at timestamp with time zone,
    is_churned boolean DEFAULT false NOT NULL
);


ALTER TABLE public.customer_profile OWNER TO postgres;

--
-- Name: customer_segment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_segment (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer_segment OWNER TO postgres;

--
-- Name: goods_receipt_note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipt_note (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    received_at timestamp with time zone NOT NULL,
    received_by_id uuid NOT NULL,
    delivery_note_reference character varying(100),
    notes character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.goods_receipt_note OWNER TO postgres;

--
-- Name: goods_receipt_note_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goods_receipt_note_line (
    id uuid NOT NULL,
    goods_receipt_note_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    received_qty numeric(12,4) NOT NULL,
    damaged_qty numeric(12,4) DEFAULT 0.0000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.goods_receipt_note_line OWNER TO postgres;

--
-- Name: guest_cart_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_cart_item (
    id uuid NOT NULL,
    session_id uuid NOT NULL,
    device_fingerprint character varying(128) NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    modifiers jsonb,
    custom_note character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.guest_cart_item OWNER TO postgres;

--
-- Name: guest_feedback; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    order_id character varying(50),
    rating integer NOT NULL,
    comments text,
    sentiment character varying(20),
    source character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT guest_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.guest_feedback OWNER TO postgres;

--
-- Name: in_app_notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.in_app_notification (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    recipient_type character varying(20) NOT NULL,
    recipient_id character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    category character varying(50) NOT NULL,
    priority character varying(20) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_dismissed boolean DEFAULT false NOT NULL,
    data jsonb,
    correlation_id character varying(255),
    read_at timestamp with time zone,
    dismissed_at timestamp with time zone
);


ALTER TABLE public.in_app_notification OWNER TO postgres;

--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.in_app_notifications (
    id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    type_code character varying(100) NOT NULL,
    correlation_id character varying(255),
    title character varying(255) NOT NULL,
    body text NOT NULL,
    data jsonb,
    is_read boolean DEFAULT false,
    is_dismissed boolean DEFAULT false,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.in_app_notifications OWNER TO postgres;

--
-- Name: inventory_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transaction (
    id uuid CONSTRAINT inventory_transaction_id_not_null1 NOT NULL,
    ingredient_id uuid CONSTRAINT inventory_transaction_ingredient_id_not_null1 NOT NULL,
    transaction_type character varying(30) CONSTRAINT inventory_transaction_transaction_type_not_null1 NOT NULL,
    quantity_delta numeric(12,4) CONSTRAINT inventory_transaction_quantity_delta_not_null1 NOT NULL,
    unit_cost_at_time numeric(10,4),
    reason character varying(256),
    reference_id uuid,
    metadata jsonb,
    created_by_id uuid,
    transacted_at timestamp with time zone CONSTRAINT inventory_transaction_transacted_at_not_null1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT inventory_transaction_version_not_null1 NOT NULL
)
PARTITION BY RANGE (transacted_at);


ALTER TABLE public.inventory_transaction OWNER TO postgres;

--
-- Name: inventory_transaction_y2024; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transaction_y2024 (
    id uuid CONSTRAINT inventory_transaction_id_not_null1 NOT NULL,
    ingredient_id uuid CONSTRAINT inventory_transaction_ingredient_id_not_null1 NOT NULL,
    transaction_type character varying(30) CONSTRAINT inventory_transaction_transaction_type_not_null1 NOT NULL,
    quantity_delta numeric(12,4) CONSTRAINT inventory_transaction_quantity_delta_not_null1 NOT NULL,
    unit_cost_at_time numeric(10,4),
    reason character varying(256),
    reference_id uuid,
    metadata jsonb,
    created_by_id uuid,
    transacted_at timestamp with time zone CONSTRAINT inventory_transaction_transacted_at_not_null1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT inventory_transaction_version_not_null1 NOT NULL
);


ALTER TABLE public.inventory_transaction_y2024 OWNER TO postgres;

--
-- Name: inventory_transaction_y2025; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transaction_y2025 (
    id uuid CONSTRAINT inventory_transaction_id_not_null1 NOT NULL,
    ingredient_id uuid CONSTRAINT inventory_transaction_ingredient_id_not_null1 NOT NULL,
    transaction_type character varying(30) CONSTRAINT inventory_transaction_transaction_type_not_null1 NOT NULL,
    quantity_delta numeric(12,4) CONSTRAINT inventory_transaction_quantity_delta_not_null1 NOT NULL,
    unit_cost_at_time numeric(10,4),
    reason character varying(256),
    reference_id uuid,
    metadata jsonb,
    created_by_id uuid,
    transacted_at timestamp with time zone CONSTRAINT inventory_transaction_transacted_at_not_null1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT inventory_transaction_version_not_null1 NOT NULL
);


ALTER TABLE public.inventory_transaction_y2025 OWNER TO postgres;

--
-- Name: inventory_transaction_y2026; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_transaction_y2026 (
    id uuid CONSTRAINT inventory_transaction_id_not_null1 NOT NULL,
    ingredient_id uuid CONSTRAINT inventory_transaction_ingredient_id_not_null1 NOT NULL,
    transaction_type character varying(30) CONSTRAINT inventory_transaction_transaction_type_not_null1 NOT NULL,
    quantity_delta numeric(12,4) CONSTRAINT inventory_transaction_quantity_delta_not_null1 NOT NULL,
    unit_cost_at_time numeric(10,4),
    reason character varying(256),
    reference_id uuid,
    metadata jsonb,
    created_by_id uuid,
    transacted_at timestamp with time zone CONSTRAINT inventory_transaction_transacted_at_not_null1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT inventory_transaction_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT inventory_transaction_version_not_null1 NOT NULL
);


ALTER TABLE public.inventory_transaction_y2026 OWNER TO postgres;

--
-- Name: kds_routing_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_routing_rule (
    id uuid NOT NULL,
    station_id uuid NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.kds_routing_rule OWNER TO postgres;

--
-- Name: kds_station; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_station (
    id uuid NOT NULL,
    name character varying(60) NOT NULL,
    station_type character varying(30) NOT NULL,
    online boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.kds_station OWNER TO postgres;

--
-- Name: kds_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket (
    id uuid NOT NULL,
    order_ticket_id uuid NOT NULL,
    station_id uuid NOT NULL,
    status character varying(20) DEFAULT 'NEW'::character varying NOT NULL,
    fired_at timestamp with time zone NOT NULL,
    bumped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    cooking_at timestamp with time zone
)
PARTITION BY HASH (id);


ALTER TABLE public.kds_ticket OWNER TO postgres;

--
-- Name: kds_ticket_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket_item (
    id uuid NOT NULL,
    kds_ticket_id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    ready_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    priority integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.kds_ticket_item OWNER TO postgres;

--
-- Name: kds_ticket_p0; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket_p0 (
    id uuid CONSTRAINT kds_ticket_id_not_null NOT NULL,
    order_ticket_id uuid CONSTRAINT kds_ticket_order_ticket_id_not_null NOT NULL,
    station_id uuid CONSTRAINT kds_ticket_station_id_not_null NOT NULL,
    status character varying(20) DEFAULT 'NEW'::character varying CONSTRAINT kds_ticket_status_not_null NOT NULL,
    fired_at timestamp with time zone CONSTRAINT kds_ticket_fired_at_not_null NOT NULL,
    bumped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_updated_at_not_null NOT NULL,
    version bigint DEFAULT 0 CONSTRAINT kds_ticket_version_not_null NOT NULL,
    cooking_at timestamp with time zone
);


ALTER TABLE public.kds_ticket_p0 OWNER TO postgres;

--
-- Name: kds_ticket_p1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket_p1 (
    id uuid CONSTRAINT kds_ticket_id_not_null NOT NULL,
    order_ticket_id uuid CONSTRAINT kds_ticket_order_ticket_id_not_null NOT NULL,
    station_id uuid CONSTRAINT kds_ticket_station_id_not_null NOT NULL,
    status character varying(20) DEFAULT 'NEW'::character varying CONSTRAINT kds_ticket_status_not_null NOT NULL,
    fired_at timestamp with time zone CONSTRAINT kds_ticket_fired_at_not_null NOT NULL,
    bumped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_updated_at_not_null NOT NULL,
    version bigint DEFAULT 0 CONSTRAINT kds_ticket_version_not_null NOT NULL,
    cooking_at timestamp with time zone
);


ALTER TABLE public.kds_ticket_p1 OWNER TO postgres;

--
-- Name: kds_ticket_p2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket_p2 (
    id uuid CONSTRAINT kds_ticket_id_not_null NOT NULL,
    order_ticket_id uuid CONSTRAINT kds_ticket_order_ticket_id_not_null NOT NULL,
    station_id uuid CONSTRAINT kds_ticket_station_id_not_null NOT NULL,
    status character varying(20) DEFAULT 'NEW'::character varying CONSTRAINT kds_ticket_status_not_null NOT NULL,
    fired_at timestamp with time zone CONSTRAINT kds_ticket_fired_at_not_null NOT NULL,
    bumped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_updated_at_not_null NOT NULL,
    version bigint DEFAULT 0 CONSTRAINT kds_ticket_version_not_null NOT NULL,
    cooking_at timestamp with time zone
);


ALTER TABLE public.kds_ticket_p2 OWNER TO postgres;

--
-- Name: kds_ticket_p3; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kds_ticket_p3 (
    id uuid CONSTRAINT kds_ticket_id_not_null NOT NULL,
    order_ticket_id uuid CONSTRAINT kds_ticket_order_ticket_id_not_null NOT NULL,
    station_id uuid CONSTRAINT kds_ticket_station_id_not_null NOT NULL,
    status character varying(20) DEFAULT 'NEW'::character varying CONSTRAINT kds_ticket_status_not_null NOT NULL,
    fired_at timestamp with time zone CONSTRAINT kds_ticket_fired_at_not_null NOT NULL,
    bumped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT kds_ticket_updated_at_not_null NOT NULL,
    version bigint DEFAULT 0 CONSTRAINT kds_ticket_version_not_null NOT NULL,
    cooking_at timestamp with time zone
);


ALTER TABLE public.kds_ticket_p3 OWNER TO postgres;

--
-- Name: loyalty_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    earning_rate numeric(6,2) DEFAULT 1.00 NOT NULL,
    redemption_value numeric(6,4) DEFAULT 0.0100 NOT NULL,
    minimum_redemption_points integer DEFAULT 100 NOT NULL,
    point_expiration_days integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    default_sms_opt_in boolean DEFAULT true NOT NULL,
    default_email_opt_in boolean DEFAULT true NOT NULL,
    feedback_window_hours integer DEFAULT 24 NOT NULL,
    sms_gateway_enabled boolean DEFAULT false NOT NULL,
    email_gateway_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.loyalty_config OWNER TO postgres;

--
-- Name: loyalty_tier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_tier (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    spend_threshold numeric(12,2) DEFAULT 0.00 NOT NULL,
    point_multiplier numeric(4,2) DEFAULT 1.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.loyalty_tier OWNER TO postgres;

--
-- Name: loyalty_transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_transaction (
    id uuid NOT NULL,
    customer_profile_id uuid NOT NULL,
    order_ticket_id uuid,
    points integer NOT NULL,
    description character varying(200),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    transaction_type character varying(20) DEFAULT 'EARN'::character varying NOT NULL,
    bonus_event_id uuid
);


ALTER TABLE public.loyalty_transaction OWNER TO postgres;

--
-- Name: marketing_campaign; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketing_campaign (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    campaign_type character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.marketing_campaign OWNER TO postgres;

--
-- Name: menu_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_category (
    id uuid NOT NULL,
    name character varying(40) NOT NULL,
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    default_course integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.menu_category OWNER TO postgres;

--
-- Name: menu_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    name character varying(60) NOT NULL,
    description character varying(500),
    base_price numeric(10,2) NOT NULL,
    photo_url character varying(1024),
    status character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.menu_item OWNER TO postgres;

--
-- Name: menu_item_modifier_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.menu_item_modifier_group (
    id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.menu_item_modifier_group OWNER TO postgres;

--
-- Name: modifier_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifier_group (
    id uuid NOT NULL,
    name character varying(80) NOT NULL,
    required boolean NOT NULL,
    min_selections integer DEFAULT 0 NOT NULL,
    max_selections integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.modifier_group OWNER TO postgres;

--
-- Name: modifier_option; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modifier_option (
    id uuid NOT NULL,
    modifier_group_id uuid NOT NULL,
    label character varying(80) NOT NULL,
    upcharge_amount numeric(8,2) DEFAULT 0.00 NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.modifier_option OWNER TO postgres;

--
-- Name: notification_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_log (
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    version bigint NOT NULL,
    type character varying(50) NOT NULL,
    recipient character varying(255) NOT NULL,
    subject character varying(255),
    message text NOT NULL,
    status character varying(50) NOT NULL,
    sent_at timestamp with time zone,
    error_message text
);


ALTER TABLE public.notification_log OWNER TO postgres;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_logs (
    id uuid NOT NULL,
    dispatch_id uuid NOT NULL,
    notification_type_id uuid,
    channel_id uuid,
    recipient_identifier character varying(255),
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    payload jsonb,
    error_message text,
    attempt_count integer DEFAULT 0,
    sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.notification_logs OWNER TO postgres;

--
-- Name: notification_recipient_mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_recipient_mapping (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    notification_type character varying(50) NOT NULL,
    recipient_type character varying(20) NOT NULL,
    recipient_id character varying(100) NOT NULL
);


ALTER TABLE public.notification_recipient_mapping OWNER TO postgres;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_templates (
    id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    subject_template character varying(255),
    body_template text NOT NULL,
    action_url_template character varying(255),
    language character varying(10) DEFAULT 'en'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO postgres;

--
-- Name: notification_type_channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_type_channels (
    id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    recipient_group_id uuid,
    fallback_channel_id uuid,
    is_active boolean DEFAULT true,
    priority_override character varying(20),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.notification_type_channels OWNER TO postgres;

--
-- Name: notification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_types (
    id uuid NOT NULL,
    code character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(50) NOT NULL,
    severity character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_mutable boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notification_types OWNER TO postgres;

--
-- Name: order_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_audit_log (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    event_type character varying(50) NOT NULL,
    details text,
    performed_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    signature_hash character varying(255)
);


ALTER TABLE public.order_audit_log OWNER TO postgres;

--
-- Name: order_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item (
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    menu_item_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    modifier_upcharge_total numeric(8,2) DEFAULT 0.00 NOT NULL,
    status character varying(20) NOT NULL,
    custom_note character varying(100),
    has_allergy_flag boolean DEFAULT false NOT NULL,
    is_subtraction boolean DEFAULT false NOT NULL,
    course_number integer DEFAULT 1 NOT NULL,
    fired_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.order_item OWNER TO postgres;

--
-- Name: order_item_modifier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_item_modifier (
    id uuid NOT NULL,
    order_item_id uuid NOT NULL,
    modifier_option_id uuid NOT NULL,
    upcharge_amount numeric(8,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.order_item_modifier OWNER TO postgres;

--
-- Name: order_ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_ticket (
    id uuid NOT NULL,
    table_id uuid,
    server_id uuid NOT NULL,
    customer_profile_id uuid,
    status character varying(20) NOT NULL,
    order_type character varying(20) DEFAULT 'DINE_IN'::character varying NOT NULL,
    parent_ticket_id uuid,
    cover_count integer DEFAULT 1 NOT NULL,
    delivery_address character varying(500),
    vehicle_model character varying(50),
    vehicle_color character varying(30),
    vehicle_plate character varying(20),
    subtotal numeric(10,2) DEFAULT 0.00 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    tip_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.order_ticket OWNER TO postgres;

--
-- Name: payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment (
    id uuid NOT NULL,
    ticket_id uuid NOT NULL,
    method character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    processor_reference character varying(128),
    decline_reason character varying(256),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.payment OWNER TO postgres;

--
-- Name: po_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.po_status_history (
    id uuid NOT NULL,
    po_id uuid NOT NULL,
    from_status character varying(25),
    to_status character varying(25) NOT NULL,
    actor_id uuid NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0
);


ALTER TABLE public.po_status_history OWNER TO postgres;

--
-- Name: promo_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promo_code (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    segment_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.promo_code OWNER TO postgres;

--
-- Name: purchase_order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order (
    id uuid CONSTRAINT purchase_order_id_not_null1 NOT NULL,
    supplier_id uuid CONSTRAINT purchase_order_supplier_id_not_null1 NOT NULL,
    generated_by_id uuid CONSTRAINT purchase_order_generated_by_id_not_null1 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying CONSTRAINT purchase_order_status_not_null1 NOT NULL,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT purchase_order_version_not_null1 NOT NULL,
    total_value numeric(12,4) DEFAULT 0.0000 CONSTRAINT purchase_order_total_value_not_null1 NOT NULL,
    expected_delivery_date date,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes text,
    acknowledged_at timestamp with time zone
)
PARTITION BY HASH (id);


ALTER TABLE public.purchase_order OWNER TO postgres;

--
-- Name: COLUMN purchase_order.tracking_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.tracking_number IS 'Carrier tracking number provided by the supplier';


--
-- Name: COLUMN purchase_order.invoice_file_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.invoice_file_id IS 'Reference to the uploaded invoice PDF in object storage';


--
-- Name: COLUMN purchase_order.delivery_note_ref; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.delivery_note_ref IS 'Supplier internal reference number for the delivery';


--
-- Name: COLUMN purchase_order.shipped_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.shipped_at IS 'Timestamp when the supplier marked the PO as SHIPPED/SENT';


--
-- Name: COLUMN purchase_order.source_bid_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.source_bid_id IS 'Link to the awarded VendorBid';


--
-- Name: COLUMN purchase_order.source_proposal_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.source_proposal_id IS 'Link to the accepted VendorPriceProposal';


--
-- Name: COLUMN purchase_order.counter_offer_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.counter_offer_price IS 'Alternative price proposed by supplier';


--
-- Name: COLUMN purchase_order.counter_offer_qty; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.counter_offer_qty IS 'Alternative quantity proposed by supplier';


--
-- Name: COLUMN purchase_order.counter_offer_notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.counter_offer_notes IS 'Supplier provided reason for counter-offer';


--
-- Name: COLUMN purchase_order.acknowledged_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchase_order.acknowledged_at IS 'Timestamp of supplier formal acknowledgment';


--
-- Name: purchase_order_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_line (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    ordered_qty numeric(12,4) NOT NULL,
    received_qty numeric(12,4),
    unit_cost numeric(10,4) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    invoice_unit_price numeric(10,4)
);


ALTER TABLE public.purchase_order_line OWNER TO postgres;

--
-- Name: purchase_order_p0; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_p0 (
    id uuid CONSTRAINT purchase_order_id_not_null1 NOT NULL,
    supplier_id uuid CONSTRAINT purchase_order_supplier_id_not_null1 NOT NULL,
    generated_by_id uuid CONSTRAINT purchase_order_generated_by_id_not_null1 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying CONSTRAINT purchase_order_status_not_null1 NOT NULL,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT purchase_order_version_not_null1 NOT NULL,
    total_value numeric(12,4) DEFAULT 0.0000 CONSTRAINT purchase_order_total_value_not_null1 NOT NULL,
    expected_delivery_date date,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes text,
    acknowledged_at timestamp with time zone
);


ALTER TABLE public.purchase_order_p0 OWNER TO postgres;

--
-- Name: purchase_order_p1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_p1 (
    id uuid CONSTRAINT purchase_order_id_not_null1 NOT NULL,
    supplier_id uuid CONSTRAINT purchase_order_supplier_id_not_null1 NOT NULL,
    generated_by_id uuid CONSTRAINT purchase_order_generated_by_id_not_null1 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying CONSTRAINT purchase_order_status_not_null1 NOT NULL,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT purchase_order_version_not_null1 NOT NULL,
    total_value numeric(12,4) DEFAULT 0.0000 CONSTRAINT purchase_order_total_value_not_null1 NOT NULL,
    expected_delivery_date date,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes text,
    acknowledged_at timestamp with time zone
);


ALTER TABLE public.purchase_order_p1 OWNER TO postgres;

--
-- Name: purchase_order_p2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_p2 (
    id uuid CONSTRAINT purchase_order_id_not_null1 NOT NULL,
    supplier_id uuid CONSTRAINT purchase_order_supplier_id_not_null1 NOT NULL,
    generated_by_id uuid CONSTRAINT purchase_order_generated_by_id_not_null1 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying CONSTRAINT purchase_order_status_not_null1 NOT NULL,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT purchase_order_version_not_null1 NOT NULL,
    total_value numeric(12,4) DEFAULT 0.0000 CONSTRAINT purchase_order_total_value_not_null1 NOT NULL,
    expected_delivery_date date,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes text,
    acknowledged_at timestamp with time zone
);


ALTER TABLE public.purchase_order_p2 OWNER TO postgres;

--
-- Name: purchase_order_p3; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_p3 (
    id uuid CONSTRAINT purchase_order_id_not_null1 NOT NULL,
    supplier_id uuid CONSTRAINT purchase_order_supplier_id_not_null1 NOT NULL,
    generated_by_id uuid CONSTRAINT purchase_order_generated_by_id_not_null1 NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying CONSTRAINT purchase_order_status_not_null1 NOT NULL,
    sent_at timestamp with time zone,
    received_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_created_at_not_null1 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT purchase_order_updated_at_not_null1 NOT NULL,
    version bigint CONSTRAINT purchase_order_version_not_null1 NOT NULL,
    total_value numeric(12,4) DEFAULT 0.0000 CONSTRAINT purchase_order_total_value_not_null1 NOT NULL,
    expected_delivery_date date,
    approved_by_id uuid,
    approved_at timestamp with time zone,
    tracking_number character varying(100),
    invoice_file_id uuid,
    delivery_note_ref character varying(100),
    shipped_at timestamp with time zone,
    source_bid_id uuid,
    source_proposal_id uuid,
    counter_offer_price numeric(12,4),
    counter_offer_qty numeric(12,4),
    counter_offer_date timestamp with time zone,
    counter_offer_notes text,
    acknowledged_at timestamp with time zone
);


ALTER TABLE public.purchase_order_p3 OWNER TO postgres;

--
-- Name: raw_ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_ingredient (
    id uuid NOT NULL,
    name character varying(120) NOT NULL,
    unit_of_measure character varying(20) NOT NULL,
    cost_per_unit numeric(10,4) NOT NULL,
    yield_pct numeric(5,4) DEFAULT 1.0000 NOT NULL,
    effective_cost_per_unit numeric(10,4) GENERATED ALWAYS AS ((cost_per_unit / NULLIF(yield_pct, (0)::numeric))) STORED,
    current_stock numeric(12,4) DEFAULT 0 NOT NULL,
    par_level numeric(12,4) DEFAULT 0 NOT NULL,
    reorder_point numeric(12,4) DEFAULT 0 NOT NULL,
    supplier_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    safety_level numeric(12,4) DEFAULT 0.0000 NOT NULL,
    critical_level numeric(12,4) DEFAULT 0.0000 NOT NULL,
    max_stock_level numeric(12,4) DEFAULT 0.0000 NOT NULL,
    auto_replenish boolean DEFAULT false NOT NULL
);


ALTER TABLE public.raw_ingredient OWNER TO postgres;

--
-- Name: raw_ingredient_allergen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_ingredient_allergen (
    ingredient_id uuid NOT NULL,
    allergen character varying(30) NOT NULL
);


ALTER TABLE public.raw_ingredient_allergen OWNER TO postgres;

--
-- Name: recipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe (
    id uuid NOT NULL,
    menu_item_id uuid,
    recipe_version integer NOT NULL,
    effective_from timestamp with time zone NOT NULL,
    created_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    sub_recipe_id uuid,
    CONSTRAINT ck_recipe_target CHECK ((((menu_item_id IS NOT NULL) AND (sub_recipe_id IS NULL)) OR ((menu_item_id IS NULL) AND (sub_recipe_id IS NOT NULL))))
);


ALTER TABLE public.recipe OWNER TO postgres;

--
-- Name: recipe_ingredient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredient (
    id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    ingredient_id uuid,
    quantity numeric(10,4) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    sub_recipe_id uuid,
    CONSTRAINT ck_recipe_ingredient_target CHECK ((((ingredient_id IS NOT NULL) AND (sub_recipe_id IS NULL)) OR ((ingredient_id IS NULL) AND (sub_recipe_id IS NOT NULL))))
);


ALTER TABLE public.recipe_ingredient OWNER TO postgres;

--
-- Name: recipient_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipient_groups (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    role_code character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL,
    description text
);


ALTER TABLE public.recipient_groups OWNER TO postgres;

--
-- Name: recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipients (
    id uuid NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid,
    email character varying(255),
    phone character varying(50),
    device_token character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.recipients OWNER TO postgres;

--
-- Name: reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservation (
    id uuid NOT NULL,
    table_id uuid NOT NULL,
    customer_name character varying(100) NOT NULL,
    reservation_time timestamp with time zone NOT NULL,
    party_size integer NOT NULL,
    status character varying(20) DEFAULT 'CONFIRMED'::character varying NOT NULL,
    handled_by_id uuid,
    created_by_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.reservation OWNER TO postgres;

--
-- Name: rfq; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rfq (
    id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    required_qty numeric(12,4) NOT NULL,
    status character varying(20) DEFAULT 'OPEN'::character varying NOT NULL,
    desired_delivery_date date NOT NULL,
    bid_deadline timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.rfq OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.section (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.section OWNER TO postgres;

--
-- Name: segment_rule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.segment_rule (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    segment_id uuid NOT NULL,
    field character varying(50) NOT NULL,
    operator character varying(50) NOT NULL,
    rule_value character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.segment_rule OWNER TO postgres;

--
-- Name: staff_device_bindings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_device_bindings (
    id uuid NOT NULL,
    staff_id uuid NOT NULL,
    public_key_thumbprint character varying(512) NOT NULL,
    device_name character varying(100),
    last_active_at timestamp with time zone,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.staff_device_bindings OWNER TO postgres;

--
-- Name: staff_member; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_member (
    id uuid NOT NULL,
    full_name character varying(120) NOT NULL,
    pin_hash character varying(255) NOT NULL,
    role character varying(20),
    active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    role_id uuid
);


ALTER TABLE public.staff_member OWNER TO postgres;

--
-- Name: staff_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_permissions (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    category character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.staff_permissions OWNER TO postgres;

--
-- Name: staff_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_roles (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    parent_role_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.staff_roles OWNER TO postgres;

--
-- Name: sub_recipe; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sub_recipe (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    yield_quantity numeric(12,4) NOT NULL,
    unit_of_measure character varying(30) NOT NULL,
    cost_per_unit numeric(10,4) DEFAULT 0.0000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.sub_recipe OWNER TO postgres;

--
-- Name: supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier (
    id uuid NOT NULL,
    company_name character varying(120) NOT NULL,
    contact_name character varying(100),
    contact_email character varying(254),
    contact_phone character varying(30),
    lead_time_days integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    vendor_rating numeric(5,2) DEFAULT 70.00 NOT NULL
);


ALTER TABLE public.supplier OWNER TO postgres;

--
-- Name: supplier_ingredient_pricing; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_ingredient_pricing (
    id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    unit_price numeric(12,4) NOT NULL,
    vendor_sku character varying(50),
    last_updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.supplier_ingredient_pricing OWNER TO postgres;

--
-- Name: supplier_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_policy (
    supplier_id uuid NOT NULL,
    auto_acknowledge boolean DEFAULT false NOT NULL,
    counter_offer_allowed boolean DEFAULT true NOT NULL,
    payment_terms character varying(100),
    qty_tolerance numeric(5,2) DEFAULT 5.00 NOT NULL,
    price_tolerance numeric(5,2) DEFAULT 2.00 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.supplier_policy OWNER TO postgres;

--
-- Name: supplier_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_user (
    id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    full_name character varying(120) NOT NULL,
    role character varying(50) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    phone_number character varying(30)
);


ALTER TABLE public.supplier_user OWNER TO postgres;

--
-- Name: table_shape; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.table_shape (
    id uuid NOT NULL,
    section_id uuid NOT NULL,
    name character varying(20) NOT NULL,
    capacity integer NOT NULL,
    status character varying(20) DEFAULT 'AVAILABLE'::character varying NOT NULL,
    pos_x double precision NOT NULL,
    pos_y double precision NOT NULL,
    width double precision NOT NULL,
    height double precision NOT NULL,
    shape_type character varying(20) DEFAULT 'RECTANGLE'::character varying NOT NULL,
    nfc_tag_id character varying(64),
    assigned_staff_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL
);


ALTER TABLE public.table_shape OWNER TO postgres;

--
-- Name: tableside_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tableside_session (
    id uuid NOT NULL,
    table_id uuid NOT NULL,
    qr_token uuid NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.tableside_session OWNER TO postgres;

--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notification_preferences (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    notification_type_id uuid NOT NULL,
    channel_id uuid NOT NULL,
    is_muted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.user_notification_preferences OWNER TO postgres;

--
-- Name: vendor_bid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_bid (
    id uuid NOT NULL,
    rfq_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    unit_price numeric(10,4) NOT NULL,
    quantity_available numeric(12,4) NOT NULL,
    delivery_date date NOT NULL,
    payment_terms character varying(100),
    notes character varying(500),
    status character varying(20) DEFAULT 'SUBMITTED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    submitted_by_id uuid
);


ALTER TABLE public.vendor_bid OWNER TO postgres;

--
-- Name: vendor_invoice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_invoice (
    id uuid NOT NULL,
    purchase_order_id uuid NOT NULL,
    invoice_number character varying(100) NOT NULL,
    invoice_date date NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    total_amount numeric(12,4) NOT NULL,
    tax_amount numeric(12,4) DEFAULT 0.0000 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.vendor_invoice OWNER TO postgres;

--
-- Name: vendor_invoice_line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_invoice_line (
    id uuid NOT NULL,
    vendor_invoice_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    invoiced_qty numeric(12,4) NOT NULL,
    unit_price numeric(10,4) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL
);


ALTER TABLE public.vendor_invoice_line OWNER TO postgres;

--
-- Name: vendor_price_proposal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor_price_proposal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    proposed_price numeric(10,2) NOT NULL,
    notes text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint DEFAULT 0 NOT NULL,
    submitted_by uuid,
    generated_po_id uuid,
    proposed_quantity numeric(12,4)
);


ALTER TABLE public.vendor_price_proposal OWNER TO postgres;

--
-- Name: COLUMN vendor_price_proposal.proposed_quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor_price_proposal.proposed_quantity IS 'Quantity proposed by the supplier in the proactive proposal';


--
-- Name: waitlist_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.waitlist_entry (
    id uuid NOT NULL,
    customer_name character varying(100) NOT NULL,
    party_size integer NOT NULL,
    phone_number character varying(20),
    status character varying(20) DEFAULT 'WAITING'::character varying NOT NULL,
    seated_at_table_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    version bigint NOT NULL,
    estimated_wait_minutes integer,
    notified_at timestamp with time zone,
    handled_by_id uuid
);


ALTER TABLE public.waitlist_entry OWNER TO postgres;

--
-- Name: inventory_transaction_y2024; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction ATTACH PARTITION public.inventory_transaction_y2024 FOR VALUES FROM ('2024-01-01 00:00:00+00') TO ('2025-01-01 00:00:00+00');


--
-- Name: inventory_transaction_y2025; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction ATTACH PARTITION public.inventory_transaction_y2025 FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');


--
-- Name: inventory_transaction_y2026; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction ATTACH PARTITION public.inventory_transaction_y2026 FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');


--
-- Name: kds_ticket_p0; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket ATTACH PARTITION public.kds_ticket_p0 FOR VALUES WITH (modulus 4, remainder 0);


--
-- Name: kds_ticket_p1; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket ATTACH PARTITION public.kds_ticket_p1 FOR VALUES WITH (modulus 4, remainder 1);


--
-- Name: kds_ticket_p2; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket ATTACH PARTITION public.kds_ticket_p2 FOR VALUES WITH (modulus 4, remainder 2);


--
-- Name: kds_ticket_p3; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket ATTACH PARTITION public.kds_ticket_p3 FOR VALUES WITH (modulus 4, remainder 3);


--
-- Name: purchase_order_p0; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order ATTACH PARTITION public.purchase_order_p0 FOR VALUES WITH (modulus 4, remainder 0);


--
-- Name: purchase_order_p1; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order ATTACH PARTITION public.purchase_order_p1 FOR VALUES WITH (modulus 4, remainder 1);


--
-- Name: purchase_order_p2; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order ATTACH PARTITION public.purchase_order_p2 FOR VALUES WITH (modulus 4, remainder 2);


--
-- Name: purchase_order_p3; Type: TABLE ATTACH; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order ATTACH PARTITION public.purchase_order_p3 FOR VALUES WITH (modulus 4, remainder 3);


--
-- Name: ai_insight ai_insight_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_insight
    ADD CONSTRAINT ai_insight_pkey PRIMARY KEY (id);


--
-- Name: automated_campaign automated_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.automated_campaign
    ADD CONSTRAINT automated_campaign_pkey PRIMARY KEY (id);


--
-- Name: batch_record batch_record_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_record
    ADD CONSTRAINT batch_record_pkey PRIMARY KEY (id);


--
-- Name: bonus_point_event bonus_point_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bonus_point_event
    ADD CONSTRAINT bonus_point_event_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: customer_dietary_tag customer_dietary_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_dietary_tag
    ADD CONSTRAINT customer_dietary_tag_pkey PRIMARY KEY (id);


--
-- Name: customer_occasion customer_occasion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_occasion
    ADD CONSTRAINT customer_occasion_pkey PRIMARY KEY (id);


--
-- Name: customer_profile customer_profile_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profile
    ADD CONSTRAINT customer_profile_phone_number_key UNIQUE (phone_number);


--
-- Name: customer_profile customer_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profile
    ADD CONSTRAINT customer_profile_pkey PRIMARY KEY (id);


--
-- Name: customer_segment customer_segment_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_segment
    ADD CONSTRAINT customer_segment_name_key UNIQUE (name);


--
-- Name: customer_segment customer_segment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_segment
    ADD CONSTRAINT customer_segment_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_note_line goods_receipt_note_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note_line
    ADD CONSTRAINT goods_receipt_note_line_pkey PRIMARY KEY (id);


--
-- Name: goods_receipt_note goods_receipt_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_pkey PRIMARY KEY (id);


--
-- Name: guest_cart_item guest_cart_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_cart_item
    ADD CONSTRAINT guest_cart_item_pkey PRIMARY KEY (id);


--
-- Name: guest_feedback guest_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_feedback
    ADD CONSTRAINT guest_feedback_pkey PRIMARY KEY (id);


--
-- Name: in_app_notification in_app_notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notification
    ADD CONSTRAINT in_app_notification_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: inventory_transaction inventory_transaction_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction
    ADD CONSTRAINT inventory_transaction_pkey1 PRIMARY KEY (id, transacted_at);


--
-- Name: inventory_transaction_y2024 inventory_transaction_y2024_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction_y2024
    ADD CONSTRAINT inventory_transaction_y2024_pkey PRIMARY KEY (id, transacted_at);


--
-- Name: inventory_transaction_y2025 inventory_transaction_y2025_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction_y2025
    ADD CONSTRAINT inventory_transaction_y2025_pkey PRIMARY KEY (id, transacted_at);


--
-- Name: inventory_transaction_y2026 inventory_transaction_y2026_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_transaction_y2026
    ADD CONSTRAINT inventory_transaction_y2026_pkey PRIMARY KEY (id, transacted_at);


--
-- Name: kds_routing_rule kds_routing_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_routing_rule
    ADD CONSTRAINT kds_routing_rule_pkey PRIMARY KEY (id);


--
-- Name: kds_station kds_station_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_station
    ADD CONSTRAINT kds_station_name_key UNIQUE (name);


--
-- Name: kds_station kds_station_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_station
    ADD CONSTRAINT kds_station_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket_item kds_ticket_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_item
    ADD CONSTRAINT kds_ticket_item_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket kds_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket
    ADD CONSTRAINT kds_ticket_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket_p0 kds_ticket_p0_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_p0
    ADD CONSTRAINT kds_ticket_p0_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket_p1 kds_ticket_p1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_p1
    ADD CONSTRAINT kds_ticket_p1_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket_p2 kds_ticket_p2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_p2
    ADD CONSTRAINT kds_ticket_p2_pkey PRIMARY KEY (id);


--
-- Name: kds_ticket_p3 kds_ticket_p3_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_p3
    ADD CONSTRAINT kds_ticket_p3_pkey PRIMARY KEY (id);


--
-- Name: loyalty_config loyalty_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_config
    ADD CONSTRAINT loyalty_config_pkey PRIMARY KEY (id);


--
-- Name: loyalty_tier loyalty_tier_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_tier
    ADD CONSTRAINT loyalty_tier_name_key UNIQUE (name);


--
-- Name: loyalty_tier loyalty_tier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_tier
    ADD CONSTRAINT loyalty_tier_pkey PRIMARY KEY (id);


--
-- Name: loyalty_transaction loyalty_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transaction
    ADD CONSTRAINT loyalty_transaction_pkey PRIMARY KEY (id);


--
-- Name: marketing_campaign marketing_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketing_campaign
    ADD CONSTRAINT marketing_campaign_pkey PRIMARY KEY (id);


--
-- Name: menu_category menu_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_category
    ADD CONSTRAINT menu_category_name_key UNIQUE (name);


--
-- Name: menu_category menu_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_category
    ADD CONSTRAINT menu_category_pkey PRIMARY KEY (id);


--
-- Name: menu_item_modifier_group menu_item_modifier_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifier_group
    ADD CONSTRAINT menu_item_modifier_group_pkey PRIMARY KEY (id);


--
-- Name: menu_item menu_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_pkey PRIMARY KEY (id);


--
-- Name: modifier_group modifier_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_group
    ADD CONSTRAINT modifier_group_pkey PRIMARY KEY (id);


--
-- Name: modifier_option modifier_option_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_option
    ADD CONSTRAINT modifier_option_pkey PRIMARY KEY (id);


--
-- Name: notification_log notification_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_log
    ADD CONSTRAINT notification_log_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_recipient_mapping notification_recipient_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_recipient_mapping
    ADD CONSTRAINT notification_recipient_mapping_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_notification_type_id_channel_id_lang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_notification_type_id_channel_id_lang_key UNIQUE (notification_type_id, channel_id, language);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: notification_type_channels notification_type_channels_notification_type_id_channel_id__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_notification_type_id_channel_id__key UNIQUE (notification_type_id, channel_id, recipient_group_id);


--
-- Name: notification_type_channels notification_type_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_pkey PRIMARY KEY (id);


--
-- Name: notification_types notification_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_code_key UNIQUE (code);


--
-- Name: notification_types notification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_types
    ADD CONSTRAINT notification_types_pkey PRIMARY KEY (id);


--
-- Name: order_audit_log order_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_audit_log
    ADD CONSTRAINT order_audit_log_pkey PRIMARY KEY (id);


--
-- Name: order_item_modifier order_item_modifier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_modifier
    ADD CONSTRAINT order_item_modifier_pkey PRIMARY KEY (id);


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_pkey PRIMARY KEY (id);


--
-- Name: order_ticket order_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_ticket
    ADD CONSTRAINT order_ticket_pkey PRIMARY KEY (id);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: po_status_history po_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_pkey PRIMARY KEY (id);


--
-- Name: promo_code promo_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_code
    ADD CONSTRAINT promo_code_code_key UNIQUE (code);


--
-- Name: promo_code promo_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_code
    ADD CONSTRAINT promo_code_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_line purchase_order_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT purchase_order_line_pkey PRIMARY KEY (id);


--
-- Name: purchase_order purchase_order_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order
    ADD CONSTRAINT purchase_order_pkey1 PRIMARY KEY (id);


--
-- Name: purchase_order_p0 purchase_order_p0_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_p0
    ADD CONSTRAINT purchase_order_p0_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_p1 purchase_order_p1_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_p1
    ADD CONSTRAINT purchase_order_p1_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_p2 purchase_order_p2_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_p2
    ADD CONSTRAINT purchase_order_p2_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_p3 purchase_order_p3_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_p3
    ADD CONSTRAINT purchase_order_p3_pkey PRIMARY KEY (id);


--
-- Name: raw_ingredient_allergen raw_ingredient_allergen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_ingredient_allergen
    ADD CONSTRAINT raw_ingredient_allergen_pkey PRIMARY KEY (ingredient_id, allergen);


--
-- Name: raw_ingredient raw_ingredient_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_ingredient
    ADD CONSTRAINT raw_ingredient_name_key UNIQUE (name);


--
-- Name: raw_ingredient raw_ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_ingredient
    ADD CONSTRAINT raw_ingredient_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredient recipe_ingredient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_pkey PRIMARY KEY (id);


--
-- Name: recipe recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_pkey PRIMARY KEY (id);


--
-- Name: recipient_groups recipient_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipient_groups
    ADD CONSTRAINT recipient_groups_pkey PRIMARY KEY (id);


--
-- Name: recipient_groups recipient_groups_role_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipient_groups
    ADD CONSTRAINT recipient_groups_role_code_key UNIQUE (role_code);


--
-- Name: recipients recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_pkey PRIMARY KEY (id);


--
-- Name: reservation reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_pkey PRIMARY KEY (id);


--
-- Name: rfq rfq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq
    ADD CONSTRAINT rfq_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: section section_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_name_key UNIQUE (name);


--
-- Name: section section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.section
    ADD CONSTRAINT section_pkey PRIMARY KEY (id);


--
-- Name: segment_rule segment_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_rule
    ADD CONSTRAINT segment_rule_pkey PRIMARY KEY (id);


--
-- Name: staff_device_bindings staff_device_bindings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_device_bindings
    ADD CONSTRAINT staff_device_bindings_pkey PRIMARY KEY (id);


--
-- Name: staff_member staff_member_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_member
    ADD CONSTRAINT staff_member_pkey PRIMARY KEY (id);


--
-- Name: staff_permissions staff_permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_name_key UNIQUE (name);


--
-- Name: staff_permissions staff_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_permissions
    ADD CONSTRAINT staff_permissions_pkey PRIMARY KEY (id);


--
-- Name: staff_roles staff_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_name_key UNIQUE (name);


--
-- Name: staff_roles staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_pkey PRIMARY KEY (id);


--
-- Name: sub_recipe sub_recipe_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_recipe
    ADD CONSTRAINT sub_recipe_name_key UNIQUE (name);


--
-- Name: sub_recipe sub_recipe_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sub_recipe
    ADD CONSTRAINT sub_recipe_pkey PRIMARY KEY (id);


--
-- Name: supplier supplier_company_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_company_name_key UNIQUE (company_name);


--
-- Name: supplier_ingredient_pricing supplier_ingredient_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ingredient_pricing
    ADD CONSTRAINT supplier_ingredient_pricing_pkey PRIMARY KEY (id);


--
-- Name: supplier_ingredient_pricing supplier_ingredient_pricing_supplier_id_ingredient_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ingredient_pricing
    ADD CONSTRAINT supplier_ingredient_pricing_supplier_id_ingredient_id_key UNIQUE (supplier_id, ingredient_id);


--
-- Name: supplier supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);


--
-- Name: supplier_policy supplier_policy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_policy
    ADD CONSTRAINT supplier_policy_pkey PRIMARY KEY (supplier_id);


--
-- Name: supplier_user supplier_user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_user
    ADD CONSTRAINT supplier_user_email_key UNIQUE (email);


--
-- Name: supplier_user supplier_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_user
    ADD CONSTRAINT supplier_user_pkey PRIMARY KEY (id);


--
-- Name: table_shape table_shape_nfc_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_shape
    ADD CONSTRAINT table_shape_nfc_tag_id_key UNIQUE (nfc_tag_id);


--
-- Name: table_shape table_shape_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_shape
    ADD CONSTRAINT table_shape_pkey PRIMARY KEY (id);


--
-- Name: tableside_session tableside_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tableside_session
    ADD CONSTRAINT tableside_session_pkey PRIMARY KEY (id);


--
-- Name: tableside_session tableside_session_qr_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tableside_session
    ADD CONSTRAINT tableside_session_qr_token_key UNIQUE (qr_token);


--
-- Name: customer_dietary_tag uq_customer_dietary_tag; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_dietary_tag
    ADD CONSTRAINT uq_customer_dietary_tag UNIQUE (customer_profile_id, tag_type);


--
-- Name: customer_occasion uq_customer_occasion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_occasion
    ADD CONSTRAINT uq_customer_occasion UNIQUE (customer_profile_id, occasion_type);


--
-- Name: menu_item_modifier_group uq_item_modifier_group; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifier_group
    ADD CONSTRAINT uq_item_modifier_group UNIQUE (menu_item_id, modifier_group_id);


--
-- Name: kds_routing_rule uq_routing_station_target; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_routing_rule
    ADD CONSTRAINT uq_routing_station_target UNIQUE (station_id, target_type, target_id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_notification_type_id__key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_notification_type_id__key UNIQUE (user_id, notification_type_id, channel_id);


--
-- Name: vendor_bid vendor_bid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_bid
    ADD CONSTRAINT vendor_bid_pkey PRIMARY KEY (id);


--
-- Name: vendor_invoice vendor_invoice_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice
    ADD CONSTRAINT vendor_invoice_invoice_number_key UNIQUE (invoice_number);


--
-- Name: vendor_invoice_line vendor_invoice_line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice_line
    ADD CONSTRAINT vendor_invoice_line_pkey PRIMARY KEY (id);


--
-- Name: vendor_invoice vendor_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice
    ADD CONSTRAINT vendor_invoice_pkey PRIMARY KEY (id);


--
-- Name: vendor_price_proposal vendor_price_proposal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_pkey PRIMARY KEY (id);


--
-- Name: waitlist_entry waitlist_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT waitlist_entry_pkey PRIMARY KEY (id);


--
-- Name: idx_ai_insight_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_insight_type ON public.ai_insight USING btree (insight_type);


--
-- Name: idx_ai_insight_valid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ai_insight_valid ON public.ai_insight USING btree (valid_until);


--
-- Name: idx_batch_expiry; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batch_expiry ON public.batch_record USING btree (expiry_at);


--
-- Name: idx_batch_subrecipe_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_batch_subrecipe_status ON public.batch_record USING btree (sub_recipe_id, status);


--
-- Name: idx_bonus_event_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_bonus_event_active ON public.bonus_point_event USING btree (is_active, starts_at, ends_at);


--
-- Name: idx_device_public_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_public_key ON public.staff_device_bindings USING btree (public_key_thumbprint);


--
-- Name: idx_dietary_tag_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_dietary_tag_customer ON public.customer_dietary_tag USING btree (customer_profile_id);


--
-- Name: idx_grn_line_grn; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grn_line_grn ON public.goods_receipt_note_line USING btree (goods_receipt_note_id);


--
-- Name: idx_grn_line_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grn_line_ingredient ON public.goods_receipt_note_line USING btree (ingredient_id);


--
-- Name: idx_grn_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grn_po ON public.goods_receipt_note USING btree (purchase_order_id);


--
-- Name: idx_guest_feedback_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guest_feedback_customer_id ON public.guest_feedback USING btree (customer_id);


--
-- Name: idx_in_app_notif_recipient_v24; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notif_recipient_v24 ON public.in_app_notifications USING btree (recipient_id, is_dismissed, created_at DESC);


--
-- Name: idx_in_app_notification_correlation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notification_correlation ON public.in_app_notification USING btree (correlation_id);


--
-- Name: idx_in_app_notification_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_in_app_notification_recipient ON public.in_app_notification USING btree (recipient_type, recipient_id);


--
-- Name: idx_ingredient_stock_valuation; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ingredient_stock_valuation ON public.raw_ingredient USING btree (current_stock, cost_per_unit);


--
-- Name: idx_ingredient_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ingredient_supplier ON public.raw_ingredient USING btree (supplier_id);


--
-- Name: idx_inv_trans_brin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_trans_brin ON ONLY public.inventory_transaction USING brin (transacted_at);


--
-- Name: idx_inv_trans_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_inv_trans_ingredient ON ONLY public.inventory_transaction USING btree (ingredient_id);


--
-- Name: idx_invoice_line_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_line_ingredient ON public.vendor_invoice_line USING btree (ingredient_id);


--
-- Name: idx_invoice_line_invoice; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_invoice_line_invoice ON public.vendor_invoice_line USING btree (vendor_invoice_id);


--
-- Name: idx_item_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_item_category ON public.menu_item USING btree (category_id);


--
-- Name: idx_item_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_item_ticket ON public.order_item USING btree (ticket_id);


--
-- Name: idx_kds_item_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kds_item_priority ON public.kds_ticket_item USING btree (priority);


--
-- Name: idx_kds_item_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kds_item_ticket ON public.kds_ticket_item USING btree (kds_ticket_id);


--
-- Name: idx_kds_ticket_station; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kds_ticket_station ON ONLY public.kds_ticket USING btree (station_id);


--
-- Name: idx_kds_ticket_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kds_ticket_status ON ONLY public.kds_ticket USING btree (status, cooking_at);


--
-- Name: idx_notification_log_status_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_log_status_sent_at ON public.notification_log USING btree (status, sent_at);


--
-- Name: idx_notification_log_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_log_type ON public.notification_log USING btree (type);


--
-- Name: idx_notification_logs_dispatch_id_v24; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_logs_dispatch_id_v24 ON public.notification_logs USING btree (dispatch_id);


--
-- Name: idx_notification_type_code_v24; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notification_type_code_v24 ON public.notification_types USING btree (code);


--
-- Name: idx_occasion_customer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_occasion_customer ON public.customer_occasion USING btree (customer_profile_id);


--
-- Name: idx_payment_processor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_processor ON public.payment USING btree (processor_reference);


--
-- Name: idx_payment_ticket; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payment_ticket ON public.payment USING btree (ticket_id);


--
-- Name: idx_po_history_po_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_history_po_id ON public.po_status_history USING btree (po_id);


--
-- Name: idx_po_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_status_created ON ONLY public.purchase_order USING btree (status, created_at);


--
-- Name: idx_po_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_po_supplier ON ONLY public.purchase_order USING btree (supplier_id);


--
-- Name: idx_price_proposal_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_price_proposal_po ON public.vendor_price_proposal USING btree (generated_po_id);


--
-- Name: idx_promo_code_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promo_code_code ON public.promo_code USING btree (code);


--
-- Name: idx_rfq_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rfq_ingredient ON public.rfq USING btree (ingredient_id);


--
-- Name: idx_rfq_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rfq_status ON public.rfq USING btree (status);


--
-- Name: idx_segment_rule_segment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_segment_rule_segment_id ON public.segment_rule USING btree (segment_id);


--
-- Name: idx_sip_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sip_ingredient ON public.supplier_ingredient_pricing USING btree (ingredient_id);


--
-- Name: idx_sip_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sip_supplier ON public.supplier_ingredient_pricing USING btree (supplier_id);


--
-- Name: idx_supplier_user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_supplier_user_email ON public.supplier_user USING btree (email);


--
-- Name: idx_supplier_user_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_supplier_user_org ON public.supplier_user USING btree (supplier_id);


--
-- Name: idx_table_section; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_table_section ON public.table_shape USING btree (section_id);


--
-- Name: idx_ticket_table; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ticket_table ON public.order_ticket USING btree (table_id);


--
-- Name: idx_vendor_bid_rfq; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_bid_rfq ON public.vendor_bid USING btree (rfq_id);


--
-- Name: idx_vendor_bid_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_bid_supplier ON public.vendor_bid USING btree (supplier_id);


--
-- Name: idx_vendor_invoice_po; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_invoice_po ON public.vendor_invoice USING btree (purchase_order_id);


--
-- Name: idx_vendor_price_proposal_ingredient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_price_proposal_ingredient ON public.vendor_price_proposal USING btree (ingredient_id);


--
-- Name: idx_vendor_price_proposal_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_price_proposal_status ON public.vendor_price_proposal USING btree (status);


--
-- Name: idx_vendor_price_proposal_supplier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_price_proposal_supplier ON public.vendor_price_proposal USING btree (supplier_id);


--
-- Name: idx_waitlist_handled_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_handled_by ON public.waitlist_entry USING btree (handled_by_id);


--
-- Name: idx_waitlist_notified_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_waitlist_notified_at ON public.waitlist_entry USING btree (notified_at);


--
-- Name: inventory_transaction_y2024_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2024_ingredient_id_idx ON public.inventory_transaction_y2024 USING btree (ingredient_id);


--
-- Name: inventory_transaction_y2024_transacted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2024_transacted_at_idx ON public.inventory_transaction_y2024 USING brin (transacted_at);


--
-- Name: inventory_transaction_y2025_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2025_ingredient_id_idx ON public.inventory_transaction_y2025 USING btree (ingredient_id);


--
-- Name: inventory_transaction_y2025_transacted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2025_transacted_at_idx ON public.inventory_transaction_y2025 USING brin (transacted_at);


--
-- Name: inventory_transaction_y2026_ingredient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2026_ingredient_id_idx ON public.inventory_transaction_y2026 USING btree (ingredient_id);


--
-- Name: inventory_transaction_y2026_transacted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_transaction_y2026_transacted_at_idx ON public.inventory_transaction_y2026 USING brin (transacted_at);


--
-- Name: kds_ticket_p0_station_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p0_station_id_idx ON public.kds_ticket_p0 USING btree (station_id);


--
-- Name: kds_ticket_p0_status_cooking_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p0_status_cooking_at_idx ON public.kds_ticket_p0 USING btree (status, cooking_at);


--
-- Name: kds_ticket_p1_station_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p1_station_id_idx ON public.kds_ticket_p1 USING btree (station_id);


--
-- Name: kds_ticket_p1_status_cooking_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p1_status_cooking_at_idx ON public.kds_ticket_p1 USING btree (status, cooking_at);


--
-- Name: kds_ticket_p2_station_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p2_station_id_idx ON public.kds_ticket_p2 USING btree (station_id);


--
-- Name: kds_ticket_p2_status_cooking_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p2_status_cooking_at_idx ON public.kds_ticket_p2 USING btree (status, cooking_at);


--
-- Name: kds_ticket_p3_station_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p3_station_id_idx ON public.kds_ticket_p3 USING btree (station_id);


--
-- Name: kds_ticket_p3_status_cooking_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX kds_ticket_p3_status_cooking_at_idx ON public.kds_ticket_p3 USING btree (status, cooking_at);


--
-- Name: purchase_order_p0_status_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p0_status_created_at_idx ON public.purchase_order_p0 USING btree (status, created_at);


--
-- Name: purchase_order_p0_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p0_supplier_id_idx ON public.purchase_order_p0 USING btree (supplier_id);


--
-- Name: purchase_order_p1_status_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p1_status_created_at_idx ON public.purchase_order_p1 USING btree (status, created_at);


--
-- Name: purchase_order_p1_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p1_supplier_id_idx ON public.purchase_order_p1 USING btree (supplier_id);


--
-- Name: purchase_order_p2_status_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p2_status_created_at_idx ON public.purchase_order_p2 USING btree (status, created_at);


--
-- Name: purchase_order_p2_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p2_supplier_id_idx ON public.purchase_order_p2 USING btree (supplier_id);


--
-- Name: purchase_order_p3_status_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p3_status_created_at_idx ON public.purchase_order_p3 USING btree (status, created_at);


--
-- Name: purchase_order_p3_supplier_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX purchase_order_p3_supplier_id_idx ON public.purchase_order_p3 USING btree (supplier_id);


--
-- Name: uq_recipe_ingredient_raw; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_recipe_ingredient_raw ON public.recipe_ingredient USING btree (recipe_id, ingredient_id) WHERE (ingredient_id IS NOT NULL);


--
-- Name: uq_recipe_ingredient_sub; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_recipe_ingredient_sub ON public.recipe_ingredient USING btree (recipe_id, sub_recipe_id) WHERE (sub_recipe_id IS NOT NULL);


--
-- Name: uq_recipe_menu_item_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_recipe_menu_item_version ON public.recipe USING btree (menu_item_id, recipe_version) WHERE (menu_item_id IS NOT NULL);


--
-- Name: uq_recipe_sub_recipe_version; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_recipe_sub_recipe_version ON public.recipe USING btree (sub_recipe_id, recipe_version) WHERE (sub_recipe_id IS NOT NULL);


--
-- Name: inventory_transaction_y2024_ingredient_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_ingredient ATTACH PARTITION public.inventory_transaction_y2024_ingredient_id_idx;


--
-- Name: inventory_transaction_y2024_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.inventory_transaction_pkey1 ATTACH PARTITION public.inventory_transaction_y2024_pkey;


--
-- Name: inventory_transaction_y2024_transacted_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_brin ATTACH PARTITION public.inventory_transaction_y2024_transacted_at_idx;


--
-- Name: inventory_transaction_y2025_ingredient_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_ingredient ATTACH PARTITION public.inventory_transaction_y2025_ingredient_id_idx;


--
-- Name: inventory_transaction_y2025_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.inventory_transaction_pkey1 ATTACH PARTITION public.inventory_transaction_y2025_pkey;


--
-- Name: inventory_transaction_y2025_transacted_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_brin ATTACH PARTITION public.inventory_transaction_y2025_transacted_at_idx;


--
-- Name: inventory_transaction_y2026_ingredient_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_ingredient ATTACH PARTITION public.inventory_transaction_y2026_ingredient_id_idx;


--
-- Name: inventory_transaction_y2026_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.inventory_transaction_pkey1 ATTACH PARTITION public.inventory_transaction_y2026_pkey;


--
-- Name: inventory_transaction_y2026_transacted_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_inv_trans_brin ATTACH PARTITION public.inventory_transaction_y2026_transacted_at_idx;


--
-- Name: kds_ticket_p0_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.kds_ticket_pkey ATTACH PARTITION public.kds_ticket_p0_pkey;


--
-- Name: kds_ticket_p0_station_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_station ATTACH PARTITION public.kds_ticket_p0_station_id_idx;


--
-- Name: kds_ticket_p0_status_cooking_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_status ATTACH PARTITION public.kds_ticket_p0_status_cooking_at_idx;


--
-- Name: kds_ticket_p1_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.kds_ticket_pkey ATTACH PARTITION public.kds_ticket_p1_pkey;


--
-- Name: kds_ticket_p1_station_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_station ATTACH PARTITION public.kds_ticket_p1_station_id_idx;


--
-- Name: kds_ticket_p1_status_cooking_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_status ATTACH PARTITION public.kds_ticket_p1_status_cooking_at_idx;


--
-- Name: kds_ticket_p2_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.kds_ticket_pkey ATTACH PARTITION public.kds_ticket_p2_pkey;


--
-- Name: kds_ticket_p2_station_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_station ATTACH PARTITION public.kds_ticket_p2_station_id_idx;


--
-- Name: kds_ticket_p2_status_cooking_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_status ATTACH PARTITION public.kds_ticket_p2_status_cooking_at_idx;


--
-- Name: kds_ticket_p3_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.kds_ticket_pkey ATTACH PARTITION public.kds_ticket_p3_pkey;


--
-- Name: kds_ticket_p3_station_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_station ATTACH PARTITION public.kds_ticket_p3_station_id_idx;


--
-- Name: kds_ticket_p3_status_cooking_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_kds_ticket_status ATTACH PARTITION public.kds_ticket_p3_status_cooking_at_idx;


--
-- Name: purchase_order_p0_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.purchase_order_pkey1 ATTACH PARTITION public.purchase_order_p0_pkey;


--
-- Name: purchase_order_p0_status_created_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_status_created ATTACH PARTITION public.purchase_order_p0_status_created_at_idx;


--
-- Name: purchase_order_p0_supplier_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_supplier ATTACH PARTITION public.purchase_order_p0_supplier_id_idx;


--
-- Name: purchase_order_p1_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.purchase_order_pkey1 ATTACH PARTITION public.purchase_order_p1_pkey;


--
-- Name: purchase_order_p1_status_created_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_status_created ATTACH PARTITION public.purchase_order_p1_status_created_at_idx;


--
-- Name: purchase_order_p1_supplier_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_supplier ATTACH PARTITION public.purchase_order_p1_supplier_id_idx;


--
-- Name: purchase_order_p2_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.purchase_order_pkey1 ATTACH PARTITION public.purchase_order_p2_pkey;


--
-- Name: purchase_order_p2_status_created_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_status_created ATTACH PARTITION public.purchase_order_p2_status_created_at_idx;


--
-- Name: purchase_order_p2_supplier_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_supplier ATTACH PARTITION public.purchase_order_p2_supplier_id_idx;


--
-- Name: purchase_order_p3_pkey; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.purchase_order_pkey1 ATTACH PARTITION public.purchase_order_p3_pkey;


--
-- Name: purchase_order_p3_status_created_at_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_status_created ATTACH PARTITION public.purchase_order_p3_status_created_at_idx;


--
-- Name: purchase_order_p3_supplier_id_idx; Type: INDEX ATTACH; Schema: public; Owner: postgres
--

ALTER INDEX public.idx_po_supplier ATTACH PARTITION public.purchase_order_p3_supplier_id_idx;


--
-- Name: batch_record batch_record_produced_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_record
    ADD CONSTRAINT batch_record_produced_by_id_fkey FOREIGN KEY (produced_by_id) REFERENCES public.staff_member(id);


--
-- Name: batch_record batch_record_sub_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.batch_record
    ADD CONSTRAINT batch_record_sub_recipe_id_fkey FOREIGN KEY (sub_recipe_id) REFERENCES public.sub_recipe(id);


--
-- Name: customer_dietary_tag customer_dietary_tag_customer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_dietary_tag
    ADD CONSTRAINT customer_dietary_tag_customer_profile_id_fkey FOREIGN KEY (customer_profile_id) REFERENCES public.customer_profile(id) ON DELETE CASCADE;


--
-- Name: customer_occasion customer_occasion_customer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_occasion
    ADD CONSTRAINT customer_occasion_customer_profile_id_fkey FOREIGN KEY (customer_profile_id) REFERENCES public.customer_profile(id) ON DELETE CASCADE;


--
-- Name: customer_profile customer_profile_loyalty_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_profile
    ADD CONSTRAINT customer_profile_loyalty_tier_id_fkey FOREIGN KEY (loyalty_tier_id) REFERENCES public.loyalty_tier(id);


--
-- Name: goods_receipt_note fk_grn_po; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note
    ADD CONSTRAINT fk_grn_po FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(id);


--
-- Name: inventory_transaction fk_inv_trans_ingredient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.inventory_transaction
    ADD CONSTRAINT fk_inv_trans_ingredient FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: purchase_order fk_po_generated_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.purchase_order
    ADD CONSTRAINT fk_po_generated_by FOREIGN KEY (generated_by_id) REFERENCES public.staff_member(id);


--
-- Name: purchase_order_line fk_po_line_ingredient; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT fk_po_line_ingredient FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: purchase_order_line fk_po_line_po; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT fk_po_line_po FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(id) ON DELETE CASCADE;


--
-- Name: purchase_order fk_po_supplier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.purchase_order
    ADD CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: vendor_invoice fk_vendor_invoice_po; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice
    ADD CONSTRAINT fk_vendor_invoice_po FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_order(id);


--
-- Name: goods_receipt_note_line goods_receipt_note_line_goods_receipt_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note_line
    ADD CONSTRAINT goods_receipt_note_line_goods_receipt_note_id_fkey FOREIGN KEY (goods_receipt_note_id) REFERENCES public.goods_receipt_note(id) ON DELETE CASCADE;


--
-- Name: goods_receipt_note_line goods_receipt_note_line_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note_line
    ADD CONSTRAINT goods_receipt_note_line_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: goods_receipt_note goods_receipt_note_received_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goods_receipt_note
    ADD CONSTRAINT goods_receipt_note_received_by_id_fkey FOREIGN KEY (received_by_id) REFERENCES public.staff_member(id);


--
-- Name: guest_cart_item guest_cart_item_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_cart_item
    ADD CONSTRAINT guest_cart_item_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: guest_cart_item guest_cart_item_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_cart_item
    ADD CONSTRAINT guest_cart_item_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.tableside_session(id);


--
-- Name: guest_feedback guest_feedback_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_feedback
    ADD CONSTRAINT guest_feedback_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customer_profile(id) ON DELETE CASCADE;


--
-- Name: kds_routing_rule kds_routing_rule_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_routing_rule
    ADD CONSTRAINT kds_routing_rule_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.kds_station(id);


--
-- Name: kds_ticket_item kds_ticket_item_kds_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kds_ticket_item
    ADD CONSTRAINT kds_ticket_item_kds_ticket_id_fkey FOREIGN KEY (kds_ticket_id) REFERENCES public.kds_ticket(id);


--
-- Name: kds_ticket kds_ticket_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE public.kds_ticket
    ADD CONSTRAINT kds_ticket_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.kds_station(id);


--
-- Name: loyalty_transaction loyalty_transaction_bonus_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transaction
    ADD CONSTRAINT loyalty_transaction_bonus_event_id_fkey FOREIGN KEY (bonus_event_id) REFERENCES public.bonus_point_event(id);


--
-- Name: loyalty_transaction loyalty_transaction_customer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transaction
    ADD CONSTRAINT loyalty_transaction_customer_profile_id_fkey FOREIGN KEY (customer_profile_id) REFERENCES public.customer_profile(id);


--
-- Name: loyalty_transaction loyalty_transaction_order_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transaction
    ADD CONSTRAINT loyalty_transaction_order_ticket_id_fkey FOREIGN KEY (order_ticket_id) REFERENCES public.order_ticket(id);


--
-- Name: menu_item menu_item_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item
    ADD CONSTRAINT menu_item_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.menu_category(id);


--
-- Name: menu_item_modifier_group menu_item_modifier_group_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifier_group
    ADD CONSTRAINT menu_item_modifier_group_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: menu_item_modifier_group menu_item_modifier_group_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.menu_item_modifier_group
    ADD CONSTRAINT menu_item_modifier_group_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_group(id);


--
-- Name: modifier_option modifier_option_modifier_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modifier_option
    ADD CONSTRAINT modifier_option_modifier_group_id_fkey FOREIGN KEY (modifier_group_id) REFERENCES public.modifier_group(id);


--
-- Name: notification_logs notification_logs_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE SET NULL;


--
-- Name: notification_logs notification_logs_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id) ON DELETE SET NULL;


--
-- Name: notification_templates notification_templates_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: notification_templates notification_templates_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id) ON DELETE CASCADE;


--
-- Name: notification_type_channels notification_type_channels_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: notification_type_channels notification_type_channels_fallback_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_fallback_channel_id_fkey FOREIGN KEY (fallback_channel_id) REFERENCES public.channels(id) ON DELETE SET NULL;


--
-- Name: notification_type_channels notification_type_channels_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id) ON DELETE CASCADE;


--
-- Name: notification_type_channels notification_type_channels_recipient_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_type_channels
    ADD CONSTRAINT notification_type_channels_recipient_group_id_fkey FOREIGN KEY (recipient_group_id) REFERENCES public.recipient_groups(id) ON DELETE SET NULL;


--
-- Name: order_audit_log order_audit_log_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_audit_log
    ADD CONSTRAINT order_audit_log_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.order_ticket(id);


--
-- Name: order_audit_log order_audit_log_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_audit_log
    ADD CONSTRAINT order_audit_log_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.staff_member(id);


--
-- Name: order_item order_item_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: order_item_modifier order_item_modifier_modifier_option_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_modifier
    ADD CONSTRAINT order_item_modifier_modifier_option_id_fkey FOREIGN KEY (modifier_option_id) REFERENCES public.modifier_option(id);


--
-- Name: order_item_modifier order_item_modifier_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item_modifier
    ADD CONSTRAINT order_item_modifier_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_item(id);


--
-- Name: order_item order_item_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_item
    ADD CONSTRAINT order_item_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.order_ticket(id);


--
-- Name: order_ticket order_ticket_customer_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_ticket
    ADD CONSTRAINT order_ticket_customer_profile_id_fkey FOREIGN KEY (customer_profile_id) REFERENCES public.customer_profile(id);


--
-- Name: order_ticket order_ticket_parent_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_ticket
    ADD CONSTRAINT order_ticket_parent_ticket_id_fkey FOREIGN KEY (parent_ticket_id) REFERENCES public.order_ticket(id);


--
-- Name: order_ticket order_ticket_server_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_ticket
    ADD CONSTRAINT order_ticket_server_id_fkey FOREIGN KEY (server_id) REFERENCES public.staff_member(id);


--
-- Name: order_ticket order_ticket_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_ticket
    ADD CONSTRAINT order_ticket_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.table_shape(id);


--
-- Name: payment payment_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.order_ticket(id);


--
-- Name: po_status_history po_status_history_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.po_status_history
    ADD CONSTRAINT po_status_history_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_order(id);


--
-- Name: promo_code promo_code_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promo_code
    ADD CONSTRAINT promo_code_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.customer_segment(id) ON DELETE SET NULL;


--
-- Name: purchase_order_line purchase_order_line_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_line
    ADD CONSTRAINT purchase_order_line_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: raw_ingredient_allergen raw_ingredient_allergen_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_ingredient_allergen
    ADD CONSTRAINT raw_ingredient_allergen_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id) ON DELETE CASCADE;


--
-- Name: raw_ingredient raw_ingredient_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.raw_ingredient
    ADD CONSTRAINT raw_ingredient_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: recipe recipe_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.staff_member(id);


--
-- Name: recipe_ingredient recipe_ingredient_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: recipe_ingredient recipe_ingredient_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id) ON DELETE CASCADE;


--
-- Name: recipe_ingredient recipe_ingredient_sub_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredient
    ADD CONSTRAINT recipe_ingredient_sub_recipe_id_fkey FOREIGN KEY (sub_recipe_id) REFERENCES public.sub_recipe(id);


--
-- Name: recipe recipe_menu_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_menu_item_id_fkey FOREIGN KEY (menu_item_id) REFERENCES public.menu_item(id);


--
-- Name: recipe recipe_sub_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe
    ADD CONSTRAINT recipe_sub_recipe_id_fkey FOREIGN KEY (sub_recipe_id) REFERENCES public.sub_recipe(id);


--
-- Name: recipients recipients_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipients
    ADD CONSTRAINT recipients_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.recipient_groups(id) ON DELETE CASCADE;


--
-- Name: reservation reservation_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.staff_member(id);


--
-- Name: reservation reservation_handled_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_handled_by_id_fkey FOREIGN KEY (handled_by_id) REFERENCES public.staff_member(id);


--
-- Name: reservation reservation_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservation
    ADD CONSTRAINT reservation_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.table_shape(id);


--
-- Name: rfq rfq_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rfq
    ADD CONSTRAINT rfq_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.staff_permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.staff_roles(id) ON DELETE CASCADE;


--
-- Name: segment_rule segment_rule_segment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.segment_rule
    ADD CONSTRAINT segment_rule_segment_id_fkey FOREIGN KEY (segment_id) REFERENCES public.customer_segment(id) ON DELETE CASCADE;


--
-- Name: staff_device_bindings staff_device_bindings_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_device_bindings
    ADD CONSTRAINT staff_device_bindings_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff_member(id) ON DELETE CASCADE;


--
-- Name: staff_member staff_member_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_member
    ADD CONSTRAINT staff_member_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.staff_roles(id);


--
-- Name: staff_roles staff_roles_parent_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_parent_role_id_fkey FOREIGN KEY (parent_role_id) REFERENCES public.staff_roles(id);


--
-- Name: supplier_ingredient_pricing supplier_ingredient_pricing_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ingredient_pricing
    ADD CONSTRAINT supplier_ingredient_pricing_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: supplier_ingredient_pricing supplier_ingredient_pricing_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_ingredient_pricing
    ADD CONSTRAINT supplier_ingredient_pricing_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: supplier_policy supplier_policy_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_policy
    ADD CONSTRAINT supplier_policy_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: supplier_user supplier_user_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_user
    ADD CONSTRAINT supplier_user_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id) ON DELETE CASCADE;


--
-- Name: table_shape table_shape_assigned_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_shape
    ADD CONSTRAINT table_shape_assigned_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.staff_member(id);


--
-- Name: table_shape table_shape_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.table_shape
    ADD CONSTRAINT table_shape_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.section(id);


--
-- Name: tableside_session tableside_session_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tableside_session
    ADD CONSTRAINT tableside_session_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.table_shape(id);


--
-- Name: user_notification_preferences user_notification_preferences_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: user_notification_preferences user_notification_preferences_notification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_notification_type_id_fkey FOREIGN KEY (notification_type_id) REFERENCES public.notification_types(id) ON DELETE CASCADE;


--
-- Name: vendor_bid vendor_bid_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_bid
    ADD CONSTRAINT vendor_bid_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfq(id);


--
-- Name: vendor_bid vendor_bid_submitted_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_bid
    ADD CONSTRAINT vendor_bid_submitted_by_id_fkey FOREIGN KEY (submitted_by_id) REFERENCES public.supplier_user(id);


--
-- Name: vendor_bid vendor_bid_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_bid
    ADD CONSTRAINT vendor_bid_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: vendor_invoice_line vendor_invoice_line_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice_line
    ADD CONSTRAINT vendor_invoice_line_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: vendor_invoice_line vendor_invoice_line_vendor_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_invoice_line
    ADD CONSTRAINT vendor_invoice_line_vendor_invoice_id_fkey FOREIGN KEY (vendor_invoice_id) REFERENCES public.vendor_invoice(id) ON DELETE CASCADE;


--
-- Name: vendor_price_proposal vendor_price_proposal_generated_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_generated_po_id_fkey FOREIGN KEY (generated_po_id) REFERENCES public.purchase_order(id);


--
-- Name: vendor_price_proposal vendor_price_proposal_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.raw_ingredient(id);


--
-- Name: vendor_price_proposal vendor_price_proposal_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.staff_member(id);


--
-- Name: vendor_price_proposal vendor_price_proposal_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.supplier_user(id);


--
-- Name: vendor_price_proposal vendor_price_proposal_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor_price_proposal
    ADD CONSTRAINT vendor_price_proposal_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.supplier(id);


--
-- Name: waitlist_entry waitlist_entry_handled_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT waitlist_entry_handled_by_id_fkey FOREIGN KEY (handled_by_id) REFERENCES public.staff_member(id);


--
-- Name: waitlist_entry waitlist_entry_seated_at_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.waitlist_entry
    ADD CONSTRAINT waitlist_entry_seated_at_table_id_fkey FOREIGN KEY (seated_at_table_id) REFERENCES public.table_shape(id);


--
-- PostgreSQL database dump complete
--

\unrestrict VdBhNWzbcnEzDbiDuZy0XxEXztZBmpehaSzUdM3XxtumddG01DTOTERzmTHCD8E

