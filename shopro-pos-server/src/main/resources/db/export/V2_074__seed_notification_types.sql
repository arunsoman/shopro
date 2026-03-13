--
-- PostgreSQL database dump
--

\restrict 4cdRmk9lOByovqft3KADsOeUngJj2gf2dRTVcxEz1pGEalU1oN7Cjiu1UoqYdoO

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
-- Data for Name: notification_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('10000000-0000-0000-0000-000000000001', 'SYSTEM_WARNING', 'System Warning', NULL, 'SYSTEM', 'WARNING', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('10000000-0000-0000-0000-000000000002', 'STOCK_CRITICAL', 'Critical Stock', NULL, 'INVENTORY', 'CRITICAL', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('10000000-0000-0000-0000-000000000003', 'PO_APPROVAL', 'Purchase Order Approval', NULL, 'PURCHASING', 'INFO', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('10000000-0000-0000-0000-000000000004', 'NEW_ORDER', 'New Online Order', NULL, 'KDS', 'INFO', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('e8400bc8-cf33-417e-94ef-0eef480fc7ae', 'TABLE_DIRTY', 'Table Dirty', NULL, 'FLOOR', 'INFO', '2026-03-07 19:20:36.617344+00', '2026-03-07 19:20:36.617344+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('31d5ebf9-6494-4583-8a54-769dd6d4938f', 'TABLE_VACANT', 'Table Vacant', NULL, 'FLOOR', 'INFO', '2026-03-07 19:20:36.617344+00', '2026-03-07 19:20:36.617344+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('95612eb7-422a-464a-9b7a-d304d0f1a66a', 'TABLE_OCCUPIED', 'Table Occupied', NULL, 'FLOOR', 'INFO', '2026-03-07 20:14:37.646764+00', '2026-03-07 20:14:37.646764+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('d07d0ffb-820c-44c8-97ee-7ee161e725b2', 'PO_APPROVAL_REQUIRED', 'PO Approval Required', NULL, 'PURCHASING', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('17b9f62d-8d32-4dc3-b5b9-1b72ddd0af17', 'BID_RECEIVED', 'Vendor Bid Received', NULL, 'PURCHASING', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('0e95e32e-451a-4536-8daa-a683eb81e9e1', 'ORDER_READY', 'Order Ready for Pickup', NULL, 'KDS', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('64f183eb-2a06-4c84-a5fc-719e1532b215', 'ITEM_REJECTED', 'Kitchen 86''d Item', NULL, 'KDS', 'WARNING', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('825356bc-4aaf-440f-8953-62612a4f13ae', 'ASSISTANCE_NEEDED', 'Customer Assistance Needed', NULL, 'FLOOR', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('be065cfe-04b1-46ac-a2da-9079ac58a170', 'VOID_REQUEST', 'Void Approval Request', NULL, 'POS', 'WARNING', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('7131c9d7-1e72-4efd-87a6-f4f08ac2111a', 'CURBSIDE_ARRIVAL', 'Curbside Arrival', NULL, 'FLOOR', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('2a1f4e61-eb9d-4140-aaf7-b4bcea2d0867', 'SHRINKAGE_ALERT', 'High Variance Alert', NULL, 'INVENTORY', 'WARNING', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('5b4b6702-030e-40c5-b0cd-81b6c89b8988', 'OVERTIME_WARNING', 'Approaching Overtime', NULL, 'STAFF', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);
INSERT INTO public.notification_types (id, code, name, description, category, severity, created_at, updated_at, version, is_active, is_mutable) VALUES ('b35ef82f-c3fa-4cfe-931a-a5cd48531a9d', 'VIP_GUEST_SEATED', 'VIP Guest Seated', NULL, 'FLOOR', 'INFO', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, true, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 4cdRmk9lOByovqft3KADsOeUngJj2gf2dRTVcxEz1pGEalU1oN7Cjiu1UoqYdoO

