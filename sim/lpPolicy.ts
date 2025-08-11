import { LPRules } from './types';

export function upkeepAmount(xchMojos: number, rules: LPRules): number {
  return Math.floor(xchMojos * rules.upkeepPct);
}

export function maxSellValue(poolValue: number, rules: LPRules): number {
  return poolValue * rules.sellCapPct;
}

export interface SplitResult {
  bondxTarget: number;
  xchTarget: number;
  withinTolerance: boolean;
}

export function targetSplit(value: number, rules: LPRules): SplitResult {
  const target = value * rules.splitTargetPct;
  const tol = value * rules.splitTolerance;
  const bondx = target;
  const xch = target;
  const within = Math.abs(bondx - xch) <= tol;
  return { bondxTarget: bondx, xchTarget: xch, withinTolerance: within };
}
