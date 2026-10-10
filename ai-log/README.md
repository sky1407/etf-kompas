# AI log

`01-etf-kompas-session.txt` – the full Claude Code session (`/export`) that produced this repository: brief, plan and decisions, data collection, implementation, deployment, testing and README.

Notes for the reader:
- The conversation is in Slovak (my working language); the page and ads are in Czech, code and docs in English.
- The export shortens long tool outputs; commands and their key results are visible inline.
- Redacted before committing: the one-time Vercel CLI device login code (`[REDACTED]`). No API keys, database URLs or passwords were ever pasted into the chat – environment variables were entered in the Vercel dashboard, and the agent only checked their presence and prefix without printing values (verified with `grep` for `phc_`, `postgres://`, `npg_`, `Bearer` and 64-char hex strings: 0 matches).
