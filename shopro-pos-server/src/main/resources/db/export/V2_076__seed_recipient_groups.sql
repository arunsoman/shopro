--
-- PostgreSQL database dump
--

\restrict RVwSfj5cmIRw0kUeA3LNtsMxc4wZ9ypbTGg4sP4XEU3VfavtKUOBurbtI3QO5aY

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
-- Data for Name: recipient_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('99999999-9999-9999-9999-999999999991', 'Managers', 'ROLE_MANAGER', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('99999999-9999-9999-9999-999999999992', 'Head Chefs', 'ROLE_HEAD_CHEF', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('99999999-9999-9999-9999-999999999993', 'SysAdmins', 'ROLE_ADMIN', '2026-03-07 07:50:51.494959+00', '2026-03-07 07:50:51.494959+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('427dd2c2-db88-415b-9b29-f35334273c0b', 'Hosts', 'ROLE_HOST', '2026-03-07 19:20:36.617344+00', '2026-03-07 19:20:36.617344+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('975f99b0-e377-4e6b-ba7f-33a20ebcc9df', 'Bussers', 'ROLE_BUSSER', '2026-03-07 19:20:36.617344+00', '2026-03-07 19:20:36.617344+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('63f25009-fdd6-480d-b2e7-8b75a6fe2319', 'All Servers', 'ROLE_SERVER_ALL', '2026-03-07 20:14:37.646764+00', '2026-03-07 20:14:37.646764+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('1cda9867-41b0-4b7f-be76-b1a207cc5ff9', 'Management', 'ROLE_MANAGEMENT', '2026-03-11 06:49:08.042937+00', '2026-03-11 06:49:08.042937+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('a704ea48-f9ae-4c31-a3b0-7f26240edfdd', 'General Manager', 'ROLE_GENERAL_MANAGER', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('89891d62-0ecb-4423-9e29-033a48fbf938', 'Waitstaff & Runners', 'ROLE_SERVER', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, NULL);
INSERT INTO public.recipient_groups (id, name, role_code, created_at, updated_at, version, description) VALUES ('652fe95f-bacd-4364-94b9-8fcdc0d998c9', 'Kitchen & BOH', 'ROLE_CHEF', '2026-03-12 13:04:55.774208+00', '2026-03-12 13:04:55.774208+00', 0, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict RVwSfj5cmIRw0kUeA3LNtsMxc4wZ9ypbTGg4sP4XEU3VfavtKUOBurbtI3QO5aY

