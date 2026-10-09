// OCLO project page: builds the task grid and plays each looping clip only while it is on screen.

// Edit task names, speeds, and one-line descriptions here.
const TASKS = [
  { file: "task_escalator",  name: "Escalator-like motion",      speed: "1x", desc: "Walking while crouched." },
  { file: "task_curtain",    name: "Curtain opening",            speed: "2x", desc: "Lateral stepping with the hand holding the curtain." },
  { file: "task_table_wipe", name: "Sink cleaning",              speed: "2x", desc: "Wiping in contact with the surface." },
  { file: "task_chair_push", name: "Chair pushing",              speed: "1x", desc: "Walking forward under a sustained pushing force." },
  { file: "task_cart_pull",  name: "Cart pulling",               speed: "2x", desc: "Walking backward under a sustained pulling force." },
  { file: "task_draw_wipe",  name: "Drawing and wiping",         speed: "3x", desc: "Hand tracking over the full height of a board." },
  { file: "task_box",        name: "Box pick-and-place",         speed: "3x", desc: "Picking a box from a low surface, turning, and placing it." },
  { file: "task_doll",       name: "Doll picking",               speed: "2x", desc: "Crouching to pick up a doll from the floor." },
  { file: "task_insert",     name: "Block insertion",            speed: "3x", desc: "Inserting a block into a holder." },
];

function buildTaskGrid() {
  const grid = document.getElementById("task-grid");
  if (!grid) return;
  for (const t of TASKS) {
    const fig = document.createElement("figure");
    fig.className = "clip";
    fig.innerHTML = `
      <video data-src="static/videos/${t.file}.mp4" poster="static/images/posters/${t.file}.jpg"
             muted loop playsinline preload="none" aria-label="${t.name}, played at ${t.speed}"></video>
      <div class="tile-head">
        <span class="tile-name">${t.name}</span>
        <span class="speed" title="Playback speed">${t.speed}</span>
      </div>
      <p class="tile-desc">${t.desc}</p>`;
    grid.appendChild(fig);
  }
}

function setupLazyVideos() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const videos = Array.from(document.querySelectorAll("video[data-src]"));

  const load = (v) => {
    if (!v.src) { v.src = v.dataset.src; v.load(); }
  };

  if (reduceMotion || !("IntersectionObserver" in window)) {
    // No autoplay: give every clip controls and let the viewer start it.
    videos.forEach((v) => { v.controls = true; v.preload = "metadata"; load(v); });
    const hero = document.querySelector(".teaser-video");
    if (hero && reduceMotion) { hero.removeAttribute("autoplay"); hero.pause(); hero.controls = true; }
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting) {
        load(v);
        const p = v.play();
        if (p && p.catch) p.catch(() => { v.controls = true; });
      } else if (!v.paused) {
        v.pause();
      }
    }
  }, { rootMargin: "150px 0px", threshold: 0.25 });

  videos.forEach((v) => io.observe(v));

  // Clicking a clip toggles play/pause, so a viewer can stop one to study it.
  videos.forEach((v) => v.addEventListener("click", () => (v.paused ? v.play() : v.pause())));
}

document.addEventListener("DOMContentLoaded", () => {
  buildTaskGrid();
  setupLazyVideos();
});
