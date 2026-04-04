# Wine Content Accuracy Audit Prompt

After any task that generates, modifies, or adds wine-related content
(producer data, flashcards, grape descriptions, regional profiles, pairing
logic), automatically run an accuracy check on the changed files BEFORE
pushing.

## Audit Process

1. Identify all wine-related claims in the changed files (grape names, regions, appellations, founding dates, classifications, tasting notes, grape parentage, winemaking facts)
2. For each claim, verify it is consistent with at least 2 of the following authoritative sources:
   - The Oxford Companion to Wine (Jancis Robinson & Julia Harding)
   - Wine Grapes (Jancis Robinson, Julia Harding & Jose Vouillamoz)
   - The World Atlas of Wine (Hugh Johnson & Jancis Robinson)
   - GuildSomm (Court of Master Sommeliers educational platform)
   - WSET Study Materials (Levels 2, 3, and Diploma)
   - The Wine Bible (Karen MacNeil)
   - Wine Science (Jamie Goode)
3. Flag any claim that is:
   - INCORRECT: contradicts established sources
   - QUESTIONABLE: cannot be verified, is debated, or uses imprecise language
4. Check for common errors:
   - Wrong grape-region associations (e.g., Sangiovese in Barolo)
   - Incorrect appellations or classifications (e.g., wrong Cru level)
   - Made-up or non-existent wines listed under a producer
   - Wrong founding dates
   - Incorrect grape parentage (only DNA-confirmed relationships are acceptable)
   - Outdated classification info (wine law changes)
   - Informal tasting descriptors not aligned with WSET SAT or CMS grid

## Output Format

Output a brief accuracy summary as the last thing before pushing:
- Number of claims checked
- Any QUESTIONABLE or INCORRECT flags found
- If any flags exist, DO NOT PUSH. Show the flags and wait for approval.
- If all claims pass, note "Accuracy check passed" and push.

## Audit Log

Save the full audit log to `/docs/audits/audit-YYYY-MM-DD.md` with:
- Date and task description
- Table of claims checked with sources and pass/fail status
- Final result summary

This creates a paper trail of all content accuracy checks.
