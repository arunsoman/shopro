--
-- PostgreSQL database dump
--

\restrict afFp58MGPEZOJ898tdPWdlhhfFPGMvdUfjCalXDrqHTLxA0ZIxc6JpG4eBPSdko

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
-- Data for Name: staff_member; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Hannah Host', '$2a$10$DkWN.f8uJam5vZoSgbnr3efSfHq2z4XFahxIEsO8d.6cORf5hssUK', 'HOST', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000105');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Sam Server', '$2a$10$nJnSnlQjK6xHIy6lt6STkuhHF0Tl9ivb1B9yj.b.DzCBryLa0xdp2', 'SENIOR_SERVER', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000101');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Carlos Cashier', '$2a$10$LXAT3Ev69vdJY/Sw8BwEDOrBGwJQf3kdfDoQqRvysRgaaJ4oCYZbO', 'BARTENDER', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000106');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Brie Busser', '$2a$10$uO3i1hJfgMvJ4nlqp0YZbO6sWCIZCzureSc3gEJE0n1R5rzvg/NIO', 'BUSSER', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000107');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Maria Manager', '$2a$10$vwRlvaykjS3Je/7EJXlKkOLCIZGrAguY9nR8a1Daq66HHASRNer/.', 'GENERAL_MANAGER', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000004');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Alex Owner', '$2a$10$cuRLesBMc68B6FMcGLyfkeN11Qh4xjTKGhdQcLTXaZbjSMFx3R2W2', 'OWNER', true, NULL, '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0, '00000000-0000-0000-0000-000000000001');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('192b4b2c-9df9-4614-8e1c-811135f248d8', 'Benny Busser', '$2a$10$uO3i1hJfgMvJ4nlqp0YZbO6sWCIZCzureSc3gEJE0n1R5rzvg/NIO', 'BUSSER', true, NULL, '2026-03-07 19:20:36.617344+00', '2026-03-07 19:20:36.617344+00', 0, '00000000-0000-0000-0000-000000000107');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'Kevin Kitchen', '$2a$10$dIhthVRDnRBUCs8ofKiqmOWflej/ic2CX13AUAtkO7rlX0gg/EqTe', 'KITCHEN_MANAGER', true, NULL, '2026-03-13 03:19:38.536172+00', '2026-03-13 03:19:38.536172+00', 0, '00000000-0000-0000-0000-000000000008');
INSERT INTO public.staff_member (id, full_name, pin_hash, role, active, last_login_at, created_at, updated_at, version, role_id) VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'Stan Station', '$2a$10$bBpcmli79wKXDjJ93QzHjOBiEieihlaJz1CTmQRCAr2jkR9SvlBQm', 'STATION_MANAGER', true, NULL, '2026-03-13 03:19:38.558317+00', '2026-03-13 03:19:38.558317+00', 0, '00000000-0000-0000-0000-000000000110');


--
-- PostgreSQL database dump complete
--

\unrestrict afFp58MGPEZOJ898tdPWdlhhfFPGMvdUfjCalXDrqHTLxA0ZIxc6JpG4eBPSdko

