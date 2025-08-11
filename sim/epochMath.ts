// Emission math for 1.00% of remaining supply
export function emissionFromRemaining(remaining: bigint): bigint {
  // floor(remaining * 0.01)
  return (remaining * 1n) / 100n;
}

export function nextRemaining(remaining: bigint, emission: bigint, burns: bigint = 0n): bigint {
  return remaining - emission - burns;
}

export function equalSplit(emission: bigint, winners: number): bigint {
  if (winners <= 0) return 0n;
  return emission / BigInt(winners);
}
