--
-- PostgreSQL database dump
--

\restrict hK0IX9lQK1PtjqkPRnvVUHD4SRiCt6tfaoap74SHc2VJYvsfQ4VCMd5ggNVzxqF

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
-- Data for Name: supplier_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.supplier_user (id, supplier_id, email, password_hash, full_name, role, active, last_login_at, created_at, updated_at, version, phone_number) VALUES ('5d417cc0-e385-45dd-a547-698c4438baed', 'c0000000-0000-0000-0000-000000000001', 'bob.notif@globalfoods.com', '$2a$10$5iApMixoHpG4pR7jzPDaxO/Z/4bNOYKoHvr9fX/YNXmLUzSFlZ9Uq', 'Bob Recipient', 'SUPPLIER_BIDDER', true, NULL, '2026-03-07 08:05:36.547122+00', '2026-03-07 08:05:36.547221+00', 0, '+1987654321');
INSERT INTO public.supplier_user (id, supplier_id, email, password_hash, full_name, role, active, last_login_at, created_at, updated_at, version, phone_number) VALUES ('18abfa38-3537-4105-8d66-96efe2e2d7de', '2d04af5c-8b28-416e-ab21-0aff115b8b35', 'john@supplier.com', '$2a$10$sk/NUw5oipOko3.73iNUxexuBNROcZfcF46pIH5GlWJ5mFlzKHkg.', 'John', 'SUPPLIER_BIDDER', true, NULL, '2026-03-07 11:41:18.900133+00', '2026-03-07 11:41:18.900149+00', 0, '+919567764277');
INSERT INTO public.supplier_user (id, supplier_id, email, password_hash, full_name, role, active, last_login_at, created_at, updated_at, version, phone_number) VALUES ('10000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'bob@globalfoods.com', '$2a$10$jcAC0Tsw2GDKi14mNLuoTuTNibrFbO1EyTlfZa3VCSv9iw6NSOyJK', 'Bob Bidder', 'SUPPLIER_BIDDER', true, NULL, '2026-03-07 07:50:51.566503+00', '2026-03-07 07:50:51.566503+00', 0, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict hK0IX9lQK1PtjqkPRnvVUHD4SRiCt6tfaoap74SHc2VJYvsfQ4VCMd5ggNVzxqF

