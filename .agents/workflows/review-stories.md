---
description: Reviews Shopro POS user stories for ambiguity, missing AC, role clarity, testability, cross-module dependencies, and permission gating. Produces a structured review report.
---

# /review-stories Workflow

## Overview
This workflow activates the `user-stories-reviewer` skill to audit user stories against the Shopro POS domain standards and INVEST criteria.

## Steps

1. **Load the skill instructions**
   Read the full skill file:
   ```
   /home/arun/IdeaProjects/shopro-pos/.agents/skills/user-stories-reviewer/SKILL.md
   ```
   Follow every instruction in the skill exactly before proceeding.

2. **Resolve the target**
   Parse the argument provided after `/review-stories`:
   - If it is a filename (ends in `.md`), read it from the project root.
   - If it is a module alias (e.g., `kds`, `core`, `all`), resolve it using the alias table in the skill.
   - If it is an inline user story string, use it directly.
   - If no argument is provided, ask: *"Which module or story would you like me to review? Options: core, kds, floor, tableside, inventory, analytics, all — or paste a story directly."*

3. **Run the 8-Point Review Checklist**
   Apply every check from Step 2 of the skill's Review Protocol to each story in the target document.

4. **Produce the Review Report**
   Output the full structured report exactly as defined in Step 3 of the skill.
   - Highlight any BLOCKED verdicts prominently.
   - List all FAILs under "Critical Issues" and WARNINGs under "Recommended Improvements."

5. **Offer to rewrite failing stories**
   After the report, ask:
   *"Would you like me to rewrite the failing or warning stories using the corrected format?"*
   If yes, apply Step 4 (Rewrite Mode) from the skill for each deficient story.

6. **Offer to save the report**
   Ask:
   *"Would you like me to save this review report to `/home/arun/IdeaProjects/shopro-pos/reviews/[MODULE]_REVIEW_[DATE].md`?"*
   If yes, create the file with the full report contents.
