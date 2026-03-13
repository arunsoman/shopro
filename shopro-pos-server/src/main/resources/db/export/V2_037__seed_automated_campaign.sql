--
-- PostgreSQL database dump
--

\restrict Nfwvtn0G9MHZ59MjHWyc3eN8L1aYG9jlowbmnkEEL1qWNggtfZbBeOFwvz1L5G2

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
-- Data for Name: automated_campaign; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.automated_campaign (id, name, trigger_event, delay_hours, template_id, is_active, created_at, updated_at) VALUES ('03cc6745-1333-49fa-8ee9-dff687e0d4b3', 'Birthday Gift ($10 Off)', 'BIRTHDAY', 0, NULL, true, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00');
INSERT INTO public.automated_campaign (id, name, trigger_event, delay_hours, template_id, is_active, created_at, updated_at) VALUES ('1e2451e3-ca42-4572-a7f3-8f54e8da9428', 'We Miss You!', 'INACTIVE_30_DAYS', 24, NULL, true, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00');
INSERT INTO public.automated_campaign (id, name, trigger_event, delay_hours, template_id, is_active, created_at, updated_at) VALUES ('1854a810-5368-4671-8b0a-1c2bd6b09567', 'First Visit Welcome', 'FIRST_VISIT', 1, NULL, true, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00');
INSERT INTO public.automated_campaign (id, name, trigger_event, delay_hours, template_id, is_active, created_at, updated_at) VALUES ('e1b5e5a8-aff5-4231-b426-57e23299584e', 'Gold Tier Milestone', 'TIER_UPGRADE', 0, NULL, true, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00');


--
-- PostgreSQL database dump complete
--

\unrestrict Nfwvtn0G9MHZ59MjHWyc3eN8L1aYG9jlowbmnkEEL1qWNggtfZbBeOFwvz1L5G2

