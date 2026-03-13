--
-- PostgreSQL database dump
--

\restrict CX5j5GAGZV4JExjL98rdCP7c54llIuiybo9cGEK2YcrG300WGMr3SlLJCV3HNsa

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
-- Data for Name: purchase_order_p0; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.purchase_order_p0 (id, supplier_id, generated_by_id, status, sent_at, received_at, created_at, updated_at, version, total_value, expected_delivery_date, approved_by_id, approved_at, tracking_number, invoice_file_id, delivery_note_ref, shipped_at, source_bid_id, source_proposal_id, counter_offer_price, counter_offer_qty, counter_offer_date, counter_offer_notes, acknowledged_at) VALUES ('21f6a33e-b243-461d-bad3-724bec83bf17', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'RECEIVED', NULL, NULL, '2026-03-11 18:23:45.275847+00', '2026-03-11 18:52:39.319657+00', 4, 0.4000, NULL, NULL, NULL, 'FEDX-343032423', '11111111-2222-3333-4444-555555555555', '', '2026-03-11 18:25:44.234136+00', NULL, '2009dac2-4203-4763-9baa-b4468932aeb5', NULL, NULL, NULL, NULL, '2026-03-11 18:24:27.67871+00');
INSERT INTO public.purchase_order_p0 (id, supplier_id, generated_by_id, status, sent_at, received_at, created_at, updated_at, version, total_value, expected_delivery_date, approved_by_id, approved_at, tracking_number, invoice_file_id, delivery_note_ref, shipped_at, source_bid_id, source_proposal_id, counter_offer_price, counter_offer_qty, counter_offer_date, counter_offer_notes, acknowledged_at) VALUES ('28170a96-b00c-4b7e-8c05-4d8a30f2cb1e', 'c0000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'DRAFT', NULL, NULL, '2026-03-12 10:45:56.068278+00', '2026-03-12 10:45:56.068318+00', 0, 13000.0000, '2026-03-12', NULL, NULL, NULL, NULL, NULL, NULL, 'aa191e6b-2b89-4b69-9431-6775e6e8db60', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict CX5j5GAGZV4JExjL98rdCP7c54llIuiybo9cGEK2YcrG300WGMr3SlLJCV3HNsa

