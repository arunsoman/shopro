--
-- PostgreSQL database dump
--

\restrict ycuPM8dVpeZmHiiP9IqIl0MnicIah84TT8WW9BgStGBYkMvcaBq1Wb7RfsXnstx

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
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '26d32133-9632-4722-93e8-0a41af9c67f5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', 'ef23e8c4-fdca-4687-9ace-a92e6619f289');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '07776eaf-d063-452f-89ec-84b19cd30e33');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '19e0265f-a15b-4549-beef-daaa10cf0205');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000001', '16d9205a-6ce4-4b9f-ba67-afdae5d63b50');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '26d32133-9632-4722-93e8-0a41af9c67f5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', 'ef23e8c4-fdca-4687-9ace-a92e6619f289');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '07776eaf-d063-452f-89ec-84b19cd30e33');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '19e0265f-a15b-4549-beef-daaa10cf0205');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000002', '16d9205a-6ce4-4b9f-ba67-afdae5d63b50');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000003', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000003', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000003', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '26d32133-9632-4722-93e8-0a41af9c67f5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'ef23e8c4-fdca-4687-9ace-a92e6619f289');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '07776eaf-d063-452f-89ec-84b19cd30e33');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'ce8b2c41-9a5f-4ead-b037-0558d94f0904');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'ba74553b-4b34-4abf-a6dc-f31e6268eb13');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '7a518c8b-5ded-44f1-a8d6-ad79914fed97');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', 'd3e901c7-27d6-40d8-a588-f9403dd4233b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000004', '335bec5a-6f20-4553-af8f-86f03849072c');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', 'ce8b2c41-9a5f-4ead-b037-0558d94f0904');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000005', 'ba74553b-4b34-4abf-a6dc-f31e6268eb13');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', '26d32133-9632-4722-93e8-0a41af9c67f5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', '07776eaf-d063-452f-89ec-84b19cd30e33');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000101', '335bec5a-6f20-4553-af8f-86f03849072c');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000102', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000102', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000102', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000102', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000103', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000103', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '26d32133-9632-4722-93e8-0a41af9c67f5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'ef23e8c4-fdca-4687-9ace-a92e6619f289');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '07776eaf-d063-452f-89ec-84b19cd30e33');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'ce8b2c41-9a5f-4ead-b037-0558d94f0904');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'ba74553b-4b34-4abf-a6dc-f31e6268eb13');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '7a518c8b-5ded-44f1-a8d6-ad79914fed97');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', 'd3e901c7-27d6-40d8-a588-f9403dd4233b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000006', '335bec5a-6f20-4553-af8f-86f03849072c');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000007', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000007', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000007', '7a518c8b-5ded-44f1-a8d6-ad79914fed97');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', 'ce8b2c41-9a5f-4ead-b037-0558d94f0904');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000008', 'ba74553b-4b34-4abf-a6dc-f31e6268eb13');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000104', '0fbbf366-fed3-497e-8dd2-375f01f01ca9');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000104', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000104', '7a518c8b-5ded-44f1-a8d6-ad79914fed97');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000104', '335bec5a-6f20-4553-af8f-86f03849072c');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000106', 'a3f1c357-584d-4f42-b1b6-1ae443c8455b');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000106', 'b1b8cabd-b50e-461a-9738-3af0be991961');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000106', 'e9a523b9-a36f-44c0-ab4f-df8f3aefdc1a');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000106', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', 'ce8b2c41-9a5f-4ead-b037-0558d94f0904');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000201', 'ba74553b-4b34-4abf-a6dc-f31e6268eb13');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000202', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000202', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000202', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000202', '5e54052a-1e5f-4e81-b8fb-b1d67e137048');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000203', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000203', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000204', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000204', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000105', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000107', '9d126a2a-56a4-4ddb-a6e4-f77f8ced1252');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000110', 'cad0c03b-06ed-4c5f-9afe-2c4a69bdae99');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000110', 'a713f57a-52dd-40f8-82d7-b8c320ff91e5');
INSERT INTO public.role_permissions (role_id, permission_id) VALUES ('00000000-0000-0000-0000-000000000110', '4eb8174b-5d42-445d-a13c-c0f1b9f7121d');


--
-- PostgreSQL database dump complete
--

\unrestrict ycuPM8dVpeZmHiiP9IqIl0MnicIah84TT8WW9BgStGBYkMvcaBq1Wb7RfsXnstx

