-- Migration to reset root password
UPDATE operator 
SET password = '$2a$10$8.UnVu6jdr7ndYf16T.RGu0SNHa.E887o8pY/X9T/K6K.d.Y.k0.' 
WHERE email = 'root@shopro.internal';
