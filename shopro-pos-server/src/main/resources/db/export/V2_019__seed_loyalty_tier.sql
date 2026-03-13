--
-- PostgreSQL database dump
--

\restrict ble3ijdsalwNhWF5cRrXKib9KYOzOztPWbGCc2EbCXPQzsGysc8BEycHfccK8Db

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
-- Data for Name: loyalty_tier; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.loyalty_tier (id, name, spend_threshold, point_multiplier, created_at, updated_at, version) VALUES ('a2000000-0000-0000-0000-000000000001', 'BRONZE', 0.00, 1.00, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.loyalty_tier (id, name, spend_threshold, point_multiplier, created_at, updated_at, version) VALUES ('a2000000-0000-0000-0000-000000000002', 'SILVER', 1000.00, 1.25, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.loyalty_tier (id, name, spend_threshold, point_multiplier, created_at, updated_at, version) VALUES ('a2000000-0000-0000-0000-000000000003', 'GOLD', 5000.00, 1.50, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00', 0);
INSERT INTO public.loyalty_tier (id, name, spend_threshold, point_multiplier, created_at, updated_at, version) VALUES ('a2000000-0000-0000-0000-000000000004', 'PLATINUM', 10000.00, 2.00, '2026-03-10 20:53:39.713557+00', '2026-03-10 20:53:39.713557+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict ble3ijdsalwNhWF5cRrXKib9KYOzOztPWbGCc2EbCXPQzsGysc8BEycHfccK8Db

