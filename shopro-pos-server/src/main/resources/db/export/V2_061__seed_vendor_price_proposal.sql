--
-- PostgreSQL database dump
--

\restrict bUfZiNYUGPcYoB26zCT2lyE0bAYJ5SVX6pb9bc9Pa47KCb2kb6Z4EnCJAciBX75

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
-- Data for Name: vendor_price_proposal; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.vendor_price_proposal (id, supplier_id, ingredient_id, proposed_price, notes, status, reviewed_by, reviewed_at, created_at, updated_at, version, submitted_by, generated_po_id, proposed_quantity) VALUES ('4362127a-8846-48e2-9193-95c736e10bc3', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000001', 1.30, '', 'ACCEPTED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-11 18:19:24.87947+00', '2026-03-11 18:19:06.009995+00', '2026-03-11 18:19:24.936052+00', 1, '10000000-0000-0000-0000-000000000001', '442aacd3-481f-47f9-a32f-6eca393f4bb0', NULL);
INSERT INTO public.vendor_price_proposal (id, supplier_id, ingredient_id, proposed_price, notes, status, reviewed_by, reviewed_at, created_at, updated_at, version, submitted_by, generated_po_id, proposed_quantity) VALUES ('2009dac2-4203-4763-9baa-b4468932aeb5', 'c0000000-0000-0000-0000-000000000001', '00000000-1000-0000-0000-000000000005', 0.40, '', 'ACCEPTED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-11 18:23:45.251734+00', '2026-03-11 18:23:25.038052+00', '2026-03-11 18:23:45.291235+00', 1, '10000000-0000-0000-0000-000000000001', '21f6a33e-b243-461d-bad3-724bec83bf17', NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict bUfZiNYUGPcYoB26zCT2lyE0bAYJ5SVX6pb9bc9Pa47KCb2kb6Z4EnCJAciBX75

