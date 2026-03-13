--
-- PostgreSQL database dump
--

\restrict WlnNYn7axZtaSRdhbJ0f8eIxtoWGXV8XbqMEJA92Y0luROE5pFWdnfxuAoyxE7U

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
-- Data for Name: goods_receipt_note_line; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.goods_receipt_note_line (id, goods_receipt_note_id, ingredient_id, received_qty, damaged_qty, created_at, updated_at, version) VALUES ('c0364909-4cae-49c6-acc8-b22bebc8abb4', 'a290df98-adf2-46b2-a567-ca6ed5aafe42', '00000000-1000-0000-0000-000000000005', 1.0000, 0.0000, '2026-03-11 18:52:39.306331+00', '2026-03-11 18:52:39.306384+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict WlnNYn7axZtaSRdhbJ0f8eIxtoWGXV8XbqMEJA92Y0luROE5pFWdnfxuAoyxE7U

