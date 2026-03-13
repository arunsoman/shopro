--
-- PostgreSQL database dump
--

\restrict gndHSDbEl8gsLvWUGeRb8Q6tDactvulvUDdZ09dxyDFaUaT5pa2KV2HvxpFhwcT

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
-- Data for Name: notification_recipient_mapping; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('d371f6b2-d914-4d84-a150-e68154d8cca3', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ORDER_READY', 'ROLE', 'SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('6206413d-f492-48ed-b101-13042e0eee29', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ORDER_READY', 'ROLE', 'SENIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('3709aaf0-80c6-47ef-8c42-80c04417ac39', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ORDER_READY', 'ROLE', 'JUNIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('5f282f46-86a9-422e-ba8e-effc96d65df2', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ORDER_READY', 'ROLE', 'RUNNER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('c825360b-8a64-4a6d-978e-5fc879cc1d72', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ITEM_REJECTED', 'ROLE', 'SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('333e34f7-0a4a-4dc7-95d8-cdc07c7da5d3', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ITEM_REJECTED', 'ROLE', 'SENIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('77a8545e-e075-4770-bb5a-5b6935e86a84', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ITEM_REJECTED', 'ROLE', 'JUNIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('b3370a74-d5d3-486f-aa32-9bb0fbf9b587', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ASSISTANCE_NEEDED', 'ROLE', 'SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('c7c5dbef-ca24-4839-b411-390569002760', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ASSISTANCE_NEEDED', 'ROLE', 'SENIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('5a0d0883-168a-437d-be82-7b631bdeecb0', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ASSISTANCE_NEEDED', 'ROLE', 'JUNIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('e3cd7574-94b0-4f39-a04c-4f9b7912dd98', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'TABLE_DIRTY', 'ROLE', 'BUSSER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('27a10d8d-cdc9-4492-ba2c-c5cad2b8df94', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'TABLE_DIRTY', 'ROLE', 'RUNNER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('fa542d59-6e6d-4428-8eca-0e5faf825801', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'CURBSIDE_ARRIVAL', 'ROLE', 'RUNNER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('766915da-5035-4232-8aa1-3337ac5f83b1', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'CURBSIDE_ARRIVAL', 'ROLE', 'HOST');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('17c13980-8ebf-4c24-b7c6-ee7fea2dfaea', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'STOCK_CRITICAL', 'ROLE', 'MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('c8370151-84cf-4add-b769-f93e79287eb8', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'STOCK_CRITICAL', 'ROLE', 'HEAD_CHEF');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('41cd3535-25ba-4731-8a30-56913b754a6d', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'STOCK_CRITICAL', 'ROLE', 'GENERAL_MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('64953ab1-2ba6-4231-84cf-a595ef8b818d', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'STOCK_CRITICAL', 'ROLE', 'OWNER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('c4fdaac4-8cfd-4ee1-afe5-535d022f47de', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'PO_APPROVAL_REQUIRED', 'ROLE', 'GENERAL_MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('de689d50-d3e4-40a7-9326-d9a5815fcc4c', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'PO_APPROVAL_REQUIRED', 'ROLE', 'OWNER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('4a3bce70-c0c3-4baf-b892-81105b77ba31', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'BID_RECEIVED', 'ROLE', 'HEAD_CHEF');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('4284c216-08eb-4731-8e02-872e93789847', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'BID_RECEIVED', 'ROLE', 'GENERAL_MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('a988791d-a745-4768-b2a6-bf4297ee5ec5', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'VOID_REQUEST', 'ROLE', 'MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('501787aa-597d-4be8-bd9a-6e1f5a2798ee', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'VOID_REQUEST', 'ROLE', 'GENERAL_MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('98dd2e15-b158-4477-b4ac-4a8d36661c93', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'VOID_REQUEST', 'ROLE', 'SENIOR_SERVER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('9f4d9582-6295-44ec-996b-5862ebfb6019', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'SYSTEM_WARNING', 'ROLE', 'GENERAL_MANAGER');
INSERT INTO public.notification_recipient_mapping (id, created_at, updated_at, version, notification_type, recipient_type, recipient_id) VALUES ('3ee57b41-11e7-4258-b092-cbbc62550b9c', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'SYSTEM_WARNING', 'ROLE', 'OWNER');


--
-- PostgreSQL database dump complete
--

\unrestrict gndHSDbEl8gsLvWUGeRb8Q6tDactvulvUDdZ09dxyDFaUaT5pa2KV2HvxpFhwcT

