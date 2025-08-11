export type Winner = { name: string; prize: number };
export type Draw = { epoch: number; totalPrizes: number; winners: Winner[]; timestamp?: string | number | null };
export type LiquidityEntry = { name: string; amount: number };

export function normalizeConfig(cfg: any): {
  topDraws: Draw[];
  liquidity: LiquidityEntry[];
} {
  const rawDraws: any[] =
    (Array.isArray(cfg?.draws) && cfg.draws) ||
    (Array.isArray(cfg?.epochs) && cfg.epochs) ||
    [];

  const mappedDraws: Draw[] = rawDraws.map((d, i) => {
    const winnersArr =
      (Array.isArray(d?.winners) && d.winners) ||
      (Array.isArray(d?.topWinners) && d.topWinners) ||
      (Array.isArray(d?.winnerList) && d.winnerList) ||
      [];

    const winners: Winner[] = winnersArr.map((w: any, j: number) => ({
      name: String(w?.name ?? w?.id ?? w?.address ?? `Winner #${j + 1}`),
      prize: Number(w?.prize ?? w?.amount ?? 0) || 0,
    }));

    const totalPrizes =
      Number(d?.totalPrizes ?? d?.prizePool ?? d?.total ?? d?.payout) ||
      winners.reduce((s, w) => s + (Number(w.prize) || 0), 0);

    const epochNum = Number(d?.epoch ?? d?.id ?? d?.round ?? i) || 0;

    return {
      epoch: epochNum,
      totalPrizes,
      winners,
      timestamp: d?.timestamp ?? d?.date ?? null,
    };
  });

  const topDraws = mappedDraws
    .sort((a, b) => b.epoch - a.epoch)
    .slice(0, 5);

  // Liquidity can be: cfg.liquidity.pools (array) OR cfg.liquidity (object map)
  let liq: LiquidityEntry[] = [];
  const L = cfg?.liquidity;
  if (Array.isArray(L?.pools)) {
    liq = L.pools.map((p: any, i: number) => ({
      name: String(p?.name ?? `Pool ${i + 1}`),
      amount: Number(p?.amount ?? p?.balance ?? p?.value ?? 0) || 0,
    }));
  } else if (L && typeof L === "object") {
    liq = Object.entries(L).map(([k, v]) => ({
      name: String(k),
      amount: Number((v as any)?.amount ?? (v as any) ?? 0) || 0,
    }));
  }

  // filter negatives/NaN
  liq = liq.filter(x => x.amount >= 0 && Number.isFinite(x.amount));

  return { topDraws, liquidity: liq };
}
