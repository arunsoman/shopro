ALTER TABLE vendor_price_proposal 
ADD COLUMN submitted_by UUID REFERENCES supplier_user(id);
