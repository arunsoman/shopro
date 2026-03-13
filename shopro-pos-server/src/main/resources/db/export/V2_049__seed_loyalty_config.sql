--
-- PostgreSQL database dump
--

\restrict TvJyii9G4JbFULd4cKmq1aqrA1h4OhBGOOKdkWtcXaSYbBrgBc9Hx4XMHYQJt8B

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
-- Data for Name: loyalty_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.loyalty_config (id, earning_rate, redemption_value, minimum_redemption_points, point_expiration_days, created_at, updated_at, version, default_sms_opt_in, default_email_opt_in, feedback_window_hours, sms_gateway_enabled, email_gateway_enabled) VALUES ('47df104e-aa41-40c4-a88c-2d7a4de8f0b0', 1.00, 0.0100, 100, 0, '2026-03-10 16:51:21.098302+00', '2026-03-10 16:51:21.098302+00', 0, true, true, 24, false, false);


--
-- PostgreSQL database dump complete
--

\unrestrict TvJyii9G4JbFULd4cKmq1aqrA1h4OhBGOOKdkWtcXaSYbBrgBc9Hx4XMHYQJt8B

