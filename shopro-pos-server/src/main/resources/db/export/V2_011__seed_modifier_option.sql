--
-- PostgreSQL database dump
--

\restrict wTZIIunGL3BXcRtGMmZKlpMQntPIPI0TYq2YaQdmgxcIoQxFHfAuiiOK0omGpeN

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
-- Data for Name: modifier_option; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Rare', 0.00, 1, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Medium Rare', 0.00, 2, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Medium', 0.00, 3, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'Well Done', 0.00, 4, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 'Extra Cheese', 1.50, 1, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.modifier_option (id, modifier_group_id, label, upcharge_amount, display_order, created_at, updated_at, version) VALUES ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 'Bacon Strips', 2.00, 2, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict wTZIIunGL3BXcRtGMmZKlpMQntPIPI0TYq2YaQdmgxcIoQxFHfAuiiOK0omGpeN

