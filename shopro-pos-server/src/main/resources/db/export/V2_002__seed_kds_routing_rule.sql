--
-- PostgreSQL database dump
--

\restrict 0cdpufPg7BDqusTXDFMYKuf2sGphqlFyw6AKSnMbLkvcjtqywkVTxHKCncTp5Fa

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
-- Data for Name: kds_routing_rule; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kds_routing_rule (id, station_id, target_type, target_id, created_at, updated_at, version) VALUES ('29f4583a-9d5c-4aa8-bc29-5cdb700158fa', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'CATEGORY', 'a1000000-0000-0000-0000-000000000001', '2026-03-12 10:38:45.769717+00', '2026-03-12 10:38:45.769717+00', 0);
INSERT INTO public.kds_routing_rule (id, station_id, target_type, target_id, created_at, updated_at, version) VALUES ('1b1aa86a-a71e-4cc8-b5d1-0cd9cee21ff9', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'CATEGORY', 'a1000000-0000-0000-0000-000000000002', '2026-03-12 10:38:45.769717+00', '2026-03-12 10:38:45.769717+00', 0);
INSERT INTO public.kds_routing_rule (id, station_id, target_type, target_id, created_at, updated_at, version) VALUES ('2f9f750e-83d7-4941-b5cf-5ac5a7a627af', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'CATEGORY', 'a1000000-0000-0000-0000-000000000003', '2026-03-12 10:38:45.769717+00', '2026-03-12 10:38:45.769717+00', 0);
INSERT INTO public.kds_routing_rule (id, station_id, target_type, target_id, created_at, updated_at, version) VALUES ('50b43fa6-bf49-4695-b095-e63cb852bb6c', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44', 'CATEGORY', 'a1000000-0000-0000-0000-000000000004', '2026-03-12 10:38:45.769717+00', '2026-03-12 10:38:45.769717+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict 0cdpufPg7BDqusTXDFMYKuf2sGphqlFyw6AKSnMbLkvcjtqywkVTxHKCncTp5Fa

