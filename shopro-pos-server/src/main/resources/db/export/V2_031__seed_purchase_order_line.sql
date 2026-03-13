--
-- PostgreSQL database dump
--

\restrict JZjecgRJr8fPffPFedI97J263F8R4rxUtYS4J4x23dFzIzatuhGgyzLMqEHiYLM

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
-- Data for Name: purchase_order_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, received_qty, unit_cost, created_at, updated_at, version, invoice_unit_price) VALUES ('817357bd-d6a7-47e2-ab06-97c277e9a536', '442aacd3-481f-47f9-a32f-6eca393f4bb0', '00000000-1000-0000-0000-000000000001', 1.0000, NULL, 1.3000, '2026-03-11 18:19:24.930671+00', '2026-03-11 18:19:24.930681+00', 0, NULL);
INSERT INTO public.purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, received_qty, unit_cost, created_at, updated_at, version, invoice_unit_price) VALUES ('a3eff623-2ffe-4705-b089-e7a13f6c77d7', '21f6a33e-b243-461d-bad3-724bec83bf17', '00000000-1000-0000-0000-000000000005', 1.0000, NULL, 0.4000, '2026-03-11 18:23:45.278911+00', '2026-03-11 18:23:45.278924+00', 0, NULL);
INSERT INTO public.purchase_order_line (id, purchase_order_id, ingredient_id, ordered_qty, received_qty, unit_cost, created_at, updated_at, version, invoice_unit_price) VALUES ('0c6ee47d-38ba-4209-8a5a-61802a72b845', '28170a96-b00c-4b7e-8c05-4d8a30f2cb1e', '00000000-1000-0000-0000-000000000003', 100.0000, NULL, 130.0000, '2026-03-12 10:45:56.089175+00', '2026-03-12 10:45:56.089214+00', 0, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict JZjecgRJr8fPffPFedI97J263F8R4rxUtYS4J4x23dFzIzatuhGgyzLMqEHiYLM

