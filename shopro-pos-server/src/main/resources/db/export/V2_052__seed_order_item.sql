--
-- PostgreSQL database dump
--

\restrict p7hFRMYnP9MkY9Ub7DbnbjQWViLoccdoGbfBc6rMe8usyaI3DsbfATpgsZQoJaH

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
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.order_item (id, ticket_id, menu_item_id, quantity, unit_price, modifier_upcharge_total, status, custom_note, has_allergy_flag, is_subtraction, course_number, fired_at, created_at, updated_at, version) VALUES ('4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', '9b837648-5055-48b0-bc85-165834e00c12', 'd1000010-0000-0000-0000-000000000001', 1, 14.50, 0.00, 'SENT', NULL, false, false, 1, NULL, '2026-03-13 02:12:27.575884+00', '2026-03-13 02:13:00.711643+00', 1);
INSERT INTO public.order_item (id, ticket_id, menu_item_id, quantity, unit_price, modifier_upcharge_total, status, custom_note, has_allergy_flag, is_subtraction, course_number, fired_at, created_at, updated_at, version) VALUES ('869506f7-1db9-4478-8346-81a99ce29183', '9b837648-5055-48b0-bc85-165834e00c12', 'd1000010-0000-0000-0000-000000000002', 1, 10.00, 0.00, 'SENT', NULL, false, false, 1, NULL, '2026-03-13 02:44:27.770537+00', '2026-03-13 02:44:41.855792+00', 1);


--
-- PostgreSQL database dump complete
--

\unrestrict p7hFRMYnP9MkY9Ub7DbnbjQWViLoccdoGbfBc6rMe8usyaI3DsbfATpgsZQoJaH

