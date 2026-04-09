CREATE TABLE vendor_price_proposal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES supplier(id),
    ingredient_id UUID NOT NULL REFERENCES raw_ingredient(id),
    proposed_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES staff_member(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_vendor_price_proposal_supplier ON vendor_price_proposal(supplier_id);
CREATE INDEX idx_vendor_price_proposal_ingredient ON vendor_price_proposal(ingredient_id);
CREATE INDEX idx_vendor_price_proposal_status ON vendor_price_proposal(status);
