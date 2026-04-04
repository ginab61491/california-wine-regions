# Sommplicity — Project Rules


## Design System
- Serif headings: Playfair Display or Cormorant Garamond
- UI text: DM Sans
- Background: #FAF7F2 (warm off-white, not stark white)
- Text: #2C1810 (wine-brown, not black)
- Accent: #722F37 (burgundy)
- Gold: #B8943E (achievements, highlights)
- Sage: #6B7F5E (success states)
- No emoji in the UI. Ever.
- Dark mode: #1C1917 bg, #E8E0D4 text


## Git Workflow
- Always push after completing changes
- Create feature branches for visual/structural changes
- Use descriptive commit messages
- Never force push to main


## Before Big Changes
- Show me the plan if touching 3+ files
- Wait for approval before restructuring navigation or routing
- Run a build check before pushing


## Data Quality
- Wine facts must be verifiable in 2+ authoritative sources
- Sources: Oxford Companion, Wine Grapes, GuildSomm, WSET materials
- Validate generated data for dupes and missing fields
- Generate data in batches of 50–100, not 500 at once


## Mobile
- Design mobile-first at 375px
- All touch targets minimum 44x44px
- Test at 375px, 390px, and 428px viewports


## Tech Stack
- React + TypeScript + Tailwind
- Anthropic API for AI features
- Hosting: Render (main branch auto-deploys)
