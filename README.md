# BondX — Verifiable Prize-Lottery CAT on Chia (Public Repo)

**Status:** Public, auditable code and docs. **No private keys** or operational secrets here.

BondX is a community prize-lottery token on the Chia blockchain.

- **Token:** CAT2 (BondX), max supply **21,000,000**.
- **Airdrop:** **1,000,000** to ~200 addresses.
- **Treasury:** **20,000,000** held in a puzzle that emits **0.5% weekly** (floor), stopping when 0.5% < 1 micro-unit.
- **Weekly draw:** 100 winners, weighted by holders’ balances (in micro-units), from a deterministic seed.
- **Verifiability:** Snapshot file + Merkle root + seed block hash are published; anyone can recompute winners and audit payouts.

This repository contains:

- Chialisp puzzles for the CAT TAIL, Treasury, and Distributor.
- A minimal Python verifier (no keys) to reproduce snapshots/draws off-chain.
- Tests and docs focused on **verifiability** and **supply/epoch rules**.

> **Important:** Operational scripts that sign and broadcast spends, node RPC URLs, and private keys belong in a **private** repo.

---

## Repository layout

```text
clsp/
  tail_bondx.clsp         # CAT2 TAIL (max-supply guardrails)
  treasury.clsp           # 0.5% weekly emission, epoch gating, stop condition, commitments
  distributor.clsp        # fans weekly pot to winners, enforces payout sum
  utils.clsp              # epoch/time helpers
  merkle_verify.clsp      # placeholder (optional future on-chain verification)
include/
  params.chik             # constants (genesis id, decimals, epoch config)
  puzzle_hashes.chik      # populated during your build
python/
  bondx_verify.py         # deterministic draw & payout sum checker (no private keys)
  emission_sim.py         # simple 0.5% emission simulator
  requirements.txt
tests/
  emission_stop.test.md   # describes stop-condition math & expectations
.github/workflows/
  lint.yml                # placeholder CI hook
```

---

## How the weekly draw works (high level)

1. **Epoch:** weekly boundary (e.g., Monday 00:00 UTC).
2. **Seed:** first block whose timestamp is ≥ epoch start time.
3. **Snapshot:** set of addresses that have held BondX ≥ 1 week since the prior draw (balances in micro-units).
4. **Weighted draw:** 100 winners, tickets proportional to micro-units.
5. **On-chain:** Treasury emits ≤0.5% of its balance into a Pot coin; Distributor pays winners. The spend commits to `(snapshot_merkle_root, seed_block_hash)`.
6. **Audit:** Anyone can recompute winners and verify payouts match the pot and the published snapshot & seed.

---

## Build / compile (puzzles)

You can compile puzzles with the Chia dev toolchain (`clvm_tools` or via the Chia repo). Example:

```bash
cd clsp
run tail_bondx.clsp
run treasury.clsp
run distributor.clsp
```

You’ll wire actual CAT2 helpers and capture puzzle hashes in `include/puzzle_hashes.chik` during your build.

---

## Python verification tools

The `python/bondx_verify.py` script demonstrates how to:

- Load a published snapshot (CSV) and seed block hash.
- Run a deterministic, weighted lottery for 100 winners.
- Check that a provided Distributor payout list sums to the Pot amount (≤0.5% of the Treasury at that epoch).

It avoids any signing or RPC calls; it’s strictly for verifiability.

```bash
python3 python/emission_sim.py --treasury 20000000 --decimals 6 --rate 0.005
python3 python/bondx_verify.py --snapshot snapshot.csv --seed <block_hash> --winners winners.csv --pot 100000.0
```

---

## Security model

- **On-chain constraints** (public): max supply, 0.5% weekly cap, epoch gating, stop condition, commitments to snapshot and seed.
- **Off-chain compute** (public): deterministic draw algorithm and verification tools.
- **Private ops** (kept elsewhere): keys, signing, scheduling, broadcast, liquidity-wallet automation.

---

## License

MIT for code in this repo. See `LICENSE`.

![next-ui-build](https://github.com/BONDxToken/bondx-public/actions/workflows/next-ui-build.yml/badge.svg)
