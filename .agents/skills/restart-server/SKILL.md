---
name: restart-server
description: Restarts the Shopro POS server by killing processes on port 8080 and running bootRun.
---

# Restart Server

Use this skill to quickly restart the Shopro POS backend server whenever changes are made to the entity models, controllers, or other backend logic.

## Usage

Run the following command in the project root `/home/arun/IdeaProjects/shopro-pos`:

```bash
lsof -i :8080 -t | xargs kill -9 && ./gradlew :shopro-pos-server:bootRun
```

## Troubleshooting

- If `lsof` is not found, ensure it is installed on the system.
- If the port is already clear, the `kill` command might fail silently; the `&&` ensures the server only starts if the kill succeeds or there was nothing to kill. Actually, `xargs kill -9` might fail if no PIDs are provided. 
- A safer version: `lsof -ti:8080 | xargs -r kill -9 && ./gradlew :shopro-pos-server:bootRun`
