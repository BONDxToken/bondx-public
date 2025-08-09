import argparse, math

def simulate(treasury, decimals=6, rate=0.005):
    micro = 10**decimals
    bal = int(treasury * micro)
    epochs = 0
    total = 0
    while True:
        pot = math.floor(bal * rate)
        if pot < 1:
            return epochs, total / micro, bal / micro
        bal -= pot
        total += pot
        epochs += 1

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--treasury", type=float, default=20_000_000)
    p.add_argument("--decimals", type=int, default=6)
    p.add_argument("--rate", type=float, default=0.005)
    args = p.parse_args()
    e, dist, final_bal = simulate(args.treasury, args.decimals, args.rate)
    years = e/52
    print(f"epochs_until_stop={e} (~{years:.2f} years)")
    print(f"total_distributed={dist}")
    print(f"final_treasury_balance={final_bal}")
