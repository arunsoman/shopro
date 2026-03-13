--
-- PostgreSQL database dump
--

\restrict LhUfyTWeOE7WG5Ohygspt2OIPbM4kD2va0QbcylkrOtXrWxNJCrms2ix0tYYk9z

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
-- Data for Name: rfq; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.rfq (id, ingredient_id, required_qty, status, desired_delivery_date, bid_deadline, created_at, updated_at, version) VALUES ('f0000000-0000-0000-0000-000000000002', '00000000-1000-0000-0000-000000000001', 30.0000, 'OPEN', '2026-03-14', '2026-03-13 07:48:21.919661+00', '2026-03-11 17:18:21.919661+00', '2026-03-13 07:18:46.830529+00', 29);
INSERT INTO public.rfq (id, ingredient_id, required_qty, status, desired_delivery_date, bid_deadline, created_at, updated_at, version) VALUES ('59a3049f-93d7-4dd0-8f88-ecf3efbcc0f5', '00000000-1000-0000-0000-000000000002', 100.0000, 'CLOSED', '2026-03-15', '2026-03-11 09:47:37.596785+00', '2026-03-07 14:47:37.599066+00', '2026-03-11 09:51:03.413856+00', 135);
INSERT INTO public.rfq (id, ingredient_id, required_qty, status, desired_delivery_date, bid_deadline, created_at, updated_at, version) VALUES ('f0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000002', 50.0000, 'OPEN', '2026-03-16', '2026-03-13 17:18:21.914315+00', '2026-03-11 17:18:21.914315+00', '2026-03-11 17:18:21.914315+00', 0);
INSERT INTO public.rfq (id, ingredient_id, required_qty, status, desired_delivery_date, bid_deadline, created_at, updated_at, version) VALUES ('e711a27f-78ae-47bf-b3df-a8546dfd022b', '00000000-1000-0000-0000-000000000003', 100.0000, 'AWARDED', '2026-03-11', '2026-03-12 10:45:33.587386+00', '2026-03-11 10:45:33.590804+00', '2026-03-12 10:45:56.107558+00', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict LhUfyTWeOE7WG5Ohygspt2OIPbM4kD2va0QbcylkrOtXrWxNJCrms2ix0tYYk9z

