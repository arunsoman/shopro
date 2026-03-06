---
description: Identifies missing user stories by comparing a product description or high-level requirements against existing story documents using a 7-pass gap detection framework.
---

# /find-story-gaps Workflow

## Overview
This workflow activates the `story-gap-finder` skill to surface missing user stories by comparing product intent against existing coverage.

## Steps

1. **Load the skill instructions**
   Read the full skill file:
   ```
   /home/arun/IdeaProjects/shopro-pos/.agents/skills/story-gap-finder/SKILL.md
   ```
   Follow every instruction in the skill exactly before proceeding.

2. **Resolve the target**
   Parse the argument provided after `/find-story-gaps`:
   - If it is an existing `.md` file (e.g., `EXTENDED_REQUIREMENTS.md`), read it as the product description.
   - If it is a module alias (e.g., `kds`, `core`, `all`), resolve using the module alias table in the skill.
   - If it is an inline description string (e.g., "Add a loyalty program"), use it directly as the product description.
   - If no argument is provided, ask: *"What product description or feature area should I analyze for gaps? Provide a file, module name, or describe the feature in plain text."*

3. **Load all relevant existing story files**
   - For a module-specific run: read only the matching `*_REQUIREMENTS.md` file.
   - For `all` or a cross-cutting description: read **all six** `*_REQUIREMENTS.md` files.
   - The active requirement files are at `/home/arun/IdeaProjects/shopro-pos/`.

4. **Execute all 7 passes**
   Work through each pass from the skill sequentially:
   - **Pass 1:** Feature Inventory Extraction
   - **Pass 2:** Story Coverage Mapping
   - **Pass 3:** Negative-Space Reasoning ("What About When...")
   - **Pass 4:** Cross-Module Boundary Gaps
   - **Pass 5:** Role-Coverage Completeness
   - **Pass 6:** CRUD Lifecycle Completeness
   - **Pass 7:** System & Non-Functional Story Gaps

5. **Produce the Gap Report**
   Output the full structured report as defined in the skill's "Output Format" section.
   - Assign a `GAP-[N]` ID to every gap.
   - Classify severity: 🔴 Critical / 🟡 Major / 🔵 Minor.
   - Provide a **story skeleton** for every gap found.
   - Include the **Gap Priority Matrix** table at the end.

6. **Offer to write full stories**
   After the report, ask:
   *"Would you like me to write complete user stories (with full ACs) for any of these gaps?"*
   - If yes, write the stories in the canonical format from `user-stories-reviewer` skill.
   - Offer to append them to the relevant `*_REQUIREMENTS.md` file or create a new one.

7. **Offer to save the report**
   Ask:
   *"Would you like me to save this gap analysis to `/home/arun/IdeaProjects/shopro-pos/reviews/GAP_ANALYSIS_[DATE].md`?"*
