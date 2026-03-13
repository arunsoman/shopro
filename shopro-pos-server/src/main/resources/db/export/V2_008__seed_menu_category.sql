--
-- PostgreSQL database dump
--

\restrict PPuRDtP2Cnd7v2wgAdIasldPyFfOSJEzdA1bSSDvuQePvmq6dXdI2Obde93yBea

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
-- Data for Name: menu_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_category (id, name, display_order, created_at, updated_at, version, default_course) VALUES ('a1000000-0000-0000-0000-000000000001', 'Starters', 1, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, 1);
INSERT INTO public.menu_category (id, name, display_order, created_at, updated_at, version, default_course) VALUES ('a1000000-0000-0000-0000-000000000002', 'Burgers', 2, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, 2);
INSERT INTO public.menu_category (id, name, display_order, created_at, updated_at, version, default_course) VALUES ('a1000000-0000-0000-0000-000000000003', 'Mains', 3, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, 2);
INSERT INTO public.menu_category (id, name, display_order, created_at, updated_at, version, default_course) VALUES ('a1000000-0000-0000-0000-000000000004', 'Drinks', 4, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, 4);


--
-- PostgreSQL database dump complete
--

\unrestrict PPuRDtP2Cnd7v2wgAdIasldPyFfOSJEzdA1bSSDvuQePvmq6dXdI2Obde93yBea

