--
-- PostgreSQL database dump
--

\restrict QMTR7hDIQowl1b0G6b2TvdBDVUoA824tne35vE971M350djFEo7wRHE6owmyGfj

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
-- Data for Name: kds_station; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kds_station (id, name, station_type, online, created_at, updated_at, version) VALUES ('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e11', 'EXPO Aggregator', 'EXPO', true, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.kds_station (id, name, station_type, online, created_at, updated_at, version) VALUES ('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e22', 'Grill Station', 'GRILL', true, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.kds_station (id, name, station_type, online, created_at, updated_at, version) VALUES ('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e33', 'Fry Station', 'FRY', true, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.kds_station (id, name, station_type, online, created_at, updated_at, version) VALUES ('e5d8a6e0-1b2c-4d3e-9f0a-1a2b3c4d5e44', 'Bar Station', 'BAR', true, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict QMTR7hDIQowl1b0G6b2TvdBDVUoA824tne35vE971M350djFEo7wRHE6owmyGfj

