--
-- PostgreSQL database dump
--

\restrict yyiSBJrpzjg7pJj4S4OwRtad62ZLL5DwdZRq7YVtaV0fYVQ7kGdyYOeNFrsnvUf

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
-- Data for Name: vendor_bid; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, payment_terms, notes, status, created_at, updated_at, version, submitted_by_id) VALUES ('77297553-c8f1-4b41-9613-9ba82ead165f', '59a3049f-93d7-4dd0-8f88-ecf3efbcc0f5', 'c0000000-0000-0000-0000-000000000001', 10.0000, 100.0000, '2026-03-11', NULL, '', 'WON', '2026-03-11 09:32:54.891767+00', '2026-03-11 09:51:03.401556+00', 1, '10000000-0000-0000-0000-000000000001');
INSERT INTO public.vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, payment_terms, notes, status, created_at, updated_at, version, submitted_by_id) VALUES ('15424087-7f37-40b2-9e3b-2f38b51836d7', '59a3049f-93d7-4dd0-8f88-ecf3efbcc0f5', 'c0000000-0000-0000-0000-000000000001', 10.0000, 100.0000, '2026-03-11', NULL, '', 'LOST', '2026-03-11 09:29:38.611956+00', '2026-03-11 09:51:03.415166+00', 1, '10000000-0000-0000-0000-000000000001');
INSERT INTO public.vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, payment_terms, notes, status, created_at, updated_at, version, submitted_by_id) VALUES ('b0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 1.3000, 30.0000, '2026-03-13', NULL, NULL, 'WON', '2026-03-06 17:18:21.921858+00', '2026-03-11 17:18:21.921858+00', 0, NULL);
INSERT INTO public.vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, payment_terms, notes, status, created_at, updated_at, version, submitted_by_id) VALUES ('b0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 0.9400, 50.0000, '2026-03-15', NULL, NULL, 'SUBMITTED', '2026-03-11 15:18:21.925297+00', '2026-03-11 17:18:21.925297+00', 0, NULL);
INSERT INTO public.vendor_bid (id, rfq_id, supplier_id, unit_price, quantity_available, delivery_date, payment_terms, notes, status, created_at, updated_at, version, submitted_by_id) VALUES ('aa191e6b-2b89-4b69-9431-6775e6e8db60', 'e711a27f-78ae-47bf-b3df-a8546dfd022b', 'c0000000-0000-0000-0000-000000000001', 130.0000, 100.0000, '2026-03-12', NULL, '', 'WON', '2026-03-11 19:01:29.758495+00', '2026-03-12 10:45:56.116852+00', 1, '10000000-0000-0000-0000-000000000001');


--
-- PostgreSQL database dump complete
--

\unrestrict yyiSBJrpzjg7pJj4S4OwRtad62ZLL5DwdZRq7YVtaV0fYVQ7kGdyYOeNFrsnvUf

