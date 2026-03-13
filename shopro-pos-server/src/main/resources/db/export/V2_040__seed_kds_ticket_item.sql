--
-- PostgreSQL database dump
--

\restrict yHRqtAgcC86axX12giLvol46Uh5y2Q3jij0FyAzbcASWj8KNEs4c3YmNk3t50SQ

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
-- Data for Name: kds_ticket_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.kds_ticket_item (id, kds_ticket_id, order_item_id, status, ready_at, created_at, updated_at, version, priority) VALUES ('25cfc6e2-d554-4db2-a22d-1cd95fa227cc', '20eb02be-922f-4c1b-b4fb-a35e3fc68fbb', '4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', 'READY', '2026-03-13 06:51:57.112108+00', '2026-03-13 02:13:00.849342+00', '2026-03-13 06:51:57.1131+00', 3, 0);
INSERT INTO public.kds_ticket_item (id, kds_ticket_id, order_item_id, status, ready_at, created_at, updated_at, version, priority) VALUES ('b7414af6-6719-4e86-8507-cfba68175504', 'd25fca26-9afb-4e0e-9561-69df6197836c', '4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', 'READY', '2026-03-13 06:51:57.112108+00', '2026-03-13 02:13:00.844466+00', '2026-03-13 06:51:57.131789+00', 4, 0);
INSERT INTO public.kds_ticket_item (id, kds_ticket_id, order_item_id, status, ready_at, created_at, updated_at, version, priority) VALUES ('ce6aa297-c617-4c57-95f2-2fa416cf1e1c', '8e82862c-d75d-4f99-b7b8-01d77a5b5e20', '869506f7-1db9-4478-8346-81a99ce29183', 'READY', '2026-03-13 06:51:57.342323+00', '2026-03-13 02:44:42.003585+00', '2026-03-13 06:51:57.342979+00', 5, 0);
INSERT INTO public.kds_ticket_item (id, kds_ticket_id, order_item_id, status, ready_at, created_at, updated_at, version, priority) VALUES ('d9fefbaa-7a9c-4bc0-982c-0135b17dee12', '16bbf1ee-bc0b-44a1-b383-cf991792821f', '869506f7-1db9-4478-8346-81a99ce29183', 'READY', '2026-03-13 06:51:57.342323+00', '2026-03-13 02:44:42.007168+00', '2026-03-13 06:51:57.356709+00', 5, 0);


--
-- PostgreSQL database dump complete
--

\unrestrict yHRqtAgcC86axX12giLvol46Uh5y2Q3jij0FyAzbcASWj8KNEs4c3YmNk3t50SQ

