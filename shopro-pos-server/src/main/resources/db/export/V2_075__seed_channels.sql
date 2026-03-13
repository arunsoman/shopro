--
-- PostgreSQL database dump
--

\restrict bpHFrnsDR6RsXtzKTI6h3KWEQD1SDh8bP8mcV36lfFT5B1Uhjzkn71pXFrsVmtf

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
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.channels (id, type, config, is_active, created_at, updated_at, version, name) VALUES ('11111111-1111-1111-1111-111111111111', 'IN_APP', '{}', true, '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, 'In-App Notifications');
INSERT INTO public.channels (id, type, config, is_active, created_at, updated_at, version, name) VALUES ('22222222-2222-2222-2222-222222222222', 'EMAIL', '{}', true, '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, 'Email Service');
INSERT INTO public.channels (id, type, config, is_active, created_at, updated_at, version, name) VALUES ('33333333-3333-3333-3333-333333333333', 'SMS', '{}', true, '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, 'SMS Gateway');
INSERT INTO public.channels (id, type, config, is_active, created_at, updated_at, version, name) VALUES ('44444444-4444-4444-4444-444444444444', 'PUSH', '{}', true, '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, 'Push Notifications');


--
-- PostgreSQL database dump complete
--

\unrestrict bpHFrnsDR6RsXtzKTI6h3KWEQD1SDh8bP8mcV36lfFT5B1Uhjzkn71pXFrsVmtf

