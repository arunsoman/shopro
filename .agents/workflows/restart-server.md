---
description: Restarts the Shopro POS server by killing processes on port 8080 and running bootRun.
---

// turbo-all
1. Restart the server
```bash
lsof -i :8080 -t | xargs kill -9 && ./gradlew :shopro-pos-server:bootRun
```
