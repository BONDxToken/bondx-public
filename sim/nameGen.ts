import * as crypto from 'crypto';
import * as fs from 'fs';

export interface NameGenConfig {
  horseHumour?: boolean;
  namesFilePath?: string; // optional explicit path to table
}

export class NameGenerator {
  private table: string[];
  private config: NameGenConfig;

  constructor(config: NameGenConfig = {}) {
    this.config = config;
    const defaultPath = config.namesFilePath || __dirname + '/data/names/horse_humour.txt';
    if (config.horseHumour) {
      this.table = this.loadNames(defaultPath);
    } else {
      // Neutral fallback if no file provided
      this.table = this.buildNeutralFallback();
    }
    if (this.table.length === 0) {
      this.table = this.buildNeutralFallback();
    }
  }

  private loadNames(p: string): string[] {
    try {
      const raw = fs.readFileSync(p, 'utf-8');
      return raw.split('\n').map(s => s.trim()).filter(Boolean);
    } catch {
      return [];
    }
  }

  private buildNeutralFallback(): string[] {
    const adjectives = ['Bright','Swift','Lucky','Calm','Brave','Quiet','Neat','Cosmic','Pixel','Velvet'];
    const nouns = ['Sprout','Signal','Momentum','Orbit','Ledger','Kernel','Quarry','Beacon','Harbor','Nimbus'];
    const out: string[] = [];
    for (const a of adjectives) for (const n of nouns) out.push(`${a} ${n}`);
    return out;
  }

  /** Deterministic mapping from (winnerId, epochSeedHex) to table index */
  indexFor(winnerId: string, epochSeedHex: string): number {
    const hash = crypto.createHash('sha256').update(winnerId + '|' + epochSeedHex, 'utf8').digest();
    const num = hash.readUInt32BE(0);
    return num % this.table.length;
  }

  getName(winnerId: string, epochSeedHex: string): string {
    const idx = this.indexFor(winnerId, epochSeedHex);
    return this.table[idx];
  }
}
