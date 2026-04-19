# ⚠️ CRITICAL: DO NOT RESTART THE SERVER UNNECESSARILY

## 🚫 NEVER RESTART THE SERVER FOR:
1. JSON serialization errors (use DTOs or fix entity mappings instead)
2. Minor compilation fixes (hot-reload or wait for user to restart)
3. Testing simulation changes (server is already running)

## ✅ ONLY RESTART WHEN:
1. Entity field changes (new columns, new relationships)
2. Service method signature changes
3. Controller endpoint changes
4. User explicitly requests it

## 📝 Current Server State
- **Running**: Yes (background process)
- **Restaurant ID**: 3 (The Market Table)
- **Port**: 8080
- **Status**: Check with `curl -s http://localhost:8080/actuator/health`

## 🔧 Fix Order (No Restart Needed):
1. Fix Python simulator code → Run immediately
2. Fix entity @Column/@JoinColumn → NEEDS RESTART
3. Fix service logic → NEEDS RESTART  
4. Fix controller mappings → NEEDS RESTART
5. Add new fields to entities → NEEDS RESTART

## 📊 Current Issue
- Table IDs loading as 0 - need to check table loading code
- DO NOT RESTART - debug and fix in place

## 🎯 Remember
**The user will restart the server when needed. DO NOT restart automatically.**
