--
-- PostgreSQL database dump
--

\restrict mIByzmwb6miahOeioYKQ06AiSq7CeJ8DdfEaNhF53yCOPansA5rn0yl7e8hIMPK

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
-- Data for Name: goods_receipt_note; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.goods_receipt_note (id, purchase_order_id, received_at, received_by_id, delivery_note_reference, notes, created_at, updated_at, version) VALUES ('a290df98-adf2-46b2-a567-ca6ed5aafe42', '21f6a33e-b243-461d-bad3-724bec83bf17', '2026-03-11 18:52:39.154906+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '', '', '2026-03-11 18:52:39.279357+00', '2026-03-11 18:52:39.280121+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict mIByzmwb6miahOeioYKQ06AiSq7CeJ8DdfEaNhF53yCOPansA5rn0yl7e8hIMPK

