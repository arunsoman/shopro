--
-- PostgreSQL database dump
--

\restrict 94q96eS1LesvPk7JIfsfUMow7n1CzXQHieLDmNI15sLcyhbuKqFK9ziJqLbwSkz

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
-- Data for Name: staff_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000001', 'OWNER', 'Full system access', NULL, '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000002', 'MANAGER', 'Supervisory access', NULL, '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000003', 'SERVER', 'Floor operations', NULL, '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000004', 'GENERAL_MANAGER', 'Store operations and limited financial oversight', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000005', 'HEAD_CHEF', 'Kitchen and inventory management', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000006', 'ASSISTANT_MANAGER', 'Supports daily operations and staff coordination', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000007', 'FB_MANAGER', 'Food and beverage operations', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000008', 'KITCHEN_MANAGER', 'Back of house business side', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000101', 'SENIOR_SERVER', 'Floor supervisor with override privileges', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000102', 'JUNIOR_SERVER', 'Standard table service', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000103', 'RUNNER', 'Food delivery and table clearing only', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000104', 'MAITRE_D', 'Directs dining room flow', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000105', 'HOST', 'Greets and seats guests', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000106', 'BARTENDER', 'Drink preparation and bar service', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000107', 'BUSSER', 'Table clearing and basic FOH support', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000201', 'EXECUTIVE_CHEF', 'Overall culinary operations', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000202', 'SOUS_CHEF', 'Second-in-command in kitchen', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000203', 'CHEF_DE_PARTIE', 'Station chef', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000204', 'LINE_COOK', 'Executes dishes on line', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000205', 'PREP_COOK', 'Prepares ingredients', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000206', 'DISHWASHER', 'Cleanliness and utility', NULL, '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_roles (id, name, description, parent_role_id, created_at, updated_at, version) VALUES ('00000000-0000-0000-0000-000000000110', 'STATION_MANAGER', 'Manages specific KDS stations and plate coordination', NULL, '2026-03-13 03:19:38.558317+00', '2026-03-13 03:19:38.558317+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict 94q96eS1LesvPk7JIfsfUMow7n1CzXQHieLDmNI15sLcyhbuKqFK9ziJqLbwSkz

