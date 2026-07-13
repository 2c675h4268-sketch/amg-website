// /admin?key=<secret> — private growth dashboard for The Atomic Five.
// Data comes from the key-gated `admin-stats` edge function, which returns aggregates
// only (counts/rates, no PII) and holds the Brevo key server-side. noindex, never cached.
const STATS = "https://qybwjkyifdroktiriaqt.supabase.co/functions/v1/admin-stats";
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const HEAD = (title) => `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title>
<meta name="robots" content="noindex"><link rel="icon" href="data:,">
<style>
  :root{--ink:#0d0f14;--ink-soft:#3a3d47;--ink-muted:#7a7e8a;--surface:#f5f5f7;--border:#e2e0dc;--accent:#2563eb;--green:#059669;--gold:#ca8a04;--apple:-apple-system,BlinkMacSystemFont,"SF Pro Display","Helvetica Neue",Helvetica,Arial,sans-serif;}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--apple);background:var(--surface);color:var(--ink);line-height:1.55}
  nav{background:#0b0f1c;display:flex;justify-content:center;height:58px}
  .nav-in{width:100%;max-width:980px;padding:0 22px;display:flex;align-items:center;justify-content:space-between}
  .logo-text{font-size:14px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#fff}
  .stamp{font-size:12px;color:#8ea3cf}
  .wrap{max-width:980px;margin:0 auto;padding:30px 22px 70px}
  h1{font-size:25px;font-weight:700;letter-spacing:-.4px;margin-bottom:3px}
  .sub{font-size:14px;color:var(--ink-muted);margin-bottom:24px}
  .cards{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:26px}
  .card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 20px}
  .card .k{font-size:12px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--ink-muted);margin-bottom:8px}
  .card .v{font-size:32px;font-weight:700;letter-spacing:-1px;line-height:1}
  .card .m{font-size:12.5px;color:var(--ink-muted);margin-top:6px}
  .card .v.accent{color:var(--accent)}.card .v.green{color:var(--green)}.card .v.gold{color:var(--gold)}
  .panel{background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px 24px;margin-bottom:20px}
  .panel h2{font-size:13px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--ink-muted);margin-bottom:16px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
  .legend{display:flex;gap:18px;margin-top:12px;font-size:13px;color:var(--ink-soft);flex-wrap:wrap}
  .legend i{display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:6px;vertical-align:-1px}
  .rows{display:flex;flex-direction:column;gap:2px}
  .row{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--surface)}
  .row:last-child{border-bottom:none}
  .row .nm{flex:1;font-size:14px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .row .bar{flex:none;width:120px;height:8px;background:var(--surface);border-radius:99px;overflow:hidden}
  .row .bar i{display:block;height:100%;background:var(--accent);border-radius:99px}
  .row .n{flex:none;width:44px;text-align:right;font-size:13.5px;font-weight:700;color:var(--ink-soft)}
  .empty{font-size:13.5px;color:var(--ink-muted);padding:8px 0}
  .fb{display:flex;gap:26px;align-items:center}
  .fb .big{font-size:40px;font-weight:800;letter-spacing:-1px}
  .gate{max-width:420px;margin:80px auto;background:#fff;border:1px solid var(--border);border-radius:16px;padding:34px 30px;text-align:center}
  .gate h1{font-size:20px;margin-bottom:8px}.gate p{font-size:14px;color:var(--ink-muted)}
  .gate input{width:100%;margin-top:16px;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit}
  .gate button{width:100%;margin-top:10px;padding:11px;border:none;border-radius:10px;background:var(--accent);color:#fff;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit}
  footer{text-align:center;padding:24px;font-size:12px;color:var(--ink-muted)}
  @media(max-width:760px){.cards{grid-template-columns:repeat(2,1fr)}.grid2{grid-template-columns:1fr}}
</style></head><body>`;
const NAV = `<nav><div class="nav-in"><span class="logo-text">The Atomic Five</span>`;

function gate(msg) {
  return HEAD("Admin") + NAV + `<span class="stamp">Growth</span></div></nav>
  <div class="gate"><h1>Growth dashboard</h1><p>${esc(msg || "Enter your access key to continue.")}</p>
  <form method="get" action="/admin"><input type="password" name="key" placeholder="Access key" autofocus>
  <button type="submit">View dashboard</button></form></div>
  <footer>The Atomic Five · private</footer></body></html>`;
}

function growthChart(daily) {
  const W = 900, H = 240, PADL = 34, PADR = 14, PADT = 14, PADB = 26;
  const iw = W - PADL - PADR, ih = H - PADT - PADB;
  const n = daily.length; if (!n) return `<div class="empty">No data yet.</div>`;
  const maxCum = Math.max(1, ...daily.map((d) => d.cum));
  const maxN = Math.max(1, ...daily.map((d) => d.n));
  const x = (i) => PADL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const yC = (v) => PADT + ih - (v / maxCum) * ih;
  let grid = "";
  for (let t = 0; t <= 4; t++) { const v = Math.round((maxCum / 4) * t); const yy = yC(v);
    grid += `<line x1="${PADL}" y1="${yy.toFixed(1)}" x2="${W - PADR}" y2="${yy.toFixed(1)}" stroke="#e2e0dc" stroke-width="1"/><text x="${PADL - 7}" y="${(yy + 3.5).toFixed(1)}" text-anchor="end" font-size="10" fill="#7a7e8a">${v}</text>`; }
  const bw = Math.max(2, (iw / Math.max(n, 1)) * 0.5);
  let bars = "";
  daily.forEach((d, i) => { if (!d.n) return; const bh = (d.n / maxN) * (ih * 0.42);
    bars += `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${(PADT + ih - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="1.5" fill="#2563eb" opacity="0.16"/>`; });
  const pts = daily.map((d, i) => `${x(i).toFixed(1)},${yC(d.cum).toFixed(1)}`);
  const area = `M${x(0).toFixed(1)},${(PADT + ih).toFixed(1)} L${pts.join(" L")} L${x(n - 1).toFixed(1)},${(PADT + ih).toFixed(1)} Z`;
  let xlabels = "";
  [0, Math.floor((n - 1) / 2), n - 1].forEach((i) => { xlabels += `<text x="${x(i).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="10" fill="#7a7e8a">${daily[i].d.slice(5).replace("-", "/")}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Subscriber growth">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2563eb" stop-opacity="0.18"/><stop offset="1" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs>
    ${grid}${bars}<path d="${area}" fill="url(#ga)"/><path d="M${pts.join(" L")}" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(n - 1).toFixed(1)}" cy="${yC(daily[n - 1].cum).toFixed(1)}" r="4" fill="#2563eb"/>${xlabels}</svg>`;
}

function barRows(items, keyName) {
  if (!items || !items.length) return `<div class="empty">Nothing yet.</div>`;
  const max = Math.max(1, ...items.map((i) => i.n));
  return `<div class="rows">` + items.map((i) => `<div class="row"><div class="nm">${esc(i[keyName])}</div><div class="bar"><i style="width:${Math.round((i.n / max) * 100)}%"></i></div><div class="n">${i.n}</div></div>`).join("") + `</div>`;
}

const CONSUMER = { "gmail.com": "Gmail", "googlemail.com": "Gmail", "outlook.com": "Outlook", "hotmail.com": "Outlook / Hotmail", "live.com": "Outlook / Live", "icloud.com": "Apple (iCloud)", "me.com": "Apple (iCloud)", "mac.com": "Apple (iCloud)", "yahoo.com": "Yahoo", "proton.me": "Proton", "protonmail.com": "Proton", "aol.com": "AOL" };
const isPersonal = (dom) => !!CONSUMER[dom];
const domainLabel = (dom) => CONSUMER[dom] || dom;

export async function onRequest(context) {
  const key = new URL(context.request.url).searchParams.get("key") || "";
  const noStore = { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "X-Robots-Tag": "noindex" };
  if (!key) return new Response(gate(), { headers: noStore });

  let d = { ok: false };
  try { const r = await fetch(`${STATS}?key=${encodeURIComponent(key)}`, { headers: { accept: "application/json" } }); d = await r.json(); } catch (e) {}
  if (!d || !d.ok) return new Response(gate("That key wasn't recognized. Try again."), { headers: noStore, status: 401 });

  const t = d.totals, eng = d.engagement, fb = d.feedback || { yes: 0, no: 0 };
  const waveRows = (d.waves || []).map((w) => ({ nm: w.tz, n: w.n }));
  const domains = (d.domains || []);
  const personalN = domains.filter((x) => isPersonal(x.domain)).reduce((s, x) => s + x.n, 0);
  const companyN = domains.reduce((s, x) => s + x.n, 0) - personalN;
  const companyOrgs = domains.filter((x) => !isPersonal(x.domain)).length;
  const domMerged = {};
  domains.forEach((x) => { const l = domainLabel(x.domain); domMerged[l] = (domMerged[l] || 0) + x.n; });
  const domainRows = Object.entries(domMerged).map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
  const fbTotal = Math.max(1, fb.yes + fb.no);
  const fbPct = Math.round((fb.yes / fbTotal) * 100);

  const body = `<div class="wrap">
    <h1>Growth dashboard</h1>
    <div class="sub">The Atomic Five · live subscriber &amp; engagement metrics</div>

    <div class="cards">
      <div class="card"><div class="k">Subscribers</div><div class="v accent">${t.active}</div><div class="m">active &amp; receiving</div></div>
      <div class="card"><div class="k">New · 30d</div><div class="v green">${t.new30}</div><div class="m">${t.new7} in last 7 days</div></div>
      <div class="card"><div class="k">Open rate</div><div class="v">${eng ? eng.d30.open + "%" : "&mdash;"}</div><div class="m">${eng ? eng.d7.open + "% last 7d" : "no data"}</div></div>
      <div class="card"><div class="k">Click rate</div><div class="v accent">${eng ? eng.d30.click + "%" : "&mdash;"}</div><div class="m">${eng ? eng.d7.click + "% last 7d" : "no data"}</div></div>
      <div class="card"><div class="k">Feedback</div><div class="v gold">${fb.yes + fb.no ? fbPct + "%" : "&mdash;"}</div><div class="m">${fb.yes} &#128077; · ${fb.no} &#128078;</div></div>
    </div>

    <div class="panel">
      <h2>Email engagement · opens &amp; clicks</h2>
      ${eng ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="card"><div class="k">Open rate</div><div class="v accent">${eng.d30.open}%</div><div class="m">${eng.d7.open}% last 7d &middot; 30-day avg</div></div>
        <div class="card"><div class="k">Click rate</div><div class="v green">${eng.d30.click}%</div><div class="m">${eng.d7.click}% last 7d &middot; 30-day avg</div></div>
        <div class="card"><div class="k">Delivered</div><div class="v">${eng.d30.delivered.toLocaleString()}</div><div class="m">emails &middot; last 30 days</div></div>
      </div><div style="margin-top:12px;color:#7a7e8a;font-size:12px">Across all sends. Click rate is the more reliable signal &mdash; Apple Mail privacy inflates open rate.</div>`
      : `<div class="empty">Brevo engagement stats unavailable right now.</div>`}
    </div>

    <div class="panel">
      <h2>Subscriber growth · last 30 days</h2>
      ${growthChart(d.daily || [])}
      <div class="legend"><span><i style="background:#2563eb"></i>Total subscribers (cumulative)</span><span><i style="background:#2563eb;opacity:.16"></i>New signups / day</span></div>
    </div>

    <div class="grid2">
      <div class="panel"><h2>Subscribers by timezone wave</h2>${barRows(waveRows, "nm")}</div>
      <div class="panel"><h2>Where subscribers come from</h2>${barRows((d.regions || []).map((r) => ({ nm: r.label, n: r.n })), "nm")}</div>
    </div>

    <div class="panel">
      <h2>Companies &amp; email domains</h2>
      <div class="legend" style="margin-top:-2px;margin-bottom:14px;">
        <span><i style="background:#2563eb"></i><strong>${companyN}</strong>&nbsp;from companies (${companyOrgs} orgs)</span>
        <span><i style="background:#7a7e8a"></i><strong>${personalN}</strong>&nbsp;personal (Gmail, Apple, Outlook&hellip;)</span>
      </div>
      ${barRows(domainRows, "label")}
    </div>

    <div class="panel">
      <h2>Reader feedback · "was this useful?"</h2>
      <div class="fb">
        <div><div class="big" style="color:#059669">${fb.yes} &#128077;</div></div>
        <div><div class="big" style="color:#c0392b">${fb.no} &#128078;</div></div>
        <div style="flex:1;color:#7a7e8a;font-size:13.5px">${fb.yes + fb.no ? `${fbPct}% positive across ${fb.yes + fb.no} rating${fb.yes + fb.no === 1 ? "" : "s"}. ${fb.up30 + fb.down30} in the last 30 days.` : "No ratings yet."}</div>
      </div>
    </div>
  </div>`;

  return new Response(HEAD("Growth · The Atomic Five") + NAV + `<span class="stamp">Updated ${esc(d.generated_at)}</span></div></nav>` + body + `<footer>Private dashboard · aggregates only, no personal data</footer></body></html>`, { headers: noStore });
}
