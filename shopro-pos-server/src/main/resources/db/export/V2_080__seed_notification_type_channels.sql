--
-- PostgreSQL database dump
--

\restrict ZgjSW2hCpyAEJxEJmgcOn0Tjkof5cdY6LoHmqazsQ6WfTbxX8R8zY05FsjWTHhu

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
-- Data for Name: notification_type_channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('09674eef-7b6b-40c7-86e2-391070de2af8', '31d5ebf9-6494-4583-8a54-769dd6d4938f', '11111111-1111-1111-1111-111111111111', '1cda9867-41b0-4b7f-be76-b1a207cc5ff9', NULL, true, NULL, '2026-03-12 13:26:13.732068+00', '2026-03-12 13:26:13.732088+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('f2860660-2f11-4fc2-b3d8-eb88b82503c3', '31d5ebf9-6494-4583-8a54-769dd6d4938f', '11111111-1111-1111-1111-111111111111', '427dd2c2-db88-415b-9b29-f35334273c0b', NULL, true, NULL, '2026-03-12 13:26:13.73323+00', '2026-03-12 13:26:13.733242+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('2e4aff60-f927-4c99-824c-454b91aa3c22', '10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991', NULL, true, NULL, '2026-03-12 13:26:13.734006+00', '2026-03-12 13:26:13.734042+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('cd8a0478-83dd-4e7a-a2e0-0ba271d27dc9', '10000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999993', NULL, true, NULL, '2026-03-12 13:26:13.734956+00', '2026-03-12 13:26:13.734969+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('482640bd-2279-4a31-9692-5ef80807f591', '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'a704ea48-f9ae-4c31-a3b0-7f26240edfdd', NULL, true, NULL, '2026-03-12 13:26:13.736091+00', '2026-03-12 13:26:13.736102+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('5675d395-8083-43b2-841d-2329399c9344', '10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '652fe95f-bacd-4364-94b9-8fcdc0d998c9', NULL, true, NULL, '2026-03-12 13:26:13.737122+00', '2026-03-12 13:26:13.737137+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('14a22e68-4a08-4acb-821e-30b000624c32', '10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999991', NULL, true, NULL, '2026-03-12 13:26:13.737964+00', '2026-03-12 13:26:13.737976+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('4bc56401-6e3e-4c95-8b8f-9e26ae443b20', '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999991', NULL, true, NULL, '2026-03-12 13:26:13.738805+00', '2026-03-12 13:26:13.738818+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('67aaff2e-396c-41bb-bc9c-f5594a39c031', '10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999992', NULL, true, NULL, '2026-03-12 13:26:13.739735+00', '2026-03-12 13:26:13.739752+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('bda652df-47d1-4473-a446-5b562d32a28f', '10000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999993', NULL, true, NULL, '2026-03-12 13:26:13.740793+00', '2026-03-12 13:26:13.740809+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('243c8a6e-317d-4f53-ad7b-db6bb53bae20', '10000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999993', NULL, true, NULL, '2026-03-12 13:26:13.742239+00', '2026-03-12 13:26:13.742266+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('30d7b005-d5d0-4745-b9be-f1954de5b502', 'e8400bc8-cf33-417e-94ef-0eef480fc7ae', '11111111-1111-1111-1111-111111111111', '1cda9867-41b0-4b7f-be76-b1a207cc5ff9', NULL, true, NULL, '2026-03-12 13:26:13.744555+00', '2026-03-12 13:26:13.744599+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('a677dc4a-faec-4ae9-b90a-25de431cc78f', 'e8400bc8-cf33-417e-94ef-0eef480fc7ae', '11111111-1111-1111-1111-111111111111', '975f99b0-e377-4e6b-ba7f-33a20ebcc9df', NULL, true, NULL, '2026-03-12 13:26:13.746261+00', '2026-03-12 13:26:13.746298+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('a99e7c1d-d1bc-48c2-a32b-cd810594dcd8', '95612eb7-422a-464a-9b7a-d304d0f1a66a', '11111111-1111-1111-1111-111111111111', '1cda9867-41b0-4b7f-be76-b1a207cc5ff9', NULL, true, NULL, '2026-03-12 13:26:13.747868+00', '2026-03-12 13:26:13.747896+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('7e2594c8-b03b-4c69-9263-0a3ba7c2cb4e', '95612eb7-422a-464a-9b7a-d304d0f1a66a', '11111111-1111-1111-1111-111111111111', '63f25009-fdd6-480d-b2e7-8b75a6fe2319', NULL, true, NULL, '2026-03-12 13:26:13.750803+00', '2026-03-12 13:26:13.75084+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('86356417-d623-4a96-858c-950cdb041451', 'd07d0ffb-820c-44c8-97ee-7ee161e725b2', '11111111-1111-1111-1111-111111111111', 'a704ea48-f9ae-4c31-a3b0-7f26240edfdd', NULL, true, NULL, '2026-03-12 13:26:13.753016+00', '2026-03-12 13:26:13.753066+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('d34bae6d-b789-4d59-aa36-e67624c36af0', 'd07d0ffb-820c-44c8-97ee-7ee161e725b2', '22222222-2222-2222-2222-222222222222', 'a704ea48-f9ae-4c31-a3b0-7f26240edfdd', NULL, true, NULL, '2026-03-12 13:26:13.75453+00', '2026-03-12 13:26:13.754549+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('ccbad2d4-2da0-4c61-846b-ba8e582672c5', 'd07d0ffb-820c-44c8-97ee-7ee161e725b2', '44444444-4444-4444-4444-444444444444', 'a704ea48-f9ae-4c31-a3b0-7f26240edfdd', NULL, true, NULL, '2026-03-12 13:26:13.756343+00', '2026-03-12 13:26:13.756372+00', 0);
INSERT INTO public.notification_type_channels (id, notification_type_id, channel_id, recipient_group_id, fallback_channel_id, is_active, priority_override, created_at, updated_at, version) VALUES ('e88aff8b-e93f-4795-bf90-e6dfae2dfbe0', '10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999992', NULL, true, NULL, '2026-03-12 13:26:13.757704+00', '2026-03-12 13:26:13.757721+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict ZgjSW2hCpyAEJxEJmgcOn0Tjkof5cdY6LoHmqazsQ6WfTbxX8R8zY05FsjWTHhu

