# BondX — Project Spec (Snapshot)

## Token & Distribution
- Max supply: **21,000,000 BONDx**.
- Airdrop at Epoch 0: **1,000,000** evenly across the initial list (200 addrs by default in the simulator).
- Prize emission: **1% of remaining** per epoch.
- Weekly draw timing: epoch boundary (sim uses 60s/epoch). On-chain we’ll anchor to a block-height cadence.
- Tier split each epoch:
  - Tier A: **10%** to **1** winner
  - Tier B: **50%** split across **20** winners
  - Tier C: **40%** split across **79** winners (or remaining to total 100)
- Weighted lottery: each address gets tickets proportional to **BONDx balance** that’s been held **≥7 days**.

## Eligibility
- Address must hold BONDx **for 7 days** since last buy/transfer into the wallet.
- Snapshot taken at epoch boundary; draws use **locked balances**.
- Recent buys (age < 7d) and zeroed addresses are **ineligible** for that epoch.

## Liquidity Pools
- LP1: `xch1ty9t2z4q3vqlpzqrwur29y82jf0khzzfq26uay20k7gylzz4jueqdsuxv3`
- LP2: `xch1kyc0mdu46r40k753fvv7j8t9a526tjty3kxnk6ucxlq0alr0g4ysmcepwn`
- Purpose: provide BONDx/XCH liquidity on **dexie.space** (and Tibet).
- Operating rules (current model):
  - Start balances configured in UI.
  - Each epoch, rebalance to **50% BONDx / 50% XCH** by **value**.
  - **Deploy capacity:** up to **25%** of portfolio USD value per epoch.
  - Venue split tracked per epoch (Dexie vs Tibet), displayed in simulator.
  - Hard cap: **≤75%** of funds tradable across rolling periods (kept via weekly 25% cap).
- LPs can win in lottery like any address; wins increase LP BONDx balance.

## Names & Leaderboard
- Each address gets a deterministic alias (e.g., **“Elena Quinn Walsh”**).
- Alias is stable across wins; LPs show as **Liquidity Pool 1/2**.
- Website mock shows:
  - **Top 5 Draws (Details)** with tiers + aliases.
  - **Last 5 Draws** summary with top winners (alias • amount).
  - **LP Wins & Balances**, **LP Deployment per Epoch (USD)**, and **venue totals**.
  - **Live vs Locked** balance view toggle.

## Security Notes (high level)
- Use cold vault for reserve authority; distributor key only signs scheduled distributions.
- LP bots: bounded by caps; deterministic journaling (CSV/JSON) of actions; no hot admin keys.
- Prefer block-height scheduling; avoid exposing node via public IP; use SSH+fail2ban/VPN.
