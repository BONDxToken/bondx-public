type Entry = { name: string; amount: number };

export function LiquidityBars({ entries }: { entries: Entry[] }) {
  const total = entries.reduce((s, e) => s + (e.amount || 0), 0);
  return (
    <div style={card}>
      <h3 style={h3}>Liquidity</h3>
      {!entries.length ? (
        <div>No liquidity data.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {entries.map((e, i) => {
            const pct = total > 0 ? (e.amount / total) * 100 : 0;
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span>{e.name}</span>
                  <span>{formatAmt(e.amount)} ({pct.toFixed(1)}%)</span>
                </div>
                <div style={barTrack}>
                  <div style={{ ...barFill, width: `${Math.max(2, pct)}%` }} />
                </div>
              </div>
            );
          })}
          <div style={{ fontSize: 12, opacity: 0.7 }}>Total: {formatAmt(total)}</div>
        </div>
      )}
    </div>
  );
}

function formatAmt(n: number) {
  try { return Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n); }
  catch { return String(n); }
}

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "white" };
const h3: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
const barTrack: React.CSSProperties = { height: 10, background: "#f1f5f9", borderRadius: 999 };
const barFill: React.CSSProperties  = { height: "100%", background: "#94a3b8", borderRadius: 999 };
