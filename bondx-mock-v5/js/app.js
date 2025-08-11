// Addresses
const LP1 = "xch1ty9t2z4q3vqlpzqrwur29y82jf0khzzfq26uay20k7gylzz4jueqdsuxv3";
const LP2 = "xch1kyc0mdu46r40k753fvv7j8t9a526tjty3kxnk6ucxlq0alr0g4ysmcepwn";

// State
let state = {
  epoch: 0,
  remaining: 20_000_000,
  airdrop: 1_000_000,
  circulating: 1_000_000,
  priceUSD: 0.01,
  xchUSD: 25,
  priceMode: "mcap",
  mcapUSD: 10_000,
  vol: 0.4, // 0..1
  holders: 200,
  holderBook: [], // {addr, bal, ageDays}
  history: [],    // epoch records
  blocksPerEpoch: 32_128,
  currentHeight: 4_000_000,
  countdownSecs: 60,
  lp: { LP1:{bondx:50_000,xch:200}, LP2:{bondx:50_000,xch:200} },
  lpHistory: [],  // {epoch, lp, deployedUSD, dexieUSD, tibetUSD, endBONDx, endXCH, endUSD, postSplitPct}
  eligibilityHistory: [],
  lastSnapshot: { epoch: 0, balances: new Map(), eligibleAddrs: 0, eligibleSupply: 0 },
  viewMode: "live"
};

// Aliases
const first=["Elena","Maxwell","Amira","Oliver","Priya","Benjamin","Holly","Samuel","Liam","Zara","Maya","Ethan","Noah","Sofia","Lucas","Ava","Mila","Oscar","Ivy","Leo"];
const middle=["Marie","John","Zoe","Kai","Lee","Skye","Jude","Quinn","Ray","Jai","Cole","Wren","Blair","Rey","Zane"];
const last=["Brooks","Chen","Thompson","Hughes","Kapoor","Hart","Richardson","Yoon","Barrett","Collins","Moore","Singh","Martin","Nguyen","Murray","O'Brien","Doyle","Walsh"];
const aliasCache=new Map();
function aliasFor(addr){
  if(addr===LP1) return "Liquidity Pool 1";
  if(addr===LP2) return "Liquidity Pool 2";
  if(aliasCache.has(addr)) return aliasCache.get(addr);
  let h=0; for (let i=0;i<addr.length;i++){ h=(h*131+addr.charCodeAt(i))>>>0; }
  const alias = `${first[h%first.length]} ${middle[(h>>3)%middle.length]} ${last[(h>>5)%last.length]}`;
  aliasCache.set(addr,alias); return alias;
}

// Utils
function randAddr(){ const chars="abcdefghijklmnopqrstuvwxyz0123456789"; let s="xch1"; for(let i=0;i<56;i++) s+=chars[(Math.random()*chars.length)|0]; return s; }
function fmtB(x){ return Intl.NumberFormat('en-GB').format(Math.round(x)); }
function fmtUSD(x){ return "$"+Intl.NumberFormat('en-GB',{maximumFractionDigits:0}).format(Math.round(x)); }
function clamp(x,a,b){ return Math.max(a, Math.min(b,x)); }

// Charts
function drawLineChart(svg, data, color="#8b5cf6", yFmt=v=>v.toFixed(0)){
  const width=svg.clientWidth, height=svg.clientHeight, pad=28;
  svg.innerHTML=""; if(!data.length) return;
  const minY=Math.min(...data), maxY=Math.max(...data);
  const x=i=> pad + (i*(width-2*pad))/Math.max(1,(data.length-1));
  const y=v=> height-pad - ((v-minY)*(height-2*pad)/Math.max(1,(maxY-minY||1)));
  [["#2a2a33",pad,height-pad,width-pad,height-pad],["#2a2a33",pad,pad,pad,height-pad]].forEach(([c,x1,y1,x2,y2])=>{
    const L=document.createElementNS("http://www.w3.org/2000/svg","line"); L.setAttribute("x1",x1);L.setAttribute("y1",y1);L.setAttribute("x2",x2);L.setAttribute("y2",y2);L.setAttribute("stroke",c); svg.appendChild(L);
  });
  const p=document.createElementNS("http://www.w3.org/2000/svg","path"); let d=""; data.forEach((v,i)=> d+=(i?" L":"M")+x(i)+" "+y(v));
  p.setAttribute("d",d); p.setAttribute("fill","none"); p.setAttribute("stroke",color); p.setAttribute("stroke-width","2"); svg.appendChild(p);
  const t1=document.createElementNS("http://www.w3.org/2000/svg","text"); t1.setAttribute("x",4); t1.setAttribute("y",height-pad-4); t1.setAttribute("fill","#a9a9b3"); t1.textContent=yFmt(minY); svg.appendChild(t1);
  const t2=document.createElementNS("http://www.w3.org/2000/svg","text"); t2.setAttribute("x",4); t2.setAttribute("y",pad+10); t2.setAttribute("fill","#a9a9b3"); t2.textContent=yFmt(maxY); svg.appendChild(t2);
}
function drawDualChart(svg, a, b, colorA="#22c1c3", colorB="#f59e0b", yFmt=v=>v.toFixed(0), midline=null){
  const width=svg.clientWidth, height=svg.clientHeight, pad=28;
  svg.innerHTML=""; if(!a.length) return;
  const all=a.concat(b), minY=Math.min(...all), maxY=Math.max(...all);
  const x=i=> pad + (i*(width-2*pad))/Math.max(1,(a.length-1));
  const y=v=> height-pad - ((v-minY)*(height-2*pad)/Math.max(1,(maxY-minY||1)));
  [["#2a2a33",pad,height-pad,width-pad,height-pad],["#2a2a33",pad,pad,pad,height-pad]].forEach(([c,x1,y1,x2,y2])=>{
    const L=document.createElementNS("http://www.w3.org/2000/svg","line"); L.setAttribute("x1",x1);L.setAttribute("y1",y1);L.setAttribute("x2",x2);L.setAttribute("y2",y2);L.setAttribute("stroke",c); svg.appendChild(L);
  });
  const path=(series,color)=>{ const p=document.createElementNS("http://www.w3.org/2000/svg","path"); let d=""; series.forEach((v,i)=> d+=(i?" L":"M")+x(i)+" "+y(v)); p.setAttribute("d",d); p.setAttribute("fill","none"); p.setAttribute("stroke",color); p.setAttribute("stroke-width","2"); svg.appendChild(p); };
  path(a,colorA); path(b,colorB);
  if(midline!==null){ const ml=document.createElementNS("http://www.w3.org/2000/svg","line"); ml.setAttribute("x1",pad); ml.setAttribute("x2",width-pad); const ymid=y(midline); ml.setAttribute("y1",ymid); ml.setAttribute("y2",ymid); ml.setAttribute("stroke","#666"); ml.setAttribute("stroke-dasharray","4 4"); svg.appendChild(ml); }
  const t1=document.createElementNS("http://www.w3.org/2000/svg","text"); t1.setAttribute("x",4); t1.setAttribute("y",height-pad-4); t1.setAttribute("fill","#a9a9b3"); t1.textContent=yFmt(minY); svg.appendChild(t1);
  const t2=document.createElementNS("http://www.w3.org/2000/svg","text"); t2.setAttribute("x",4); t2.setAttribute("y",pad+10); t2.setAttribute("fill","#a9a9b3"); t2.textContent=yFmt(maxY); svg.appendChild(t2);
}

// Price & Mcap
function updatePriceFromMcap(){
  if(state.priceMode!=="mcap") return;
  const price = state.mcapUSD / Math.max(1, state.circulating);
  state.priceUSD = price;
}
const histWeekly = [-0.28,-0.2,-0.15,-0.12,-0.08,-0.05,0.05,0.08,0.12,0.15,0.2,0.25,0.35];
function nextMcap(current){
  const useHist = Math.random()<0.6;
  let delta = useHist ? histWeekly[(Math.random()*histWeekly.length)|0] : (Math.random()*0.5 - 0.25);
  delta *= state.vol;
  delta = clamp(delta, -0.35, 0.45);
  return Math.max(1_000, current * (1 + delta));
}

// Seed holders evenly
function seedHolders(n, totalAirdrop){
  const per = Math.floor(totalAirdrop / n);
  const book=[];
  for(let i=0;i<n;i++){ book.push({addr: randAddr(), bal: per, ageDays: 7}); }
  book[0].addr = LP1; book[1].addr = LP2;
  return book;
}

// Trading + eligibility
function simulateTrading(){
  const share = 0.02 + Math.random()*0.10;
  const vol = state.circulating * share;
  let recentBuy=0, soldOut=0;
  let buyVol = vol * (0.5 + Math.random()*0.3);
  while(buyVol>0){
    const idx = (Math.random()*state.holderBook.length)|0;
    const add = Math.max(1, Math.floor(Math.min(buyVol, 0.001 * state.circulating)));
    state.holderBook[idx].bal += add;
    state.holderBook[idx].ageDays = 0;
    buyVol -= add; recentBuy += add;
  }
  let sellVol = vol - (vol * (0.5 + Math.random()*0.3));
  while(sellVol>0){
    const idx = (Math.random()*state.holderBook.length)|0;
    const take = Math.max(1, Math.floor(Math.min(sellVol, Math.max(0, state.holderBook[idx].bal))));
    state.holderBook[idx].bal = Math.max(0, state.holderBook[idx].bal - take);
    if(state.holderBook[idx].bal===0){ soldOut += take; state.holderBook[idx].ageDays=0; }
    sellVol -= take;
  }
  return {share, recentBuy, soldOut};
}
function computeEligibility(){
  let eligSupply=0, ineligSupply=0, eligAddrs=0;
  state.holderBook.forEach(h=>{
    if(h.bal>0){
      if(h.ageDays>=7){ eligSupply += h.bal; eligAddrs += 1; }
      else{ ineligSupply += h.bal; }
    }
  });
  const ineligiblePct = state.circulating>0 ? (ineligSupply/state.circulating*100) : 0;
  return {eligSupply, ineligSupply, eligAddrs, ineligiblePct};
}

// Snapshot helpers
function takeSnapshot(elig){
  const snap = new Map();
  state.holderBook.forEach(h=>{ snap.set(h.addr, h.bal); });
  state.lastSnapshot = {
    epoch: state.epoch,
    balances: snap,
    eligibleAddrs: elig.eligAddrs,
    eligibleSupply: Math.round(elig.eligSupply)
  };
}

// UI helpers
function updateSummary(){
  document.getElementById("remainingPot").textContent = fmtB(state.remaining)+" BONDx";
  document.getElementById("marketCap").textContent = fmtUSD(state.mcapUSD);
  document.getElementById("viewBadge").textContent = state.viewMode==="live" ? "Live" : "Locked";
  const s = state.lastSnapshot;
  document.getElementById("snapshotInfo").textContent =
    s.epoch>0 ? `Epoch #${s.epoch} • Eligible: ${fmtB(s.eligibleAddrs)} addrs / ${fmtB(s.eligibleSupply)} BONDx`
              : "No snapshot yet";
}
function balanceFor(addr){
  if(state.viewMode==="locked"){
    return state.lastSnapshot.balances.get(addr) ?? 0;
  }
  const h = state.holderBook.find(x=>x.addr===addr);
  return h ? h.bal : 0;
}

// Winners & tables
function rebuildTopWinners(){
  const map=new Map();
  state.history.forEach(ep=> ep.winners.forEach(w=>{
    if(!map.has(w.addr)) map.set(w.addr,{alias:aliasFor(w.addr), addr:w.addr, total:0, wins:0});
    const e=map.get(w.addr); e.total+=w.amount; e.wins+=1;
  }));
  const arr=[...map.values()].sort((a,b)=>b.total-a.total).slice(0,10);
  let html="<tr><th>#</th><th>Alias</th><th>Address</th><th>Total BONDx</th><th>Wins</th></tr>";
  arr.forEach((e,i)=>{
    const short = e.addr.slice(0,10)+"…"+e.addr.slice(-6);
    const color = e.addr===LP1 ? "var(--accent-2)" : (e.addr===LP2 ? "var(--accent-3)" : "inherit");
    html += `<tr><td>#${i+1}</td><td style="color:${color}">${e.alias}</td><td><code>${short}</code></td><td>${fmtB(e.total)}</td><td>${e.wins}</td></tr>`;
  });
  document.getElementById("topWinners").innerHTML = html;
}
function rebuildLastFive(){
  const last=state.history.slice(-5).reverse();
  let html="<tr><th>Epoch</th><th>Prize</th><th>Remaining</th><th>Seed</th><th>Top winners (alias • amt)</th></tr>";
  const pots=state.history.map(h=>h.prize); const avg=pots.length?pots.reduce((a,b)=>a+b,0)/pots.length:0;
  last.forEach(ep=>{
    const badge = ep.prize>avg*1.05? "green" : (ep.prize<avg*0.95? "red":"yellow");
    const top = ep.winners.slice(0,5).map(w=>`${aliasFor(w.addr)} • ${fmtB(w.amount)}`).join(", ");
    html += `<tr>
      <td>#${ep.epoch}</td>
      <td>${fmtB(ep.prize)} <span class="badge ${badge}"></span></td>
      <td>${fmtB(ep.remaining)}</td>
      <td>${ep.seed.slice(0,8)}</td>
      <td class="small">${top||"—"}</td>
    </tr>`;
  });
  document.getElementById("lastFive").innerHTML = html;
}
function rebuildDrawDetails(){
  const five = state.history.slice(-5).reverse();
  let out="";
  five.forEach(ep=>{
    const total = ep.prize;
    const tierA = Math.floor(total*0.10);
    const tierB = Math.floor(total*0.50);
    const tierC = total - tierA - tierB;
    const wA = ep.winners[0] ? `${aliasFor(ep.winners[0].addr)} • ${fmtB(ep.winners[0].amount)} BONDx` : "—";
    const wB = ep.winners.slice(1,21).map(w=>`${aliasFor(w.addr)} • ${fmtB(w.amount)}`).join(", ");
    const wC = ep.winners.slice(21).slice(0,10).map(w=>`${aliasFor(w.addr)} • ${fmtB(w.amount)}`).join(", ");
    out += `
      <div class="card" style="margin:8px 0">
        <h3 style="margin:0 0 6px 0">Epoch #${ep.epoch} — Prize ${fmtB(total)} BONDx</h3>
        <div class="small">Snapshot: ${ep.snapshot?.eligibleAddrs||0} eligible addrs / ${fmtB(ep.snapshot?.eligibleSupply||0)} BONDx</div>
        <table class="table" style="margin-top:8px">
          <tr><th>Tier</th><th>Split</th><th>Winners</th><th>Total Tier</th><th>Details (aliases)</th></tr>
          <tr><td>A</td><td>10%</td><td>1</td><td>${fmtB(tierA)}</td><td class="small">${wA}</td></tr>
          <tr><td>B</td><td>50%</td><td>20</td><td>${fmtB(tierB)}</td><td class="small">${wB||"—"}</td></tr>
          <tr><td>C</td><td>40%</td><td>${Math.max(0, ep.winners.length-21)}</td><td>${fmtB(tierC)}</td><td class="small">${wC||"—"}${ep.winners.length>31?" …":""}</td></tr>
        </table>
      </div>`;
  });
  document.getElementById("drawDetails").innerHTML = out || "<div class='small'>No draws yet.</div>";
}

// LP helpers/sections
function lpTotalUSD(lp){ return lp.bondx*state.priceUSD + lp.xch*state.xchUSD; }
function lpRebalanceTo5050(lp){ const total=lpTotalUSD(lp); const half=total/2; lp.bondx=half/state.priceUSD; lp.xch=half/state.xchUSD; }
function rebuildLPSection(){
  let lp1WonTot=0, lp2WonTot=0; let last=state.history[state.history.length-1]||null;
  let lp1WonLast=false, lp2WonLast=false;
  state.history.forEach(ep=> ep.winners.forEach(w=>{ if(w.addr===LP1) lp1WonTot+=w.amount; if(w.addr===LP2) lp2WonTot+=w.amount; }));
  if(last){ lp1WonLast=last.winners.some(w=>w.addr===LP1); lp2WonLast=last.winners.some(w=>w.addr===LP2); }
  const lp1Live = state.lp.LP1, lp2Live = state.lp.LP2;
  const lp1b = state.viewMode==="locked" ? (state.lastSnapshot.balances.get(LP1)||lp1Live.bondx) : lp1Live.bondx;
  const lp2b = state.viewMode==="locked" ? (state.lastSnapshot.balances.get(LP2)||lp2Live.bondx) : lp2Live.bondx;
  const lp1x = lp1Live.xch, lp2x = lp2Live.xch;
  const lp1Val = lp1b*state.priceUSD + lp1x*state.xchUSD;
  const lp2Val = lp2b*state.priceUSD + lp2x*state.xchUSD;
  const lp1Split = lp1Val? Math.round((lp1b*state.priceUSD)/lp1Val*100):50;
  const lp2Split = lp2Val? Math.round((lp2b*state.priceUSD)/lp2Val*100):50;

  let html="<tr><th>Pool</th><th>Won This Epoch?</th><th>Cumulative Won</th><th>Balance (BONDx)</th><th>XCH</th><th>Split</th><th>Venue split (this epoch)</th></tr>";
  const lastHist1 = [...state.lpHistory].reverse().find(r=>r.lp==="LP1");
  const lastHist2 = [...state.lpHistory].reverse().find(r=>r.lp==="LP2");
  const v1 = lastHist1 ? `Dexie ${fmtUSD(lastHist1.dexieUSD)} • Tibet ${fmtUSD(lastHist1.tibetUSD)}` : "—";
  const v2 = lastHist2 ? `Dexie ${fmtUSD(lastHist2.dexieUSD)} • Tibet ${fmtUSD(lastHist2.tibetUSD)}` : "—";
  html += `<tr><td style="color:var(--accent-2)">Liquidity Pool 1</td><td>${lp1WonLast?"Yes":"No"}</td><td>${fmtB(lp1WonTot)} BONDx</td><td>${fmtB(lp1b)}</td><td>${lp1x.toFixed(3)}</td><td>${lp1Split}% / ${100-lp1Split}%</td><td class="small">${v1}</td></tr>`;
  html += `<tr><td style="color:var(--accent-3)">Liquidity Pool 2</td><td>${lp2WonLast?"Yes":"No"}</td><td>${fmtB(lp2WonTot)} BONDx</td><td>${fmtB(lp2b)}</td><td>${lp2x.toFixed(3)}</td><td>${lp2Split}% / ${100-lp2Split}%</td><td class="small">${v2}</td></tr>`;
  document.getElementById("lpSection").innerHTML=html;
}
function rebuildLPVisuals(){
  const epochs = state.history.map(h=>h.epoch);
  const s1 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP1")||{}).endUSD || (ep>1 ? (state.lpHistory.find(r=>r.epoch===ep-1 && r.lp==="LP1")||{}).endUSD || 0 : 0));
  const s2 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP2")||{}).endUSD || (ep>1 ? (state.lpHistory.find(r=>r.epoch===ep-1 && r.lp==="LP2")||{}).endUSD || 0 : 0));
  drawDualChart(document.getElementById("chartLP"), s1, s2, "#22c1c3", "#f59e0b", v=>fmtUSD(v));
  const sp1 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP1")||{}).postSplitPct ?? 50);
  const sp2 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP2")||{}).postSplitPct ?? 50);
  drawDualChart(document.getElementById("chartLPSplit"), sp1, sp2, "#22c1c3", "#f59e0b", v=>`${Math.round(v)}%`, 50);

  // New: deployed USD per epoch
  const d1 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP1")||{}).deployedUSD || 0);
  const d2 = epochs.map(ep=> (state.lpHistory.find(r=>r.epoch===ep && r.lp==="LP2")||{}).deployedUSD || 0);
  drawDualChart(document.getElementById("chartLPDeploy"), d1, d2, "#22c1c3", "#f59e0b", v=>fmtUSD(v));

  // Venue totals text
  const totalDexie = state.lpHistory.reduce((s,r)=> s + (r.dexieUSD||0), 0);
  const totalTibet = state.lpHistory.reduce((s,r)=> s + (r.tibetUSD||0), 0);
  document.getElementById("lpVenueTotals").textContent = `Cumulative venue split: Dexie ${fmtUSD(totalDexie)} • Tibet ${fmtUSD(totalTibet)}`;
}

// Eligibility UI
function rebuildEligibilityUI(){
  const hist = state.eligibilityHistory;
  const elig = hist.map(h=>h.eligibleSupply);
  const inelig = hist.map(h=>h.ineligibleSupply);
  drawDualChart(document.getElementById("chartEligibility"), elig, inelig, "#22c55e", "#ef4444", v=>fmtB(v));
  const last = hist[hist.length-1] || {eligibleSupply:0,ineligibleSupply:0,eligibleAddrs:0,ineligiblePct:0,reasons:{recentBuy:0,soldOut:0}};
  document.getElementById("eligibleSupply").textContent = fmtB(last.eligibleSupply)+" BONDx";
  document.getElementById("ineligibleSupply").textContent = fmtB(last.ineligibleSupply)+" BONDx";
  document.getElementById("eligibleAddrs").textContent = fmtB(last.eligibleAddrs);
  document.getElementById("ineligiblePct").textContent = Math.round(last.ineligiblePct)+"%";
  document.getElementById("exclusionBreakdown").textContent = `Excluded reasons (approx): recent buys ${fmtB(last.reasons?.recentBuy||0)} BONDx; sold-out ${fmtB(last.reasons?.soldOut||0)} BONDx.`;
}

// Mcap/Price
function rebuildMcapPriceChart(){
  const mcaps = state.history.map(h=>h.mcapUSD);
  const prices = state.history.map(h=>h.priceUSD);
  drawDualChart(document.getElementById("chartMcapPrice"), mcaps, prices, "#8b5cf6", "#ecc94b", v=>fmtUSD(v));
}

// Comparison
function rebuildComparison(){
  const a = parseInt(document.getElementById("cmpA").value)||1;
  const b = parseInt(document.getElementById("cmpB").value)||1;
  const A = state.history.find(h=>h.epoch===a);
  const B = state.history.find(h=>h.epoch===b);
  if(!A || !B){ document.getElementById("cmpTable").innerHTML="<tr><td class='small'>Choose valid epochs.</td></tr>"; return; }
  const EA = state.eligibilityHistory.find(h=>h.epoch===a);
  const EB = state.eligibilityHistory.find(h=>h.epoch===b);
  let html = "<tr><th>Metric</th><th>Epoch "+a+"</th><th>Epoch "+b+"</th></tr>";
  html += `<tr><td>Market Cap</td><td>${fmtUSD(A.mcapUSD)}</td><td>${fmtUSD(B.mcapUSD)}</td></tr>`;
  html += `<tr><td>Price</td><td>${fmtUSD(A.priceUSD)}</td><td>${fmtUSD(B.priceUSD)}</td></tr>`;
  html += `<tr><td>Eligible Supply</td><td>${fmtB(EA?.eligibleSupply||0)}</td><td>${fmtB(EB?.eligibleSupply||0)}</td></tr>`;
  html += `<tr><td>Ineligible %</td><td>${Math.round(EA?.ineligiblePct||0)}%</td><td>${Math.round(EB?.ineligiblePct||0)}%</td></tr>`;
  html += `<tr><td>Eligible Addresses</td><td>${fmtB(EA?.eligibleAddrs||0)}</td><td>${fmtB(EB?.eligibleAddrs||0)}</td></tr>`;
  html += `<tr><td>Prize</td><td>${fmtB(A.prize)} BONDx</td><td>${fmtB(B.prize)} BONDx</td></tr>`;
  document.getElementById("cmpTable").innerHTML = html;
}

function rebuildAll(){
  updateSummary();
  rebuildLastFive();
  rebuildDrawDetails();
  rebuildTopWinners();
  rebuildLPSection();
  rebuildLPVisuals();
  rebuildEligibilityUI();
  rebuildMcapPriceChart();
  rebuildComparison();
  rebuildSearch();
}

// Epoch step (PRIZE = **1%** of remaining now)
function stepEpoch(){
  // evolve market cap/price
  state.mcapUSD = nextMcap(state.mcapUSD);
  if(state.priceMode==="mcap"){ updatePriceFromMcap(); }

  // age balances by 7 days
  state.holderBook.forEach(h=>{ if(h.bal>0) h.ageDays += 7; });

  // simulate trading this epoch
  const trade = simulateTrading();

  // eligibility snapshot (locked)
  const elig = computeEligibility();
  takeSnapshot(elig);

  // 1% prize
  const prize = Math.max(1, Math.floor(state.remaining * 0.01));

  // winners from eligible holders, weighted
  const eligibleHolders = state.holderBook.filter(h=> h.bal>0 && h.ageDays>=7);
  const weights = eligibleHolders.map(h=>h.bal);
  const k = Math.min(100, eligibleHolders.length);
  function weightedSampleNoReplace(items,weights,k){
    let res=[], idxs=items.map((_,i)=>i), w=weights.slice();
    for(let pick=0; pick<k && idxs.length>0; pick++){
      const total=w.reduce((a,b)=>a+b,0); let r=Math.random()*total, acc=0, chosen=0;
      for(let i=0;i<w.length;i++){ acc+=w[i]; if(r<=acc){ chosen=i; break; } }
      res.push(idxs[chosen]); idxs.splice(chosen,1); w.splice(chosen,1);
    } return res;
  }
  const picked = weightedSampleNoReplace(eligibleHolders, weights, k);
  const winners = picked.map(i=> ({addr: eligibleHolders[i].addr, alias: aliasFor(eligibleHolders[i].addr), amount:0}));

  // tier split: 10% / 50% / 40%
  const a = Math.floor(prize*0.10);
  const bTot = Math.floor(prize*0.50);
  const cTot = prize - a - bTot;
  if(winners.length>0) winners[0].amount = a;
  const bEach = Math.floor(bTot/Math.min(20, Math.max(0,winners.length-1)));
  for(let i=1;i<Math.min(21,winners.length);i++) winners[i].amount = bEach;
  const cEach = Math.floor(cTot/Math.max(1, winners.length-21));
  for(let i=21;i<winners.length;i++) winners[i].amount = cEach;

  // credit winners
  winners.forEach(w=>{ const h=state.holderBook.find(x=>x.addr===w.addr); if(h){ h.bal += w.amount; } });

  // LP winnings
  let lp1Amt=0, lp2Amt=0;
  winners.forEach(w=>{ if(w.addr===LP1) lp1Amt+=w.amount; if(w.addr===LP2) lp2Amt+=w.amount; });
  state.lp.LP1.bondx += lp1Amt;
  state.lp.LP2.bondx += lp2Amt;

  // advance epoch & record draw
  state.remaining -= prize;
  state.circulating += prize;
  state.epoch += 1;
  state.currentHeight += state.blocksPerEpoch;
  const seed = (Math.random().toString(16).slice(2)+"00000000").slice(0,64);
  state.history.push({
    epoch: state.epoch, blockHeight: state.currentHeight, prize,
    remaining: state.remaining, holdersCount: state.holderBook.filter(h=>h.bal>0).length,
    mcapUSD: state.mcapUSD, priceUSD: state.priceUSD, winners, seed,
    snapshot: { eligibleAddrs: state.lastSnapshot.eligibleAddrs, eligibleSupply: state.lastSnapshot.eligibleSupply }
  });

  // LP cycle: rebalance to 50/50 and log venue split
  ["LP1","LP2"].forEach(key=>{
    const lp = state.lp[key];
    const startUSD = lpTotalUSD(lp);
    const deployUSD = startUSD * 0.25; // weekly deploy capacity
    // venue split: partially random each epoch (can later make rule-based)
    const dexieShare = 0.4 + Math.random()*0.5; // 40–90% to Dexie
    const dexieUSD = deployUSD * dexieShare;
    const tibetUSD = deployUSD - dexieUSD;

    lpRebalanceTo5050(lp);
    const endUSD = lpTotalUSD(lp);
    const postSplitPct = endUSD ? ((lp.bondx*state.priceUSD)/endUSD*100) : 50;

    state.lpHistory.push({
      epoch: state.epoch, lp: key, deployedUSD: deployUSD, dexieUSD, tibetUSD,
      endBONDx: lp.bondx, endXCH: lp.xch, endUSD, postSplitPct
    });
  });

  // eligibility record
  state.eligibilityHistory.push({
    epoch: state.epoch,
    eligibleSupply: state.lastSnapshot.eligibleSupply,
    ineligibleSupply: Math.max(0, Math.round(state.circulating - state.lastSnapshot.eligibleSupply)),
    eligibleAddrs: state.lastSnapshot.eligibleAddrs,
    ineligiblePct: state.circulating>0 ? ((state.circulating - state.lastSnapshot.eligibleSupply)/state.circulating*100) : 0,
    reasons: trade
  });

  rebuildAll();
}

// Countdown
function tickCountdown(){
  state.countdownSecs -= 1;
  if(state.countdownSecs<=0){ state.countdownSecs=60; stepEpoch(); }
  const mins=Math.floor(state.countdownSecs/60), secs=state.countdownSecs%60;
  document.getElementById("countdown").textContent = `${mins}:${secs.toString().padStart(2,"0")} (mock)`;
  const blocksRemain = Math.max(0, state.blocksPerEpoch - Math.floor((60 - state.countdownSecs) * (state.blocksPerEpoch / 60)));
  document.getElementById("blocksRemaining").textContent = `Blocks Remaining: ${blocksRemain}`;
}

// Inputs & init
function applyInputs(){
  state.airdrop = Math.max(0, parseFloat(document.getElementById("airdropInput").value)||0);
  state.circulating = state.airdrop;
  state.holders = Math.max(1, parseInt(document.getElementById("holderInput").value)||200);
  state.priceMode = document.getElementById("priceMode").value;
  state.mcapUSD = Math.max(1000, parseFloat(document.getElementById("mcapInput").value)||10000);
  state.priceUSD = Math.max(0, parseFloat(document.getElementById("priceInput").value)||0.01);
  state.vol = clamp((parseInt(document.getElementById("volInput").value)||40)/100, 0, 1);
  state.xchUSD = Math.max(0, parseFloat(document.getElementById("xchPriceInput").value)||25);
  state.lp.LP1.bondx = Math.max(0, parseFloat(document.getElementById("lp1b").value)||0);
  state.lp.LP1.xch   = Math.max(0, parseFloat(document.getElementById("lp1x").value)||0);
  state.lp.LP2.bondx = Math.max(0, parseFloat(document.getElementById("lp2b").value)||0);
  state.lp.LP2.xch   = Math.max(0, parseFloat(document.getElementById("lp2x").value)||0);
  state.viewMode = document.getElementById("viewMode").value;
  if(state.priceMode==="mcap"){ updatePriceFromMcap(); }
}
function resetAll(){
  applyInputs();
  state.epoch=0; state.remaining=20_000_000; state.history=[]; state.lpHistory=[]; state.eligibilityHistory=[];
  state.currentHeight=4_000_000; state.countdownSecs=60;
  state.holderBook = seedHolders(state.holders, state.airdrop);
  state.lastSnapshot = { epoch: 0, balances: new Map(), eligibleAddrs: 0, eligibleSupply: 0 };
  stepEpoch();
}
function rebuildSearch(){
  const q=document.getElementById("searchBox").value.trim().toLowerCase();
  document.getElementById("searchModeLabel").textContent = state.viewMode==="live" ? "Live" : "Locked";
  if(!q){ document.getElementById("searchResults").innerHTML="<span class='small'>Type a name or address fragment…</span>"; return; }
  const agg=new Map();
  state.history.forEach(ep=> ep.winners.forEach(w=>{
    const name=aliasFor(w.addr);
    if(name.toLowerCase().includes(q) || w.addr.toLowerCase().includes(q)){
      if(!agg.has(w.addr)) agg.set(w.addr,{alias:name, addr:w.addr, total:0, wins:0});
      const e=agg.get(w.addr); e.total+=w.amount; e.wins+=1;
    }
  }));
  const arr=[...agg.values()].sort((a,b)=>b.total-a.total);
  if(!arr.length){ document.getElementById("searchResults").innerHTML="<span class='small'>No matches.</span>"; return; }
  let html="<table class='table'><tr><th>Alias</th><th>Address</th><th>Balance</th><th>Total Won</th><th>Wins</th></tr>";
  arr.forEach(e=>{
    const color = e.addr===LP1 ? "var(--accent-2)" : (e.addr===LP2 ? "var(--accent-3)" : "inherit");
    const short = e.addr.slice(0,10)+"…"+e.addr.slice(-6);
    const bal = balanceFor(e.addr);
    html += `<tr><td style="color:${color}">${e.alias}</td><td><code>${short}</code></td><td>${fmtB(bal)}</td><td>${fmtB(e.total)}</td><td>${e.wins}</td></tr>`;
  });
  html+="</table>"; document.getElementById("searchResults").innerHTML=html;
}

function init(){
  ["airdropInput","holderInput","priceMode","mcapInput","priceInput","volInput","xchPriceInput","lp1b","lp1x","lp2b","lp2x","cmpA","cmpB","viewMode"].forEach(id=>{
    const el = document.getElementById(id); if(!el) return;
    el.addEventListener("input", ()=>{ applyInputs(); rebuildAll(); });
  });
  document.getElementById("ff10").addEventListener("click", ()=>{ for(let i=0;i<10;i++) stepEpoch(); });
  document.getElementById("reset").addEventListener("click", resetAll);
  document.getElementById("cmpGo").addEventListener("click", rebuildComparison);
  document.getElementById("searchBox").addEventListener("input", rebuildSearch);
  document.getElementById("clearSearch").addEventListener("click", ()=>{ document.getElementById("searchBox").value=""; rebuildSearch(); });

  resetAll();
  setInterval(tickCountdown, 1000);
}
window.addEventListener("load", init);