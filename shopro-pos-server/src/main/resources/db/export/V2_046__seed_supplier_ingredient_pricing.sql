--
-- PostgreSQL database dump
--

\restrict cdFbSylA5pmIQQQbskqkShNQcoSUgwAKyeCs5gTcqU10ZraTFZ08D7XbAISAirW

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
-- Data for Name: supplier_ingredient_pricing; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000002', 0.9500, 'GFS-SAL-001', '2026-03-11 09:28:32.518437+00', '2026-03-11 09:28:32.518437+00', '2026-03-11 09:28:32.518437+00', 0);
INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('b41be342-6c11-4482-9a7a-ed4c45d44814', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000003', 10.5000, NULL, '2026-03-11 11:52:34.693978+00', '2026-03-11 11:52:34.698361+00', '2026-03-11 11:52:34.698391+00', 0);
INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('abe34385-405e-4bbd-b2f6-0789872e7d27', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000007', 0.4400, NULL, '2026-03-11 14:25:22.080035+00', '2026-03-11 14:25:22.127835+00', '2026-03-11 14:25:22.127869+00', 0);
INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('4fe04278-cecf-4fa3-a30c-ed90064ebdaa', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000006', 0.5000, NULL, '2026-03-11 17:29:50.026245+00', '2026-03-11 17:29:50.090864+00', '2026-03-11 17:29:50.090959+00', 0);
INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000001', 1.3000, 'GFS-BEEF-RIB', '2026-03-11 18:19:24.891179+00', '2026-03-11 09:28:32.518437+00', '2026-03-11 18:19:24.937638+00', 1);
INSERT INTO public.supplier_ingredient_pricing (id, supplier_id, ingredient_id, unit_price, vendor_sku, last_updated_at, created_at, updated_at, version) VALUES ('5fe7e106-9d33-444a-b259-2acebd91cca8', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000005', 0.4000, NULL, '2026-03-11 18:23:45.258816+00', '2026-03-11 12:33:42.053571+00', '2026-03-11 18:23:45.294606+00', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict cdFbSylA5pmIQQQbskqkShNQcoSUgwAKyeCs5gTcqU10ZraTFZ08D7XbAISAirW

