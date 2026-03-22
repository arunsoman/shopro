-- Initial schema for Shopro Marketplace

-- Organizations
CREATE TABLE restaurant (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_info TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE supplier (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    business_details TEXT,
    bank_details TEXT,
    verification_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Users
CREATE TABLE marketplace_buyer (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    restaurant_id UUID REFERENCES restaurant(id),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE marketplace_supplier (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    supplier_id UUID REFERENCES supplier(id),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE operator (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Catalog
CREATE TABLE category (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    parent_category_id UUID REFERENCES category(id),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE product (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES category(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    unit VARCHAR(50),
    base_price NUMERIC(19, 4),
    stock_status VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    image_url VARCHAR(255),
    tags JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Bidding
CREATE TABLE bid_invitation (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES category(id),
    deadline TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    urgency VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE bid_item (
    id UUID PRIMARY KEY,
    bid_invitation_id UUID NOT NULL REFERENCES bid_invitation(id),
    product_name VARCHAR(255),
    quantity NUMERIC(19, 4),
    unit VARCHAR(50),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE quote (
    id UUID PRIMARY KEY,
    bid_invitation_id UUID NOT NULL REFERENCES bid_invitation(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    total_amount NUMERIC(19, 4),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Orders
CREATE TABLE purchase_order (
    id UUID PRIMARY KEY,
    reference_number VARCHAR(255) UNIQUE NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurant(id),
    total_amount NUMERIC(19, 4),
    status VARCHAR(50) NOT NULL,
    delivery_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE sub_order (
    id UUID PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_order(id),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    total_amount NUMERIC(19, 4),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE order_item (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    product_id UUID NOT NULL REFERENCES product(id),
    quantity NUMERIC(19, 4) NOT NULL,
    unit VARCHAR(50),
    price_at_order NUMERIC(19, 4) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE invoice (
    id UUID PRIMARY KEY,
    sub_order_id UUID NOT NULL REFERENCES sub_order(id),
    amount NUMERIC(19, 4) NOT NULL,
    status VARCHAR(50) NOT NULL,
    issue_date DATE,
    due_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
