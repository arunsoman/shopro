--
-- PostgreSQL database dump
--

\restrict DSPizDWtIu6s33FiEVtZQ6pbWujOgBWCDfC2OVlJIYH2QWm9TEcULzAnbGj9vUZ

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
-- Data for Name: purchase_order_p3; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.purchase_order_p3 (id, supplier_id, generated_by_id, status, sent_at, received_at, created_at, updated_at, version, total_value, expected_delivery_date, approved_by_id, approved_at, tracking_number, invoice_file_id, delivery_note_ref, shipped_at, source_bid_id, source_proposal_id, counter_offer_price, counter_offer_qty, counter_offer_date, counter_offer_notes, acknowledged_at) VALUES ('442aacd3-481f-47f9-a32f-6eca393f4bb0', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SHIPPED', NULL, NULL, '2026-03-11 18:19:24.928908+00', '2026-03-11 18:22:00.005426+00', 3, 1.3000, NULL, NULL, NULL, 'FEDX-343032423', '00000000-0000-0000-0000-000000000000', '', '2026-03-11 18:21:59.954733+00', NULL, '4362127a-8846-48e2-9193-95c736e10bc3', NULL, NULL, NULL, NULL, '2026-03-11 18:20:06.49786+00');


--
-- PostgreSQL database dump complete
--

\unrestrict DSPizDWtIu6s33FiEVtZQ6pbWujOgBWCDfC2OVlJIYH2QWm9TEcULzAnbGj9vUZ

