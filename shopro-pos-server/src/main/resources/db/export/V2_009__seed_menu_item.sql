--
-- PostgreSQL database dump
--

\restrict PQiCSeW4SDLopReYn0no4acUPORchRWdQgJ6cjHjXDyqFwOcXrVTFlEzXorKJiJ

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
-- Data for Name: menu_item; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Crispy Calamari', 'Fried golden brown with aioli.', 12.00, 'https://images.unsplash.com/photo-1590594507435-06775f0a0c4f?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000010-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Caesar Salad', 'Romaine, croutons, parmesan.', 14.50, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000010-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Quesadillas', 'Chicken, peppers, cheese.', 10.00, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000010-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Truffle Fries', 'Parmesan and herb garnish.', 9.00, '/api/v1/media/menu-items/truffle_fries_jpg_1772537607878.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000010-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Garlic Shrimp', 'Sizzling butter and herbs.', 16.00, '/api/v1/media/menu-items/garlic_shrimp_jpg_1772537627472.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Classic Smash Burger', 'American cheese, special sauce.', 17.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000020-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'BBQ Brisket Burger', 'Juicy beef, melted cheddar.', 22.00, '/api/v1/media/menu-items/brisket_burger_jpg_1772537657313.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000020-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Mushroom Burger', 'Portobello and avocado.', 19.50, '/api/v1/media/menu-items/mushroom_burger_jpg_1772537679240.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000020-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Falafel Burger', 'Chickpea patty, tahini.', 16.50, 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Ribeye Steak', 'Grain-fed 300g.', 45.00, 'https://images.unsplash.com/photo-1546964124-0cce43429215?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000030-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Grilled Salmon', 'Lemon butter and asparagus.', 34.00, '/api/v1/media/menu-items/salmon_main_jpg_1772537697260.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000030-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Lamb Shank', 'Slow-roasted with rosemary.', 38.50, '/api/v1/media/menu-items/lamb_shank_jpg_1772537730593.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000030-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Chicken Alfredo', 'Creamy sauce and pasta.', 28.00, 'https://images.unsplash.com/photo-1645112481338-3560e9bcad5d?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000030-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'Fish and Chips', 'Beer battered with tartar.', 24.00, 'https://images.unsplash.com/photo-1524339102451-897f2560567a?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000040-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Passion Mojito', 'Fresh passion fruit and mint.', 12.00, '/api/v1/media/menu-items/passion_mojito_jpg_1772537754674.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000040-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Iced Macchiato', 'Espresso with caramel.', 6.50, '/api/v1/media/menu-items/iced_macchiato_jpg_1772537772518.png', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000040-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'Espresso', 'Rich single shot.', 4.00, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);
INSERT INTO public.menu_item (id, category_id, name, description, base_price, photo_url, status, created_at, updated_at, version) VALUES ('d1000040-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Fresh Orange Juice', 'Cold pressed oranges.', 5.50, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1024', 'PUBLISHED', '2026-03-07 07:50:50.753841+00', '2026-03-07 07:50:50.753841+00', 0);


--
-- PostgreSQL database dump complete
--

\unrestrict PQiCSeW4SDLopReYn0no4acUPORchRWdQgJ6cjHjXDyqFwOcXrVTFlEzXorKJiJ

