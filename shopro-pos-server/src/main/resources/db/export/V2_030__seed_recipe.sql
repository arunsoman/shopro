--
-- PostgreSQL database dump
--

\restrict 3gEB5g2efHvJvulB9m3EZIXOZKBOpdhNjvzL1gMvw7PvH1ghe4jceOzZT8jU4h3

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
-- Data for Name: recipe; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000002', 'd1000010-0000-0000-0000-000000000001', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000003', 'd1000010-0000-0000-0000-000000000002', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000004', 'd1000010-0000-0000-0000-000000000003', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000005', 'd1000010-0000-0000-0000-000000000004', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000003', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000007', 'd1000020-0000-0000-0000-000000000001', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000008', 'd1000020-0000-0000-0000-000000000002', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000009', 'd1000020-0000-0000-0000-000000000003', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000005', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000011', 'd1000030-0000-0000-0000-000000000001', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000012', 'd1000030-0000-0000-0000-000000000002', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000013', 'd1000030-0000-0000-0000-000000000003', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000014', 'd1000030-0000-0000-0000-000000000004', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000015', 'd1000040-0000-0000-0000-000000000001', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000016', 'd1000040-0000-0000-0000-000000000002', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000017', 'd1000040-0000-0000-0000-000000000003', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000000018', 'd1000040-0000-0000-0000-000000000004', 1, '2026-03-07 07:50:51.156917+00', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-03-07 07:50:51.156917+00', '2026-03-07 07:50:51.156917+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-6000-0000-0000-000000000001', NULL, 1, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, '00000000-5000-0000-0000-000000000001');
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-6000-0000-0000-000000000002', NULL, 1, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, '00000000-5000-0000-0000-000000000002');
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-6000-0000-0000-000000000003', NULL, 1, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, '00000000-5000-0000-0000-000000000003');
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000001006', 'd1000000-0000-0000-0000-000000000003', 2, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000001002', 'd1000010-0000-0000-0000-000000000001', 2, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, NULL);
INSERT INTO public.recipe (id, menu_item_id, recipe_version, effective_from, created_by_id, created_at, updated_at, version, sub_recipe_id) VALUES ('00000000-2000-0000-0000-000000001001', 'd1000000-0000-0000-0000-000000000001', 2, '2026-03-07 07:50:51.292352+00', NULL, '2026-03-07 07:50:51.292352+00', '2026-03-07 07:50:51.292352+00', 0, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict 3gEB5g2efHvJvulB9m3EZIXOZKBOpdhNjvzL1gMvw7PvH1ghe4jceOzZT8jU4h3

