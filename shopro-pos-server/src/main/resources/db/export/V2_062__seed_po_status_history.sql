--
-- PostgreSQL database dump
--

\restrict KL8uTvieliX63kCXYknRz1d6P25OAh0mxxd2dP4c4hq8rDaZpC9hwtejIOuqs0V

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
-- Data for Name: po_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('5a4a5168-76f2-4799-84b5-99012de3f508', '442aacd3-481f-47f9-a32f-6eca393f4bb0', 'DRAFT', 'APPROVED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Auto-approved via Price Proposal Acceptance', '2026-03-11 18:19:24.932168+00', '2026-03-11 18:19:24.932178+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('1d3ca2ac-1181-4f80-891d-032a4ae215f1', '442aacd3-481f-47f9-a32f-6eca393f4bb0', 'APPROVED', 'SENT', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Auto-sent via Price Proposal Acceptance', '2026-03-11 18:19:24.934276+00', '2026-03-11 18:19:24.934285+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('bdc70238-cacd-4032-8cf5-3220f26b8882', '442aacd3-481f-47f9-a32f-6eca393f4bb0', 'SENT', 'ACKNOWLEDGED', '10000000-0000-0000-0000-000000000001', 'Supplier Acknowledged', '2026-03-11 18:20:06.534788+00', '2026-03-11 18:20:06.534844+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('9a850775-1076-489f-acc8-584c634cdbb6', '442aacd3-481f-47f9-a32f-6eca393f4bb0', 'ACKNOWLEDGED', 'SHIPPED', '10000000-0000-0000-0000-000000000001', 'Supplier marked as shipped', '2026-03-11 18:21:59.983067+00', '2026-03-11 18:21:59.983097+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('838edc21-5b39-44f0-be3f-299e33f0b5c7', '21f6a33e-b243-461d-bad3-724bec83bf17', 'DRAFT', 'APPROVED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Auto-approved via Price Proposal Acceptance', '2026-03-11 18:23:45.280068+00', '2026-03-11 18:23:45.280086+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('a77e34c6-0b1d-4dea-a064-7046b66823f3', '21f6a33e-b243-461d-bad3-724bec83bf17', 'APPROVED', 'SENT', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Auto-sent via Price Proposal Acceptance', '2026-03-11 18:23:45.28752+00', '2026-03-11 18:23:45.287543+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('0e1cbd82-ca09-4f2e-aef1-dcc8c7d30a1e', '21f6a33e-b243-461d-bad3-724bec83bf17', 'SENT', 'ACKNOWLEDGED', '10000000-0000-0000-0000-000000000001', 'Supplier Acknowledged', '2026-03-11 18:24:27.686462+00', '2026-03-11 18:24:27.686492+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('20b6c291-cabf-4b1e-9f91-e9cd176ed1d8', '21f6a33e-b243-461d-bad3-724bec83bf17', 'ACKNOWLEDGED', 'SHIPPED', '10000000-0000-0000-0000-000000000001', 'Supplier marked as shipped', '2026-03-11 18:25:44.267092+00', '2026-03-11 18:25:44.26712+00', 0);
INSERT INTO public.po_status_history (id, po_id, from_status, to_status, actor_id, reason, created_at, updated_at, version) VALUES ('5efda2a6-8f50-4248-b24a-43c9762a5a26', '21f6a33e-b243-461d-bad3-724bec83bf17', 'SHIPPED', 'RECEIVED', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Full shipment received', '2026-03-11 18:52:39.316805+00', '2026-03-11 18:52:39.316833+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict KL8uTvieliX63kCXYknRz1d6P25OAh0mxxd2dP4c4hq8rDaZpC9hwtejIOuqs0V

