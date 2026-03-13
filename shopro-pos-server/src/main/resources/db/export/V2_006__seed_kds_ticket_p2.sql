--
-- PostgreSQL database dump
--

\restrict jcbWukNJfJqGTzRAGQ5yAopVO6aTvGDBmgn9cUZ0KojtWR4bpL1Ler5cMNQ75td

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
-- Data for Name: kds_ticket_p2; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kds_ticket_p2 (id, order_ticket_id, station_id, status, fired_at, bumped_at, created_at, updated_at, version, cooking_at) VALUES ('8e82862c-d75d-4f99-b7b8-01d77a5b5e20', '9b837648-5055-48b0-bc85-165834e00c12', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'READY', '2026-03-13 02:44:41.972183+00', '2026-03-13 04:11:55.198891+00', '2026-03-13 02:44:42.001159+00', '2026-03-13 04:11:55.200361+00', 1, NULL);
INSERT INTO public.kds_ticket_p2 (id, order_ticket_id, station_id, status, fired_at, bumped_at, created_at, updated_at, version, cooking_at) VALUES ('d25fca26-9afb-4e0e-9561-69df6197836c', '9b837648-5055-48b0-bc85-165834e00c12', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'COOKING', '2026-03-13 02:13:00.817783+00', NULL, '2026-03-13 02:13:00.840054+00', '2026-03-13 04:28:48.396975+00', 1, '2026-03-13 04:28:48.392572+00');


--
-- PostgreSQL database dump complete
--

\unrestrict jcbWukNJfJqGTzRAGQ5yAopVO6aTvGDBmgn9cUZ0KojtWR4bpL1Ler5cMNQ75td

