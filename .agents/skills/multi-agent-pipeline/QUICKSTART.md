# Multi-Agent Pipeline - Quick Start (Cloud)

## ⚡ 3-Minute Setup

All models run on **Ollama Cloud** — no GPU/CPU required!

### Step 1: Install Ollama (if needed)

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Login to Cloud

```bash
ollama login
```

### Step 3: Run Setup Script

```bash
bash .agents/skills/multi-agent-pipeline/setup-ollama.sh
```

### Step 4: Start Pipeline

```bash
/run multi-agent-pipeline
```

---

## 📦 Cloud Models (No Local Resources)

| Agent | Model | Parameters |
|-------|-------|------------|
| Researcher | `qwen3.5:27b` | 27B |
| Critic | `llama3.3:70b` | 70B |
| Developer | `qwen3-coder-plus:72b` | 72B |
| SW-Dev-Agent | `qwen2.5-coder:32b` | 32B |
| Tester | `qwen3.5:27b` | 27B |
| Validator | `deepseek-r1:671b` | 671B |

**Total:** 901B parameters running in the cloud! 🚀

---

## 🎯 Usage Examples

### Example 1: Build a Feature

```
Build a restaurant POS login system using the multi-agent pipeline

Requirements:
- Staff PIN-based authentication
- Role-based access (Manager, Server, Kitchen)
- Session timeout after 15 minutes
- Failed login lockout after 5 attempts
```

### Example 2: Add New Module

```
/run multi-agent-pipeline

Add inventory tracking to our POS system:
- Track ingredient stock levels
- Auto-alert when below threshold
- Supplier integration for reordering
- Waste tracking and reporting
```

### Example 3: Refactor Existing Code

```
Use the multi-agent pipeline to refactor our auth module:
- Migrate to OAuth 2.0
- Add MFA support
- Implement SSO
- Add audit logging
```

---

## 🔄 Pipeline Flow

```
User Requirements
       ↓
┌──────────────────┐
│   Researcher     │ → Gap analysis, competitive research
│  qwen3.5:27b     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│     Critic       │ → Ambiguity removal, quality gate
│  llama3.3:70b    │
└────────┬─────────┘
         ↓ (APPROVED)
         ├──────────────────┬──────────────┐
         ↓                  ↓              │
┌──────────────────┐ ┌──────────────────┐ │
│    Developer     │ │     Tester       │ │
│qwen3-coder-plus  │ │  qwen3.5:27b     │ │
│  (Chunking)      │ │  (Test Plan)     │ │
└────────┬─────────┘ └────────┬─────────┘ │
         │                    │           │
         └─────────┬──────────┘           │
                   ↓                      │
         ┌──────────────────┐             │
         │    Validator     │ ←───────────┘
         │ deepseek-r1:671b │
         │  (Test & Report) │
         └────────┬─────────┘
                  │
         ┌────────▼────────┐
         │  HAS_DEFECTS?   │
         └────────┬────────┘
                  │
           Yes → Fix Loop (max 3 rounds)
                  ↓
           No → ✅ COMPLETE
```

---

## 📊 What You Get

After the pipeline completes:

1. **Built Codebase** — Compiled, ready to deploy
2. **Enriched Requirements** — Research-backed, gap-free
3. **Gap Analysis** — Competitive intelligence
4. **Chunk Manifest** — Build breakdown
5. **Test Plan** — Comprehensive test strategy
6. **Validation Report** — Pass/fail with defects
7. **Audit Log** — Full pipeline history

---

## ⚙️ Commands

| Command | Description |
|---------|-------------|
| `/run multi-agent-pipeline` | Start the pipeline |
| `bash setup-ollama.sh` | Verify cloud setup |
| `ollama whoami` | Check cloud login |
| `ollama login` | Login to cloud |
| `/tree` | View pipeline history |
| `/compact` | Summarize long sessions |

---

## 🆘 Troubleshooting

### "Not logged in"
```bash
ollama login
```

### "Model not found"
```bash
# Models are in the cloud, no need to pull
# Just ensure you're logged in
ollama whoami
```

### "Connection timeout"
- Check internet connection
- Cloud models require stable internet
- Retry the pipeline

### "Pipeline stuck"
- Press `Escape` to abort
- Use `/tree` to resume from last good state
- Check `ollama ps` for active models

---

## 💡 Tips

1. **Provide detailed requirements** — Better input = better output
2. **Review gap analysis** — Ensure criticality matches your priorities
3. **Monitor iterations** — If hitting max (3), simplify scope
4. **Use cloud wisely** — Large models are powerful but need internet

---

## 📁 Files

```
.agents/skills/multi-agent-pipeline/
├── QUICKSTART.md       # This file
├── README.md           # Full documentation
├── SKILL.md            # Orchestrator skill
├── setup-ollama.sh     # Cloud setup script
└── agents/
    ├── researcher/
    ├── critic/
    ├── developer/
    ├── sw-dev-agent/
    ├── tester/
    └── validator/
```

---

## 🎓 Next Steps

1. Run the setup script: `bash setup-ollama.sh`
2. Start your first pipeline: `/run multi-agent-pipeline`
3. Review full docs: `cat README.md`

---

**Happy Building! 🚀**

All models powered by Ollama Cloud — zero local GPU/CPU required.
