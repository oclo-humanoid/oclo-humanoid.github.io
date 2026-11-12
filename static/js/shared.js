// Shared page behavior (video, math, copy, chart). Reads window.OCLO (content.js); main.js calls these.
window.OCLOShared = (() => {
  const C = () => window.OCLO;

  // ---------- small HTML helpers ----------
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function authorsHTML(sep = ", ") {
    return C().authors.map((a) => {
      const name = a.url ? `<a href="${a.url}" target="_blank" rel="noopener">${a.name}</a>` : a.name;
      const marks = [...(a.aff || []), ...(a.equal ? ["*"] : [])].join(",");
      return `<span class="author">${name}${marks ? `<sup>${marks}</sup>` : ""}</span>`;
    }).join(sep);
  }

  // A looping clip that only loads and plays while on screen (see lazyVideos).
  function clip(src, poster, label = "") {
    return `<video data-src="${src}" poster="${poster}" muted loop playsinline preload="none" aria-label="${esc(label)}"></video>`;
  }
  const video = (name) => ({ src: `static/videos/${name}.mp4`, poster: `static/images/posters/${name}.jpg` });

  // ---------- lazy autoplay ----------
  function lazyVideos(root = document) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vids = Array.from(root.querySelectorAll("video[data-src]"));
    const load = (v) => { if (!v.getAttribute("src")) { v.src = v.dataset.src; v.load(); } };
    if (reduce || !("IntersectionObserver" in window)) {
      vids.forEach((v) => { v.controls = true; v.preload = "metadata"; load(v); });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) { load(v); const p = v.play(); if (p && p.catch) p.catch(() => { v.controls = true; }); }
        else if (!v.paused) v.pause();
      }
    }, { rootMargin: "200px 0px", threshold: 0.2 });
    vids.forEach((v) => { io.observe(v); v.addEventListener("click", () => (v.paused ? v.play() : v.pause())); });
  }

  // ---------- math ----------
  function renderMath(root = document.body) {
    if (window.renderMathInElement) {
      window.renderMathInElement(root, {
        delimiters: [{ left: "\\[", right: "\\]", display: true }, { left: "\\(", right: "\\)", display: false }],
        throwOnError: false,
      });
    }
  }

  // ---------- BibTeX copy: any [data-copy-target="#id"] button ----------
  function copyButtons(root = document) {
    root.querySelectorAll("[data-copy-target]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const el = document.querySelector(btn.dataset.copyTarget);
        if (!el) return;
        const old = btn.innerHTML;
        try { await navigator.clipboard.writeText(el.textContent); btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied'; }
        catch (e) { btn.innerHTML = "Select and copy"; }
        setTimeout(() => { btn.innerHTML = old; }, 1600);
      });
    });
  }

  // ---------- simulation chart (paper Table I) ----------
  // Grouped bars, five tasks x seven methods. Styled through CSS classes:
  //   .oclo-chart svg, .oclo-grid, .oclo-axis, .oclo-task, .oclo-val, .oclo-bar, .oclo-tip
  // opts: { labels: "ours" | "all" | "none", width, height, rx }
  function simChart(host, opts = {}) {
    const S = C().sim;
    const o = Object.assign({ labels: "ours", width: 1000, height: 400, rx: 2 }, opts);
    host.classList.add("oclo-chart");
    host.style.position = host.style.position || "relative";
    const W = o.width, H = o.height, m = { l: 40, r: 6, t: 24, b: 38 };
    const pw = W - m.l - m.r, ph = H - m.t - m.b;
    const nT = S.tasks.length, nS = S.series.length, gw = pw / nT, inner = gw * 0.86, bw = inner / nS;
    const y = (v) => m.t + ph * (1 - v / 100);
    let s = "";
    for (const g of [0, 25, 50, 75, 100]) {
      s += `<line class="oclo-grid" x1="${m.l}" x2="${W - m.r}" y1="${y(g)}" y2="${y(g)}"/>` +
           `<text class="oclo-axis" x="${m.l - 8}" y="${y(g) + 4}" text-anchor="end">${g}</text>`;
    }
    S.tasks.forEach((task, ti) => {
      const x0 = m.l + ti * gw + (gw - inner) / 2;
      S.series.forEach((se, si) => {
        const v = se.v[ti], x = x0 + si * bw;
        s += `<rect class="oclo-bar${se.ours ? " ours" : ""}" x="${x + 1}" y="${y(v)}" width="${bw - 2}" height="${y(0) - y(v)}" rx="${o.rx}" fill="${se.color}" data-tip="${esc(se.name)} · ${esc(task.replace("†", ""))}: ${v.toFixed(1)}%"><title>${esc(se.name)}, ${esc(task)}: ${v.toFixed(1)}%</title></rect>`;
        if (o.labels === "all" || (o.labels === "ours" && se.ours)) {
          s += `<text class="oclo-val${se.ours ? " ours" : ""}" x="${x + bw / 2}" y="${y(v) - 5}" text-anchor="middle">${v.toFixed(1)}</text>`;
        }
      });
      s += `<text class="oclo-task" x="${m.l + ti * gw + gw / 2}" y="${H - 11}" text-anchor="middle">${esc(task)}</text>`;
    });
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grouped bar chart of simulation success for seven methods on five tasks">${s}</svg><div class="oclo-tip" hidden></div>`;
    const svg = host.querySelector("svg"), tip = host.querySelector(".oclo-tip");
    svg.addEventListener("mousemove", (e) => {
      const b = e.target.closest(".oclo-bar");
      if (!b) { tip.hidden = true; return; }
      const r = host.getBoundingClientRect();
      tip.textContent = b.dataset.tip;
      tip.style.left = `${e.clientX - r.left + 12}px`;
      tip.style.top = `${e.clientY - r.top - 34}px`;
      tip.hidden = false;
    });
    svg.addEventListener("mouseleave", () => { tip.hidden = true; });
  }

  function simLegendHTML() {
    return C().sim.series.map((se) =>
      `<span class="oclo-key${se.ours ? " ours" : ""}"><i style="background:${se.color}"></i>${se.name}</span>`).join("");
  }

  function simTableHTML() {
    const S = C().sim;
    let t = `<thead><tr><th>Method</th>${S.tasks.map((k) => `<th>${k}</th>`).join("")}</tr></thead><tbody>`;
    for (const se of S.series) t += `<tr${se.ours ? ' class="ours"' : ""}><td>${se.name}</td>${se.v.map((v) => `<td>${v.toFixed(1)}</td>`).join("")}</tr>`;
    return t + "</tbody>";
  }

  // Call once after a design has inserted its HTML.
  function init(root = document) { renderMath(document.body); copyButtons(root); lazyVideos(root); }

  return { authorsHTML, clip, video, lazyVideos, renderMath, copyButtons, simChart, simLegendHTML, simTableHTML, init, esc };
})();
