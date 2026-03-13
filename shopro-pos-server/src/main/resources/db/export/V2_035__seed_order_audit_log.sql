--
-- PostgreSQL database dump
--

\restrict hDhstBJiU76ApOMX4Decg4VbkmxLNvw0miGmk7TdILyI8FVGinjrbKRRFISX8Oo

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
-- Data for Name: order_audit_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_audit_log (id, order_id, event_type, details, performed_by, created_at, signature_hash) VALUES ('4918996c-877a-41b9-8aa5-ebedd82a6743', '3dbc739a-0b25-4a68-a03c-691173c19e08', 'ORDER_CREATED', 'Order started for DINE_IN', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-03-12 16:54:28.403284+00', NULL);
INSERT INTO public.order_audit_log (id, order_id, event_type, details, performed_by, created_at, signature_hash) VALUES ('9f276c30-eeb4-4149-b21a-3e990f5a430d', '9b837648-5055-48b0-bc85-165834e00c12', 'ORDER_CREATED', 'Order started for DINE_IN', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-03-13 02:12:15.072434+00', NULL);
INSERT INTO public.order_audit_log (id, order_id, event_type, details, performed_by, created_at, signature_hash) VALUES ('948e27b2-76a8-46f2-a148-2179a3ff83d3', '9b837648-5055-48b0-bc85-165834e00c12', 'KITCHEN_SENT', 'Items sent to kitchen: 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-03-13 02:13:00.853499+00', NULL);
INSERT INTO public.order_audit_log (id, order_id, event_type, details, performed_by, created_at, signature_hash) VALUES ('74ccba4a-f7bd-4d9d-a35f-aafff3f74033', '9b837648-5055-48b0-bc85-165834e00c12', 'KITCHEN_SENT', 'Items sent to kitchen: 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2026-03-13 02:44:42.010907+00', NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict hDhstBJiU76ApOMX4Decg4VbkmxLNvw0miGmk7TdILyI8FVGinjrbKRRFISX8Oo

