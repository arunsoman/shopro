--
-- PostgreSQL database dump
--

\restrict xv7QM9yBqksFYbubCmY18ZV9LFwkDoTlksIGwiPM143ULoaPGYEuhuzeLcf0vPh

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
-- Data for Name: staff_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('a3f1c357-584d-4f42-b1b6-1ae443c8455b', 'ORDER:CREATE', 'Can create new orders', 'ORDER', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('b1b8cabd-b50e-461a-9738-3af0be991961', 'ORDER:VIEW_OWN', 'Can view their own orders', 'ORDER', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('0fbbf366-fed3-497e-8dd2-375f01f01ca9', 'ORDER:VIEW_ALL', 'Can view all orders', 'ORDER', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('26d32133-9632-4722-93e8-0a41af9c67f5', 'ORDER:VOID_ITEM', 'Can void items from an order', 'ORDER', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a', 'PAYMENT:PROCESS', 'Can process payments', 'PAYMENT', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('ef23e8c4-fdca-4687-9ace-a92e6619f289', 'PAYMENT:VOID_BILL', 'Can void entire bills', 'PAYMENT', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('07776eaf-d063-452f-89ec-84b19cd30e33', 'PAYMENT:DISCOUNT', 'Can apply discounts', 'PAYMENT', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('9d126a2a-56a4-4ddb-a6e4-f77f8ced1252', 'FLOOR:TABLE_ASSIGN', 'Can assign staff to tables', 'FLOOR', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('19e0265f-a15b-4549-beef-daaa10cf0205', 'ADMIN:PIN_RESET', 'Can reset staff PINs', 'ADMIN', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('16d9205a-6ce4-4b9f-ba67-afdae5d63b50', 'REPORT:FULL_FINANCIAL', 'Can view full financial reports', 'REPORT', '2026-03-07 07:50:51.399179+00', '2026-03-07 07:50:51.399179+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('cad0c03b-06ed-4c5f-9afe-2c4a69bdae99', 'KDS:VIEW', 'Can view the kitchen display system', 'KDS', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('a713f57a-52dd-40f8-82d7-b8c320ff91e5', 'KDS:COMPLETE', 'Can mark items as ready/completed', 'KDS', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('4eb8174b-5d42-445d-a13c-c0f1b9f7121d', 'KDS:PRIORITIZE', 'Can change order priority in kitchen', 'KDS', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('5e54052a-1e5f-4e81-b8fb-b1d67e137048', 'INVENTORY:VIEW', 'Can view stock levels', 'INVENTORY', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('ce8b2c41-9a5f-4ead-b037-0558d94f0904', 'INVENTORY:EDIT', 'Can adjust stock levels manually', 'INVENTORY', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('ba74553b-4b34-4abf-a6dc-f31e6268eb13', 'INVENTORY:PO_CREATE', 'Can create purchase orders', 'INVENTORY', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('7a518c8b-5ded-44f1-a8d6-ad79914fed97', 'CRM:VIEW', 'Can view customer profiles', 'CRM', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('d3e901c7-27d6-40d8-a588-f9403dd4233b', 'CRM:EDIT', 'Can edit customer loyalty data', 'CRM', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);
INSERT INTO public.staff_permissions (id, name, description, category, created_at, updated_at, version) VALUES ('335bec5a-6f20-4553-af8f-86f03849072c', 'FLOOR:OVERRIDE', 'Can unlock tables or override guards', 'FLOOR', '2026-03-07 07:50:51.431377+00', '2026-03-07 07:50:51.431377+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict xv7QM9yBqksFYbubCmY18ZV9LFwkDoTlksIGwiPM143ULoaPGYEuhuzeLcf0vPh

