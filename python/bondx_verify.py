import argparse, csv, hashlib, math, random
from dataclasses import dataclass
from typing import List, Tuple

# Deterministic PRNG from seed hash
def rng_from_seed(seed_hex: str):
    seed_bytes = bytes.fromhex(seed_hex)
    h = hashlib.sha256(seed_bytes).digest()
    seed_int = int.from_bytes(h, "big")
    rng = random.Random(seed_int)
    return rng

@dataclass
class Holder:
    puzzle_hash: str
    balance_micro: int

def weighted_draw(holders: List[Holder], winners_n: int, seed_hex: str) -> List[Tuple[str, int]]:
    rng = rng_from_seed(seed_hex)
    # Build cumulative weights
    total = sum(h.balance_micro for h in holders)
    if total <= 0:
        return []
    winners = []
    # Use stochastic universal sampling style for stability
    for _ in range(winners_n):
        pick = rng.randrange(total)
        # Find holder
        acc = 0
        for h in holders:
            acc += h.balance_micro
            if pick < acc:
                winners.append((h.puzzle_hash, 1))  # placeholder count ticket; amounts decided separately
                break
    return winners

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--snapshot", required=True, help="CSV with puzzle_hash,balance_micro")
    ap.add_argument("--seed", required=True, help="seed block hash hex")
    ap.add_argument("--winners", type=int, default=100)
    ap.add_argument("--pot_micro", type=int, default=None, help="optional pot in micro-units for sum check")
    args = ap.parse_args()

    holders = []
    with open(args.snapshot, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            holders.append(Holder(row["puzzle_hash"], int(row["balance_micro"])))

    selected = weighted_draw(holders, args.winners, args.seed)
    print(f"selected {len(selected)} winners (PH only). Example first 5: {selected[:5]}")
    if args.pot_micro is not None:
        # Placeholder: split pot equally or by weight externally; check sum equals pot
        print(f"pot_micro provided={args.pot_micro} (split logic lives in ops tool, not in verifier)")

if __name__ == "__main__":
    main()
