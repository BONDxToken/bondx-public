type Winner = { name: string; prize: number };
type Draw = { epoch: number; totalPrizes: number; winners: Winner[]; timestamp?: string | number | null };

export function TopDraws({ draws }: { draws: Draw[] }) {
  if (!draws?.length) {
    return <div style={card}><h3 style={h3}>Top 5 Draws</h3><div>No draws found.</div></div>;
  }

  return (
    <div style={card}>
      <h3 style={h3}>Top 5 Draws</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {draws.map((d) => (
          <div key={d.epoch} style={row}>
            <div style={{ minWidth: 120, fontWeight: 600 }}>Epoch {d.epoch}</div>
            <div style={{ minWidth: 140 }}>Total prizes: <b>{formatAmt(d.totalPrizes)}</b></div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>Winners</div>
              {d.winners?.length ? (
                <ul style={ul}>
                  {d.winners.map((w, i) => (
                    <li key={i} style={li}>
                      <span title={w.name} style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 220, display: "inline-block" }}>
                        {w.name}
                      </span>
                      <span>{formatAmt(w.prize)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ fontSize: 12, opacity: 0.8 }}>No winners listed</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatAmt(n: number) {
  try { return Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n); }
  catch { return String(n); }
}

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "white" };
const h3: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
const row: React.CSSProperties = { display: "flex", gap: 12, alignItems: "flex-start", borderTop: "1px solid #f1f5f9", paddingTop: 12 };
const ul: React.CSSProperties  = { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 };
const li: React.CSSProperties  = { display: "flex", justifyContent: "space-between", gap: 12 };
