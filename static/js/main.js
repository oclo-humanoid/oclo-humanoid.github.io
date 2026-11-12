// OCLO project page: lays out window.OCLO (content.js) with window.OCLOShared (shared.js). All text comes from content.js.
(() => {
  "use strict";
  const O = window.OCLO, S = window.OCLOShared;
  const ROOT = document.documentElement.dataset.root || "";
  const R = (p) => ROOT + p;
  const esc = S.esc;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isExt = (u) => /^https?:/.test(u || "");
  const tgt = (u) => (isExt(u) ? ' target="_blank" rel="noopener"' : "");
  const clip = (src, poster, label) => S.clip(R(src), R(poster), label);
  const pad = (n) => String(n).padStart(2, "0");

  // Section order, nav names and numbers.
  const NAV = [
    ["abstract", "Abstract"], ["idea", "Idea"], ["method", "Method"],
    ["simulation", "Simulation"], ["hardware", "Hardware"], ["tasks", "Tasks"], ["teleop", "Teleop"],
    ["agentic", "Agentic"], ["citation", "BibTeX"],
  ].filter(([id]) => id !== "citation" || O.bibtex);   // no BibTeX while anonymous
  const num = (id) => pad(NAV.findIndex((n) => n[0] === id) + 1);

  // ---------- small builders ----------
  function linkBtn(l, extra = "") {
    const inner = `<i class="${l.icon}" aria-hidden="true"></i><span>${esc(l.label)}</span>`;
    if (l.disabled || !l.url) {
      return `<span class="btn is-disabled ${extra}" aria-disabled="true" title="${esc(l.title || "")}">${inner}</span>`;
    }
    return `<a class="btn ${extra}" href="${l.url}"${tgt(l.url)}>${inner}</a>`;
  }

  function badgeHTML(b) {
    return `<${b.url ? "a" : "span"} class="badge badge-${b.kind}"${b.url ? ` href="${b.url}" target="_blank" rel="noopener"` : ""} title="${esc(b.label)}: ${esc(b.venue)}">` +
      `<i class="${b.icon}" aria-hidden="true"></i><span class="badge-label">${esc(b.label)}</span>` +
      `<span class="badge-sep" aria-hidden="true"></span><span class="badge-venue">${esc(b.short)}</span></${b.url ? "a" : "span"}>`;
  }

  function secHead(id, { title, lead, center = false, after = "" } = {}) {
    const label = NAV.find((n) => n[0] === id)[1];
    return `<div class="sec-head${center ? " center" : ""} reveal">
      <p class="eyebrow"><span class="eb-num">${num(id)}</span><span class="eb-line" aria-hidden="true"></span>${title ? `<span>${label}</span>` : ""}</p>
      <h2 class="h2">${title || label}</h2>${after}
      ${lead ? `<p class="lead">${lead}</p>` : ""}
    </div>`;
  }

  const lightImg = (src, alt, cls = "") =>
    `<div class="panel-light ${cls}"><img src="${R(src)}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`;

  // ---------- header / hero ----------
  function renderHero() {
    const m = O.meta;
    document.getElementById("heroInner").innerHTML = `
      <div class="badges" aria-label="Recognition">${O.badges.map(badgeHTML).join("")}</div>
      <h1 class="hero-title"><span class="t1">${m.titleParts[0]}</span> <span class="t2">${m.titleParts[1]}</span></h1>
      <p class="acronym"><span class="acro-mark">${m.acronym}</span><span class="acro-full">${m.acronymHTML}</span></p>
      <div class="hero-links">${O.links.map((l, i) => linkBtn(l, i === 0 ? "btn-primary" : "")).join("")}</div>`;

    const hv = document.getElementById("heroVideo");
    hv.muted = true;
    hv.poster = R(O.media.hero.poster);
    hv.setAttribute("aria-label", O.media.hero.alt);
    if (reduce) hv.removeAttribute("autoplay");
    hv.src = R(O.media.hero.src);

    const btn = document.getElementById("heroToggle");
    let userPaused = reduce;
    const sync = () => {
      const paused = hv.paused;
      btn.innerHTML = `<i class="fa-solid ${paused ? "fa-play" : "fa-pause"}" aria-hidden="true"></i>`;
      btn.setAttribute("aria-label", paused ? "Play background video" : "Pause background video");
    };
    hv.addEventListener("play", sync);
    hv.addEventListener("pause", sync);
    btn.addEventListener("click", () => {
      if (hv.paused) { userPaused = false; const p = hv.play(); if (p && p.catch) p.catch(() => {}); }
      else { userPaused = true; hv.pause(); }
    });
    if (reduce) hv.pause();
    sync();
    // Pause the montage while the hero is off screen.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) { if (!hv.paused) hv.pause(); }
        else if (!userPaused && hv.paused) { const p = hv.play(); if (p && p.catch) p.catch(() => {}); }
      }, { threshold: 0.05 }).observe(document.getElementById("top"));
    }
  }

  function renderNav() {
    document.getElementById("navlinks").innerHTML =
      NAV.map(([id, name]) => `<a href="#${id}" data-nav="${id}">${name}</a>`).join("");
    const arx = O.links.find((l) => isExt(l.url) && !l.disabled);
    const marks = O.badges.map((b) =>
      `<${b.url ? "a" : "span"} class="mark mark-${b.kind}"${b.url ? ` href="${b.url}" target="_blank" rel="noopener"` : ""} title="${esc(b.label)}: ${esc(b.venue)}"><i class="${b.icon}" aria-hidden="true"></i><span class="sr">${esc(b.label)}</span></${b.url ? "a" : "span"}>`).join("");
    document.getElementById("navcta").innerHTML = `<span class="marks">${marks}</span>${arx ? linkBtn(arx, "btn-sm btn-primary") : ""}`;
  }

  // ---------- main sections ----------
  function intro() {
    const m = O.meta;
    const rec = O.badges.map((b) =>
      `<li class="rec rec-${b.kind}"><i class="${b.icon}" aria-hidden="true"></i><span>${b.url ? `<a href="${b.url}" target="_blank" rel="noopener"><strong>${esc(b.label)}</strong></a>` : `<strong>${esc(b.label)}</strong>`} · ${esc(b.venue)}</span></li>`).join("");
    return `
    <section class="intro" id="intro">
      <div class="wrap">
        <div class="credits reveal">
          <p class="authors">${S.authorsHTML(" ")}</p>
          ${O.affiliation ? `<p class="affil"><span><i class="fa-solid fa-building-columns" aria-hidden="true"></i> ${O.affiliation}</span><span class="eqnote"><sup>*</sup> ${O.equalNote}</span></p>` : ""}
          <ul class="recognition">${rec}</ul>
        </div>
        <div class="statement reveal">
          <p class="tagline">${m.tagline}</p>
          <p class="tldr"><span class="tldr-tag">TL;DR</span>${m.tldr}</p>
        </div>
      </div>
    </section>`;
  }

  function highlights() {
    return `
    <section class="highlights" id="highlights" aria-label="Highlights">
      <div class="wrap">
        <div class="stats">${O.highlights.map((h, i) => `
          <div class="stat reveal" style="--d:${i * 90}ms">
            <div class="stat-value"><span class="sr">${esc(h.value)}</span><span class="count" data-count="${esc(h.value)}" aria-hidden="true">${esc(h.value)}</span></div>
            <div class="stat-label">${h.label}</div>
            <div class="stat-vs">${h.vs}</div>
          </div>`).join("")}
        </div>
      </div>
    </section>`;
  }

  function abstract() {
    return `
    <section class="section" id="abstract">
      <div class="wrap abstract-grid">
        ${secHead("abstract")}
        <div class="abstract-text glass reveal"><p>${O.abstract}</p></div>
      </div>
    </section>`;
  }

  function idea() {
    return `
    <section class="section" id="idea">
      <div class="glow glow-teal" aria-hidden="true"></div>
      <div class="wrap">
        ${secHead("idea")}
        <div class="idea-grid">${O.idea.map((c, i) => `
          <article class="card idea-card idea-${i} reveal" style="--d:${i * 90}ms">
            ${lightImg(c.img, c.alt)}
            <div class="card-body">
              <span class="card-num">${pad(i + 1)}</span>
              <h3>${c.title}</h3>
              <p>${c.text}</p>
            </div>
          </article>`).join("")}
        </div>
        <div class="takehomes">${O.takehomes.map((t) => `
          <div class="takehome reveal"><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i><p><strong>${t.head}</strong> ${t.text}</p></div>`).join("")}
        </div>
      </div>
    </section>`;
  }

  function clipCard(c, cls) {
    return `<figure class="clip-card${c.wide ? " wide" : ""} reveal">
      <div class="vid ${cls}">${clip(c.src, c.poster, c.head)}</div>
      <figcaption><strong>${c.head}</strong> ${c.text}</figcaption>
    </figure>`;
  }

  function clipset(set, cls, gridCls, icon) {
    return `<div class="clipset">
      <h3 class="clipset-title"><i class="${icon}" aria-hidden="true"></i>${set.title}</h3>
      <div class="clip-grid ${gridCls}">${set.clips.map((c) => clipCard(c, cls)).join("")}</div>
    </div>`;
  }

  function step(st, i) {
    const head = `<div class="step-head">
        <span class="step-index">${pad(i + 1)}</span>
        <div><h3 class="step-title">${st.title}</h3>
        <p class="human"><i class="fa-solid fa-person" aria-hidden="true"></i><span>${st.human}</span></p></div>
      </div>`;
    const lead = st.lead ? `<p class="step-lead">${st.lead}</p>` : "";
    const text = `<p class="step-text">${st.text}</p>`;
    const eq = st.eq ? `<div class="eq">\\[${st.eq}\\]</div>` : "";
    const note = st.note ? `<p class="step-note">${st.note}</p>` : "";
    const stat = st.stat ? `<div class="step-stat"><span class="step-stat-v">${st.stat.value}</span><span class="step-stat-l">${st.stat.label}</span></div>` : "";

    if (st.stages || st.wide) {
      const media = st.stages
        ? `<div class="stages">${st.stages.map((g, k) => `
            <figure class="stage">${lightImg(g.img, g.alt, "sq")}<figcaption><span>${pad(k + 1)}</span>${g.label}</figcaption></figure>`).join("")}</div>`
        : lightImg(st.img, st.alt, "wide-panel");
      const side = note || stat ? `<div class="step-side">${note}${stat}</div>` : "";
      return `<article class="step stacked glass reveal">
        ${head}
        <div class="step-media">${media}</div>
        <div class="step-body${side ? " two" : ""}"><div>${lead}${text}</div>${side}</div>
        ${eq}
      </article>`;
    }
    return `<article class="step split${i % 2 ? "" : " flip"} glass reveal">
      <div class="step-copy">${head}${lead}${text}${eq}${note}${stat}</div>
      <div class="step-media">${lightImg(st.img, st.alt)}</div>
    </article>`;
  }

  function method() {
    const parts = O.steps.map((st, i) => {
      let s = step(st, i);
      if (i === 0) s += clipset(O.trainingClips, "sq", "three", "fa-solid fa-dumbbell");
      if (i === O.steps.length - 1) s += clipset(O.postureClips, "wide", "two", "fa-solid fa-person-walking");
      return s;
    }).join("");
    return `
    <section class="section" id="method">
      <div class="glow glow-coral" aria-hidden="true"></div>
      <div class="wrap">
        ${secHead("method", { lead: O.methodIntro })}
        <div class="steps">${parts}</div>
      </div>
    </section>`;
  }

  function simulation() {
    const s = O.sim, c = s.cemStat;
    return `
    <section class="section" id="simulation">
      <div class="wrap">
        ${secHead("simulation", { title: s.title, lead: s.lead })}
        <div class="chart-card glass reveal">
          <div class="legend">${S.simLegendHTML()}</div>
          <div class="chart-scroll"><div id="simChart"></div></div>
          <p class="chart-hint"><i class="fa-solid fa-arrows-left-right" aria-hidden="true"></i> Swipe to see all five tasks</p>
        </div>
        <div class="sim-below">
          <div class="cem-card glass reveal">
            <p class="mini-label">${c.label}</p>
            <div class="cem-nums"><span class="from">${c.from}</span><i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i><span class="to">${c.to}</span></div>
            <p class="cem-text">${c.text}</p>
            <p class="cem-note">${c.note}</p>
          </div>
          <div class="sim-notes reveal">
            <p class="note">${s.note}</p>
            <details class="disclosure">
              <summary><i class="fa-solid fa-table" aria-hidden="true"></i> Show the table <i class="fa-solid fa-chevron-down chev" aria-hidden="true"></i></summary>
              <div class="table-scroll"><table class="data sim-table">${S.simTableHTML()}</table></div>
            </details>
          </div>
        </div>
      </div>
    </section>`;
  }

  function hardware() {
    const H = O.hardware;
    const pairs = H.pairs.map((p, i) => {
      const ok = S.video(p.ok), bad = S.video(p.fail);
      return `<article class="pair glass reveal">
        <h3 class="pair-title"><span class="pair-num">${pad(i + 1)}</span>${p.title}</h3>
        <div class="pair-grid">
          <figure class="pair-clip"><div class="vid wide">${clip(ok.src, ok.poster, `${H.okLabel}: ${p.title}`)}
            <span class="tag tag-ok"><i class="fa-solid fa-check" aria-hidden="true"></i>${H.okLabel}</span></div></figure>
          <figure class="pair-clip"><div class="vid wide">${clip(bad.src, bad.poster, `${H.failLabel}: ${p.title}`)}
            <span class="tag tag-fail"><i class="fa-solid fa-xmark" aria-hidden="true"></i>${H.failLabel}</span></div></figure>
        </div>
      </article>`;
    }).join("");

    const cols = H.columns;
    const summary = `<table class="hw-table">
      <thead><tr><th scope="col" class="rowhead">Disturbance</th>${cols.map((c) =>
        `<th scope="col"${c.ours ? ' class="ours"' : ""}><span class="col-name">${c.name}</span><span class="col-sub">Trained: ${c.trained}</span></th>`).join("")}</tr></thead>
      <tbody>${H.groups.map((g) => `
        <tr class="group"><th colspan="${cols.length + 1}" scope="colgroup">${g.name}</th></tr>
        ${g.rows.map((r) => `<tr><th scope="row">${r.name}</th>${r.v.map((v, j) =>
          `<td${cols[j].ours ? ' class="ours"' : ""}><span class="score">${v}<small>/10</small></span><span class="meter" aria-hidden="true"><i style="width:${v * 10}%"></i></span></td>`).join("")}</tr>`).join("")}`).join("")}
      </tbody></table>`;

    const F = H.fullTable;
    const full = `<table class="data full-table">
      <thead><tr>${F.head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead>
      <tbody>${F.rows.map((r) => `<tr${r.ours ? ' class="ours"' : ""}><td>${r.name}</td>${r.v.map((v) => `<td>${v}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>`;

    return `
    <section class="section" id="hardware">
      <div class="glow glow-teal right" aria-hidden="true"></div>
      <div class="wrap">
        ${secHead("hardware", { title: H.title, lead: H.lead })}
        <div class="pairs">${pairs}</div>
        <p class="note fail-note"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> ${H.failNote}</p>
        <div class="hw-summary glass reveal"><div class="table-scroll">${summary}</div></div>
        <details class="disclosure">
          <summary><i class="fa-solid fa-table" aria-hidden="true"></i> Full hardware table <i class="fa-solid fa-chevron-down chev" aria-hidden="true"></i></summary>
          <div class="table-scroll">${full}</div>
          <p class="note">${F.note}</p>
        </details>
      </div>
    </section>`;
  }

  function tasks() {
    const T = O.tasks;
    return `
    <section class="section" id="tasks">
      <div class="wrap">
        ${secHead("tasks", { title: T.title, lead: T.lead })}
        ${T.groups.map((g, gi) => `
        <div class="task-group reveal">
          <div class="task-group-head"><span class="tg-num">${pad(gi + 1)}</span><h3>${g.name}</h3><p>${g.desc}</p></div>
          <div class="task-row">${g.items.map((it) => {
            const v = S.video(it.file);
            return `<article class="task-tile">
              <div class="vid wide">${clip(v.src, v.poster, it.name)}<span class="chip speed" title="Playback speed">${it.speed}</span></div>
              <div class="task-meta"><h4>${it.name}</h4><p>${it.desc}</p></div>
            </article>`;
          }).join("")}</div>
        </div>`).join("")}
      </div>
    </section>`;
  }

  function teleop() {
    const T = O.teleop;
    return `
    <section class="section" id="teleop">
      <div class="wrap">
        ${secHead("teleop", { title: T.title, lead: T.lead })}
        <div class="teleop-row reveal">${T.clips.map((n, i) => {
          const v = S.video(n);
          return `<div class="vid teleop">${clip(v.src, v.poster, `${T.title}, clip ${i + 1}`)}</div>`;
        }).join("")}</div>
      </div>
    </section>`;
  }

  function agentic() {
    const A = O.agentic;
    const head = `<div class="ag-corner" aria-hidden="true"></div>` + A.tasks.map((t, j) =>
      `<div class="ag-colhead"><span>${t}</span>${A.expert ? `<small>Scripted expert ${A.expert[j]} / 30</small>` : ""}</div>`).join("");
    const rows = A.rows.map((r) => `
      <div class="ag-rowhead ag-${r.id}">
        <span class="ag-kind">${r.id.toUpperCase()}</span>
        <h3>${r.name}</h3>
        <p class="ag-model"><i class="fa-solid fa-microchip" aria-hidden="true"></i>${r.model}</p>
        <p class="ag-desc">${r.desc}</p>
      </div>
      ${A.keys.map((k, j) => `
      <figure class="ag-cell">
        <div class="vid ag">${clip(`static/videos/agentic/${r.id}_${k}.mp4`, `static/images/posters/agentic/${r.id}_${k}.jpg`, `${r.name}: ${A.tasks[j]}`)}
          <span class="ag-score${r.success[j] === 30 ? " full" : ""}">${r.success[j]} / 30</span></div>
        <figcaption class="ag-cap">${A.tasks[j]}</figcaption>
      </figure>`).join("")}`).join("");
    return `
    <section class="section" id="agentic">
      <div class="glow glow-coral right" aria-hidden="true"></div>
      <div class="wrap">
        ${secHead("agentic", { title: A.title, after: `<p class="pill-note"><i class="fa-solid fa-flask" aria-hidden="true"></i>${A.badge}</p>`, lead: A.lead })}
        <div class="ag-grid glass reveal">${head}${rows}</div>
        <p class="note">${A.note}</p>
      </div>
    </section>`;
  }

  function citation() {
    if (!O.bibtex) return "";
    return `
    <section class="section" id="citation">
      <div class="wrap">
        ${secHead("citation")}
        <div class="bib glass reveal">
          <button class="copy-btn" type="button" data-copy-target="#bibtex"><i class="fa-regular fa-copy" aria-hidden="true"></i> Copy</button>
          <pre id="bibtex">${esc(O.bibtex)}</pre>
        </div>
      </div>
    </section>`;
  }

  function footer() {
    document.getElementById("footer").innerHTML = `<div class="wrap foot">
      <span class="foot-text">${O.footer}</span>
      <a href="#top" class="foot-top">Back to top <i class="fa-solid fa-arrow-up" aria-hidden="true"></i></a></div>`;
  }

  // ---------- behavior ----------
  function setupChart() {
    const host = document.getElementById("simChart");
    const mq = window.matchMedia("(max-width: 720px)");
    const draw = () => S.simChart(host, mq.matches
      ? { labels: "none", width: 680, height: 380, rx: 2 }
      : { labels: "ours", width: 1000, height: 400, rx: 3 });
    draw();
    if (mq.addEventListener) mq.addEventListener("change", draw);
  }

  function setupReveal() {
    const els = Array.from(document.querySelectorAll(".reveal"));
    if (reduce || !("IntersectionObserver" in window)) return; // everything stays visible
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add("in"); else io.observe(el);
    });
    document.documentElement.classList.add("reveal-on");
    const all = () => els.forEach((el) => el.classList.add("in"));
    window.addEventListener("beforeprint", all);
    // Anything above the viewport after a jump (anchor link, restored scroll) is shown at once.
    window.addEventListener("scroll", () => {
      els.forEach((el) => { if (!el.classList.contains("in") && el.getBoundingClientRect().bottom < 0) el.classList.add("in"); });
    }, { passive: true });
  }

  function countUp(el) {
    const final = el.dataset.count;
    const m = final.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    const pre = m[1], numStr = m[2], post = m[3], target = parseFloat(numStr);
    if (!target) return;
    const dec = (numStr.split(".")[1] || "").length, dur = 1500;
    let t0 = null, done = false;
    const fmt = (x) => pre + x.toFixed(dec) + post;
    const tick = (t) => {
      if (done) return;
      if (t0 === null) t0 = t;
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * e);
      if (p < 1) requestAnimationFrame(tick); else { done = true; el.textContent = final; }
    };
    el.textContent = fmt(0);
    requestAnimationFrame(tick);
    setTimeout(() => { done = true; el.textContent = final; }, dur + 500);
  }

  function setupCounts() {
    const els = Array.from(document.querySelectorAll(".count[data-count]"));
    if (reduce || !("IntersectionObserver" in window)) return; // final values are already in the markup
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); countUp(e.target); }
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  function setupNav() {
    const nav = document.getElementById("topnav"), hero = document.getElementById("top");
    const links = document.getElementById("navlinks");
    let ticking = false;
    const update = () => { ticking = false; nav.classList.toggle("show", window.scrollY > hero.offsetHeight - 80); };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    if (!("IntersectionObserver" in window)) return;
    const byId = {};
    links.querySelectorAll("a[data-nav]").forEach((a) => { byId[a.dataset.nav] = a; });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const a = byId[e.target.id];
        if (!a) continue;
        links.querySelectorAll("a.active").forEach((x) => x.classList.remove("active"));
        a.classList.add("active");
        const left = a.offsetLeft - links.clientWidth / 2 + a.offsetWidth / 2;
        if (links.scrollWidth > links.clientWidth) links.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
      }
    }, { rootMargin: "-42% 0px -55% 0px" });
    NAV.forEach(([id]) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // ---------- go ----------
  document.title = `${O.meta.acronym}: ${O.meta.title}`;
  renderHero();
  renderNav();
  document.getElementById("main").innerHTML = [
    intro(), highlights(), abstract(), idea(), method(), simulation(),
    hardware(), tasks(), teleop(), agentic(), citation(),
  ].join("");
  footer();
  setupChart();
  S.init();
  setupReveal();
  setupCounts();
  setupNav();
})();
