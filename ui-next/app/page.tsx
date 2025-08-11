import { normalizeConfig } from "@/app/lib/normalizeConfig";
import { TopDraws } from "@/app/components/TopDraws";
import { LiquidityBars } from "@/app/components/LiquidityBars";

export default async function Home() {
  // Fetch concurrently
  const [healthRes, cfgRes] = await Promise.all([
    fetch("http://localhost:3000/api/health", { cache: "no-store" }).catch(() => null),
    fetch("http://localhost:3000/mock-config.json", { cache: "no-store" }).catch(() => null),
  ]);

  const health = healthRes ? await healthRes.json().catch(() => null) : null;
  const cfg = cfgRes ? await cfgRes.json().catch(() => ({})) : {};

  const { topDraws, liquidity } = normalizeConfig(cfg);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100dvh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>BONDx UI</h1>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr", marginBottom: 16 }}>
        <div style={card}>
          <h3 style={h3}>Health</h3>
          <div>API: {health?.ok ? "OK" : "Not running"}</div>
          <div>OPENAI_API_KEY: {health?.openaiKey ?? "unknown"}</div>
          <div>GITHUB_TOKEN: {health?.githubToken ?? "unknown"}</div>
        </div>
      </section>

      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr", marginBottom: 16 }}>
        <TopDraws draws={topDraws} />
        <LiquidityBars entries={liquidity} />
      </section>
    </main>
  );
}

const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, background: "white" };
const h3: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginBottom: 12 };
