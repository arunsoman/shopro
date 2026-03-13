--
-- PostgreSQL database dump
--

\restrict t7dHCciIO5rroqnIyoAem6u5FhCVbzV8aiqiHS6BKjtiWiHIRI3KEmeNeSSIPCV

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
-- Data for Name: supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.supplier (id, company_name, contact_name, contact_email, contact_phone, lead_time_days, created_at, updated_at, version, vendor_rating) VALUES ('c0000000-0000-0000-0000-000000000001', 'Global Food Systems', 'John Doe', 'john@globalfoods.com', '+1-555-0101', 1, '2026-03-07 07:50:51.114457+00', '2026-03-07 07:50:51.114457+00', 0, 88.00);
INSERT INTO public.supplier (id, company_name, contact_name, contact_email, contact_phone, lead_time_days, created_at, updated_at, version, vendor_rating) VALUES ('2d04af5c-8b28-416e-ab21-0aff115b8b35', 'food', 'arun', 'aarunsoman@gmail.com', '+919567764278', 1, '2026-03-07 11:39:38.130686+00', '2026-03-07 11:39:38.13074+00', 0, 70.00);


--
-- PostgreSQL database dump complete
--

\unrestrict t7dHCciIO5rroqnIyoAem6u5FhCVbzV8aiqiHS6BKjtiWiHIRI3KEmeNeSSIPCV

