--
-- PostgreSQL database dump
--

\restrict r4ceJ1aV4ODJtuzdmbASTxBILDfvUCSbKfBReb9twaa6bUSJNws3SDTT7ACzWE5

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
-- Data for Name: in_app_notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed, data, correlation_id, read_at, dismissed_at) VALUES ('dab144d4-5004-4022-992c-82fd47f08bac', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ROLE', 'OWNER', 'Welcome to Shopro POS', 'The system is ready. You can now manage your restaurant floor and inventory in real-time.', 'SYSTEM', 'MEDIUM', false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed, data, correlation_id, read_at, dismissed_at) VALUES ('3c19bc17-18c1-4e52-8a6b-16d21e6bc211', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ROLE', 'MANAGER', 'Smart Notifications Active', 'You will now receive alerts for stock levels and void requests directly here.', 'SYSTEM', 'MEDIUM', false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed, data, correlation_id, read_at, dismissed_at) VALUES ('76e5b0dc-7884-4877-b307-b5dfacf99a6e', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ROLE', 'GENERAL_MANAGER', 'Inventory Analytics Ready', 'AI-driven stock replenishment suggestions are now available in the inventory section.', 'INVENTORY', 'HIGH', false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed, data, correlation_id, read_at, dismissed_at) VALUES ('24a36a3a-d917-4c89-b4be-041030959ecb', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ROLE', 'SERVER', 'Table Tracking Enabled', 'Table status changes (Dirty/Available) will now push instant alerts.', 'SYSTEM', 'LOW', false, false, NULL, NULL, NULL, NULL);
INSERT INTO public.in_app_notification (id, created_at, updated_at, version, recipient_type, recipient_id, title, message, category, priority, is_read, is_dismissed, data, correlation_id, read_at, dismissed_at) VALUES ('4f8565f2-5fbe-41fd-85b4-bb7ffa453e04', '2026-03-07 07:50:51.472491+00', '2026-03-07 07:50:51.472491+00', 0, 'ROLE', 'HEAD_CHEF', 'KDS Master Sync', 'The Kitchen Display System is now synced with your raw ingredient stock.', 'INVENTORY', 'MEDIUM', false, false, NULL, NULL, NULL, NULL);


--
-- PostgreSQL database dump complete
--

\unrestrict r4ceJ1aV4ODJtuzdmbASTxBILDfvUCSbKfBReb9twaa6bUSJNws3SDTT7ACzWE5

