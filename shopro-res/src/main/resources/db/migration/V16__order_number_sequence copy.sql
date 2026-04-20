-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    MAXVALUE 99999
    CYCLE;
