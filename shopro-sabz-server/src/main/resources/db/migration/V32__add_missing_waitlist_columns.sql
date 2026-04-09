-- US-3.1 Waitlist Enhancements: Add missing columns to waitlist_entry
ALTER TABLE waitlist_entry 
ADD COLUMN estimated_wait_minutes INTEGER,
ADD COLUMN notified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN handled_by_id UUID REFERENCES staff_member(id);

-- Optional: Create index for notification tracking
CREATE INDEX idx_waitlist_notified_at ON waitlist_entry(notified_at);
CREATE INDEX idx_waitlist_handled_by ON waitlist_entry(handled_by_id);
