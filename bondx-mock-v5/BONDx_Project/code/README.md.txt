# BondX Chialisp — Skeletons

Files:
- `bondx_constants.cl` — edit constants here.
- `bondx_draw.cl` — verifies draw seed & winner list (skeleton).
- `bondx_cat.cl` — creates CAT payout conditions from winners (skeleton).
- `bondx_puzzle.cl` — top-level controller: checks epoch cadence, computes 1% prize, calls draw + payout.

> These are **skeletons** to scaffold integration. Next passes:
> - Plug real CAT2 wrapper and network conditions.
> - Replace draw proof with VRF/Merkle proof of weighted sampling.
> - Proper singleton pattern for state (remaining supply & epoch height).
