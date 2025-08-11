# Decisions Log ( condensed )

- Chosen name: **BondX** (ticker: BONDx).
- Distribution rate: **1%** per epoch (was 0.5% during early tests).
- Tiering: A 10% (1), B 50% (20), C 40% (79) = 100 winners total.
- Eligibility: snapshot at epoch; must hold ≥7 days; recent buys ineligible.
- LP policy: target 50/50 by value; deploy up to 25%/epoch; venue tracking (Dexie/Tibet).
- Two LP addresses publicly labeled; LPs eligible to win.
- Aliases: deterministic per address (cannot be changed by owners).
- Mock UI: Live/Locked toggle; Top 5 Draw details; LP deployment visuals; search by alias/address.
- Dev automation: private GitHub repo; auto-commit/push watcher; start-dev.bat; autostart task.
