--
-- PostgreSQL database dump
--

\restrict XbX1RTTESVtQVltv8lysg6pj3m0wprvAaf2lqIELcBW3ZAWU0YcKiErZXP5OCDq

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
-- Data for Name: sub_recipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.sub_recipe (id, name, yield_quantity, unit_of_measure, cost_per_unit, created_at, updated_at, version) VALUES ('00000000-5000-0000-0000-000000000001', 'Burger Patty (Prepped)', 1.0000, 'ea', 0.5200, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0);
INSERT INTO public.sub_recipe (id, name, yield_quantity, unit_of_measure, cost_per_unit, created_at, updated_at, version) VALUES ('00000000-5000-0000-0000-000000000002', 'Special Sauce (1L Batch)', 1000.0000, 'ml', 0.0100, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0);
INSERT INTO public.sub_recipe (id, name, yield_quantity, unit_of_measure, cost_per_unit, created_at, updated_at, version) VALUES ('00000000-5000-0000-0000-000000000003', 'Caesar Dressing (1L Batch)', 1000.0000, 'ml', 0.0100, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict XbX1RTTESVtQVltv8lysg6pj3m0wprvAaf2lqIELcBW3ZAWU0YcKiErZXP5OCDq

