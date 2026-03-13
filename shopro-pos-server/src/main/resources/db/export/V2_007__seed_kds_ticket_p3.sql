--
-- PostgreSQL database dump
--

\restrict YDz4abvOiAfmVMSY015VLa0caUI2zLa9vTtLP0cZBRVKzuNeqS1eKCcP2TBa47q

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
-- Data for Name: kds_ticket_p3; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kds_ticket_p3 (id, order_ticket_id, station_id, status, fired_at, bumped_at, created_at, updated_at, version, cooking_at) VALUES ('20eb02be-922f-4c1b-b4fb-a35e3fc68fbb', '9b837648-5055-48b0-bc85-165834e00c12', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11', 'READY', '2026-03-13 02:13:00.825005+00', '2026-03-13 06:51:57.10463+00', '2026-03-13 02:13:00.846933+00', '2026-03-13 06:51:57.105045+00', 3, NULL);
INSERT INTO public.kds_ticket_p3 (id, order_ticket_id, station_id, status, fired_at, bumped_at, created_at, updated_at, version, cooking_at) VALUES ('16bbf1ee-bc0b-44a1-b383-cf991792821f', '9b837648-5055-48b0-bc85-165834e00c12', 'e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11', 'READY', '2026-03-13 02:44:41.981487+00', '2026-03-13 06:51:57.332302+00', '2026-03-13 02:44:42.005745+00', '2026-03-13 06:51:57.332747+00', 4, '2026-03-13 05:14:34.337383+00');


--
-- PostgreSQL database dump complete
--

\unrestrict YDz4abvOiAfmVMSY015VLa0caUI2zLa9vTtLP0cZBRVKzuNeqS1eKCcP2TBa47q

