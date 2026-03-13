--
-- PostgreSQL database dump
--

\restrict upRdfBhrPmWcXLqoBplkAYVsUFoflCRsrp3HroLW5ioex2u9Hua0ci80ME7WCwT

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
-- Data for Name: waitlist_entry; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.waitlist_entry (id, customer_name, party_size, phone_number, status, seated_at_table_id, created_at, updated_at, version, estimated_wait_minutes, notified_at, handled_by_id) VALUES ('fda95dec-632a-44e4-b6d0-aa6e4bd3d6c9', 'Test Guest', 24, NULL, 'CANCELLED', NULL, '2026-03-07 21:14:09.761246+00', '2026-03-07 21:15:13.947839+00', 1, 15, NULL, NULL);
INSERT INTO public.waitlist_entry (id, customer_name, party_size, phone_number, status, seated_at_table_id, created_at, updated_at, version, estimated_wait_minutes, notified_at, handled_by_id) VALUES ('4aeb3490-06f0-4316-9e3c-175c5af91e04', 'John Doe', 24, NULL, 'WAITING', NULL, '2026-03-12 06:37:38.597654+00', '2026-03-12 06:37:38.597712+00', 0, 15, NULL, NULL);
INSERT INTO public.waitlist_entry (id, customer_name, party_size, phone_number, status, seated_at_table_id, created_at, updated_at, version, estimated_wait_minutes, notified_at, handled_by_id) VALUES ('72b0b405-4d63-493e-afc7-e0f5abdd07ee', 'rr', 4, NULL, 'SEATED', 'c79a0fb1-267a-47a8-96ec-3d592df4a4f8', '2026-03-13 02:10:10.646612+00', '2026-03-13 02:11:12.018056+00', 1, 15, NULL, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict upRdfBhrPmWcXLqoBplkAYVsUFoflCRsrp3HroLW5ioex2u9Hua0ci80ME7WCwT

