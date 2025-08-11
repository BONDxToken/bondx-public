export type Mojo = number; // use bigint in production
export type CatUnit = bigint;

export interface EpochStats {
  epochIndex: number;
  snapshotHeight: number;
  remainingBefore: CatUnit;
  emission: CatUnit;
  remainingAfter: CatUnit;
  winners: Winner[];
}

export interface Winner {
  rank: number;
  address: string;     // shortened for UI
  amount: CatUnit;
  sharePct: number;
  generatedName: string;
}

export interface LPState {
  xchBalanceMojos: Mojo;
  poolValueQuote: number; // fiat or reference unit at snapshot
}

export interface LPRules {
  upkeepPct: number;     // e.g. 0.01
  sellCapPct: number;    // e.g. 0.30
  splitTargetPct: number;// e.g. 0.50
  splitTolerance: number;// e.g. 0.05
}

export interface ProofSummary {
  snapshotHeight: number;
  seedHex: string;
  prngVersion: string;
  outputsPreview: string[];
}
