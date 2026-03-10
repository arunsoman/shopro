# Architecture Critique: Notification System

## 1. Identified Gaps

### A. Lack of Actionable Metadata (Deep Linking)
- **Problem**: Current plan only stores `title` and `message`. Users cannot tap a notification to navigate to the relevant entity (e.g., a specific Table or Purchase Order).
- **Risk**: Low operational efficiency; users have to manually navigate to find the cause of the alert.
- **Fix**: Add a `payload` field (JSONB) to store navigation routes and entity IDs.

### B. "Task-like" Notification Recall
- **Problem**: Some notifications (like "Table Dirty") are state-dependent. If one person cleans the table, the notification should ideally disappear for everyone else who received it.
- **Risk**: Notification clutter; users acting on stale information.
- **Fix**: Introduce a `correlation_id`. Allow the `NotificationEngine` to issue `CANCEL` or `UPDATE` commands via WebSocket to all clients holding that ID.

### C. Multi-Device Sync (Stale Read States)
- **Problem**: A user logged into two terminals will see the same notification on both. Marking it "Read" on one might not update the other in real-time.
- **Risk**: Confusing UX.
- **Fix**: Broadcast a "Notification Updated" event over the user's personal WS queue when a read/dismiss action occurs.

### D. User-Level Opt-Out (Muting)
- **Problem**: Role-based mapping is great, but an individual Chef might want to mute "System Warnings" while another wants to see them.
- **Risk**: Notification fatigue leading to ignored critical alerts.
- **Fix**: Add a `user_notification_settings` table to override role-level mappings.

### E. Database Growth & Retention
- **Problem**: Thousands of notifications per day in a busy restaurant will bloat the `InAppNotification` table.
- **Risk**: Performance degradation on the `GET /notifications` endpoint.
- **Fix**: Implement a 7-day TTL (Time To Live) for dismissed/read notifications and a 30-day purge for all unread notifications.

## 2. Updated Design Decisions
1.  **Add `data` (JSONB) field** to `InAppNotification` for deep links.
2.  **Add `correlation_id`** to allow for notification updates/recalls.
3.  **Implement `WS_UPDATE` events** to sync read/dismissed states across devices.
4.  **Add TTL management** via a Spring `@Scheduled` job.
