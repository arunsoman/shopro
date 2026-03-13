--
-- PostgreSQL database dump
--

\restrict BZ4kzMaydrkHwr9GhQS7yiEkiOhe1kT8jKZa2tjlaaT8oOxYQnimlWWX0kmZVSP

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
-- Data for Name: guest_feedback; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('fec93930-2d13-4155-a5bb-b020717cbd9a', 'ddf1ca60-bc69-4280-bb29-97b837890d35', NULL, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', '2026-03-08 22:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('b972bb02-3119-4789-adce-7771b8c123bc', '05c5c86b-c35c-4ebc-855b-4ff46dd8ed68', NULL, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', '2026-03-09 22:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('1726cb23-ec47-4523-9dcd-8d9c47b264d8', '08c42464-4348-47be-b071-69fd8904972d', NULL, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', '2026-03-07 22:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('f1334427-454e-4c37-a12f-d9903f0ae861', 'c6586d95-b0ac-44cf-b54d-052baeffb26b', NULL, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', '2026-03-06 22:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('2c56408e-c345-4ee4-a84c-6ff9d43fec58', '69eb0dc4-e49e-4916-ab5c-8a6a65ceeef9', NULL, 5, 'Absolutely fantastic! The steaks are cooked to perfection every time.', 'POSITIVE', 'APP', '2026-03-08 22:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('11ba9c77-4e30-4659-8211-896d4eb7b61a', '837915e8-06b0-4282-be68-42f828c15efc', NULL, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', '2026-03-05 21:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('3ef26a72-3001-4d91-bf14-cf963d9f5482', 'f430b5b5-14a5-40b4-9ab4-dc5f5331b228', NULL, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', '2026-03-02 21:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('63da78f4-fe19-479a-9a4d-eeba625afa93', 'ef33e018-dc7a-4c88-910d-54b2a5185efc', NULL, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', '2026-02-23 21:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('aec7c769-a162-472c-add1-5c17f2caaca6', 'edd2da6b-818e-4fcc-9900-59dcfcf555a1', NULL, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', '2026-02-28 21:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('f80ff8c7-5e87-45f8-8305-7512c525efef', '312fcbe4-aa60-462f-8ffc-b037bb326281', NULL, 4, 'Great ambiance and very friendly staff. Food was solid.', 'POSITIVE', 'SMS', '2026-02-18 21:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('c51de1d9-eb36-40d1-a90a-14e38cd0d7c7', '7e9b1011-c405-4612-b0c3-30b058247fe1', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-02-26 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('4c153317-fa4d-4185-b9f1-b23732a96289', '8ec0a1f3-cfc2-4bc0-a65d-0e6e270d1420', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-01-24 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('5c20ad35-9cfa-4b43-81d6-7ad13c8c6c51', '98ec44c5-d92b-44a7-9358-ac948a943425', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-01-04 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('b9f79d16-9743-442e-844c-7571312420eb', '0fdcfc29-ebfe-47ac-966f-fda38d902e05', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-02-13 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('ba81a7c4-55af-48ca-b531-1129c7bf6332', 'b57928f8-78de-46f4-905c-23f1972d6270', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-02-20 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('193de3d3-ed9d-4f9f-bc24-607b77375012', 'ab9c9eac-d85f-4cf6-999b-55aada06370e', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-01-14 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('4f798213-d95c-467f-b9da-a5b6cee4401b', '3427687e-9b9d-4740-9819-79e32a4849cc', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-01-29 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('8dca16e5-42ed-4ce1-9e2c-d6437e33fe09', '9015884d-7f77-41b7-9983-6f062878e630', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-01-09 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('fe8a7af5-2c35-40d5-8324-b53cdff970d2', '73a9f55e-dc2f-4508-bf58-24c567ab7c65', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-02-18 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('f310a337-a2eb-4605-9c00-d156ccebef27', 'a42db7ea-454c-432e-82b9-adc40689a0e6', NULL, 3, 'Average experience. Wait time for a table was a bit long even with reservation.', 'NEUTRAL', 'APP', '2026-02-03 21:23:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('aa18990d-93ab-4bb4-bbb6-a2d18db17dfa', '8ec0a1f3-cfc2-4bc0-a65d-0e6e270d1420', NULL, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', '2026-01-25 20:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('64b8fa18-ce82-4526-a9d1-ee0bb60dc1fa', '98ec44c5-d92b-44a7-9358-ac948a943425', NULL, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', '2026-01-05 20:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('d453aad1-fc7b-4d8e-b43a-008871c7b076', 'b57928f8-78de-46f4-905c-23f1972d6270', NULL, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', '2026-02-21 20:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('27d30823-cd61-41e3-b095-f7e1715096ad', '278071cf-a989-4585-829e-cd4dbe8b7b17', NULL, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', '2026-03-08 20:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('b3eca623-3e6b-4341-806a-6152cfff06ec', '4dd3fe3b-3453-4f98-8d0d-5a4a42fce3c3', NULL, 2, 'Disappointed today. Service was slow and my burger was cold.', 'NEGATIVE', 'EMAIL', '2026-03-09 20:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('51971aca-d61d-411b-805f-bfea402d360d', 'ddf1ca60-bc69-4280-bb29-97b837890d35', NULL, 5, 'One of my favorite spots in the city! Love the loyalty rewards.', 'POSITIVE', 'SMS', '2026-03-09 00:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('1b65b2ed-c433-475c-a612-40e7cc9419ac', '05c5c86b-c35c-4ebc-855b-4ff46dd8ed68', NULL, 5, 'One of my favorite spots in the city! Love the loyalty rewards.', 'POSITIVE', 'SMS', '2026-03-10 00:53:39.713557+00');
INSERT INTO public.guest_feedback (id, customer_id, order_id, rating, comments, sentiment, source, created_at) VALUES ('248f3ba9-5540-4a7e-ac6c-5ee74a5fa178', '69eb0dc4-e49e-4916-ab5c-8a6a65ceeef9', NULL, 5, 'One of my favorite spots in the city! Love the loyalty rewards.', 'POSITIVE', 'SMS', '2026-03-09 00:53:39.713557+00');


--
-- PostgreSQL database dump complete
--

\unrestrict BZ4kzMaydrkHwr9GhQS7yiEkiOhe1kT8jKZa2tjlaaT8oOxYQnimlWWX0kmZVSP

