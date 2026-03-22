-- V2 Add Audit Log Table and Missing Columns
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    operator_user VARCHAR(255),
    target_module VARCHAR(100),
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    severity VARCHAR(50)
);

ALTER TABLE restaurant ADD COLUMN verification_status VARCHAR(50);
