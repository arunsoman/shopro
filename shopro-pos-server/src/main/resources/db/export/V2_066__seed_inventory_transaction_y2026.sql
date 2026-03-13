--
-- PostgreSQL database dump
--

\restrict EXkQLFxu7u822osTxew9tdbo51QmLDRI5tzNlfXgcWjsN5HCSZ4IPOM4cfku4Af

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
-- Data for Name: inventory_transaction_y2026; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('56b708bf-34db-4498-803a-dff9b010713d', '00000000-1000-0000-0000-000000000005', 'PURCHASE_RECEIPT', 1.0000, 0.4000, 'GRN Receipt for PO 21f6a33e-b243-461d-bad3-724bec83bf17', 'a290df98-adf2-46b2-a567-ca6ed5aafe42', NULL, NULL, '2026-03-11 18:52:39.215229+00', '2026-03-11 18:52:39.312182+00', '2026-03-11 18:52:39.312206+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('7fa00edd-b028-46a8-bbcb-8953bf791d19', '00000000-1000-0000-0000-000000000018', 'SALE', -7.3171, 0.1200, 'Auto-depleted by order item (Yield adjusted: 82.0000%)', '4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', NULL, NULL, '2026-03-13 02:13:00.750189+00', '2026-03-13 02:13:00.760723+00', '2026-03-13 02:13:00.760737+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('f1157da3-a0d1-4578-95d6-c27c648b441e', '00000000-1000-0000-0000-000000000043', 'SALE', -1.5000, 0.1500, 'Auto-depleted by order item (Yield adjusted: 100.0000%)', '4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', NULL, NULL, '2026-03-13 02:13:00.754356+00', '2026-03-13 02:13:00.765363+00', '2026-03-13 02:13:00.765382+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('6536b850-c796-4c57-8d0d-91a7c602e7d3', '00000000-1000-0000-0000-000000000014', 'SALE', -1.0000, 0.7000, 'Auto-depleted by order item (Yield adjusted: 100.0000%)', '4a6f0ec1-1c4f-4ce8-9d19-061f34b84c7b', NULL, NULL, '2026-03-13 02:13:00.757034+00', '2026-03-13 02:13:00.769157+00', '2026-03-13 02:13:00.769181+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('e2e683d2-0ea7-4a97-ba34-361821d28be8', '00000000-1000-0000-0000-000000000004', 'SALE', -4.3478, 0.5500, 'Auto-depleted by order item (Yield adjusted: 92.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.886414+00', '2026-03-13 02:44:41.922375+00', '2026-03-13 02:44:41.922396+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('6ce4694f-c7d6-4adf-adb4-d3e845620542', '00000000-1000-0000-0000-000000000023', 'SALE', -0.5882, 0.5500, 'Auto-depleted by order item (Yield adjusted: 85.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.904922+00', '2026-03-13 02:44:41.926462+00', '2026-03-13 02:44:41.926486+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('db151764-1191-4cb4-89aa-1133263ea1e8', '00000000-1000-0000-0000-000000000025', 'SALE', -0.3125, 0.4000, 'Auto-depleted by order item (Yield adjusted: 80.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.908132+00', '2026-03-13 02:44:41.928089+00', '2026-03-13 02:44:41.928108+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('5eee434c-14a2-4500-8f42-0cbc95665e49', '00000000-1000-0000-0000-000000000017', 'SALE', -1.5000, 0.5800, 'Auto-depleted by order item (Yield adjusted: 100.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.911253+00', '2026-03-13 02:44:41.929539+00', '2026-03-13 02:44:41.929557+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('21b7fdfb-3919-4cf1-9b99-8ebadcda63bc', '00000000-1000-0000-0000-000000000016', 'SALE', -1.0000, 0.5500, 'Auto-depleted by order item (Yield adjusted: 100.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.914096+00', '2026-03-13 02:44:41.930887+00', '2026-03-13 02:44:41.930902+00', 0);
INSERT INTO public.inventory_transaction_y2026 (id, ingredient_id, transaction_type, quantity_delta, unit_cost_at_time, reason, reference_id, metadata, created_by_id, transacted_at, created_at, updated_at, version) VALUES ('4701c7c8-25da-46f6-8c8b-6333fc6fef38', '00000000-1000-0000-0000-000000000012', 'SALE', -0.3000, 0.2800, 'Auto-depleted by order item (Yield adjusted: 100.0000%)', '869506f7-1db9-4478-8346-81a99ce29183', NULL, NULL, '2026-03-13 02:44:41.919111+00', '2026-03-13 02:44:41.932628+00', '2026-03-13 02:44:41.932645+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict EXkQLFxu7u822osTxew9tdbo51QmLDRI5tzNlfXgcWjsN5HCSZ4IPOM4cfku4Af

