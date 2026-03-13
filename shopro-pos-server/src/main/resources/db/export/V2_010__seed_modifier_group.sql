--
-- PostgreSQL database dump
--

\restrict AglVtFy20p35yXo3ZNbqUfVgyL93UmYo3b5MOSRyQkME89HVIQeV2H2TYhW59hy

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
-- Data for Name: modifier_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modifier_group (id, name, required, min_selections, max_selections, created_at, updated_at, version) VALUES ('b1000000-0000-0000-0000-000000000001', 'Meat Temperature', true, 1, 1, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_group (id, name, required, min_selections, max_selections, created_at, updated_at, version) VALUES ('b1000000-0000-0000-0000-000000000002', 'Burger Add-ons', false, 0, 3, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict AglVtFy20p35yXo3ZNbqUfVgyL93UmYo3b5MOSRyQkME89HVIQeV2H2TYhW59hy

