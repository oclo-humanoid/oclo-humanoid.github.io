// OCLO project page: every word, number, link and media path in one place.
// main.js only lays this out. Numbers: paper Table I/II (camera-ready), VLM/VLA counts recounted from episodes.json.
window.OCLO = {
  meta: {
    title: "Dataset-Free Compliant Humanoid Loco-Manipulation with Dynamic Online Posture",
    titleParts: ["Dataset-Free Compliant Humanoid Loco-Manipulation", "with Dynamic Online Posture"],
    acronym: "OCLO",
    acronymHTML: "<u>O</u>nline-posture <u>C</u>ompliant <u>LO</u>co-manipulation",
    tagline: "Two hand targets in. The body works out its posture, balance and compliance.",
    tldr: "OCLO drives a Unitree G1 from two hand targets and a walking command, with no posture command. It is trained with no human motion data, generates its own pelvis height and torso lean online, and yields to forces on its hands instead of falling over.",
  },
  // Anonymous for now: no names, affiliations or BibTeX until the authors are listed.
  authors: [{ name: "Anonymous Authors" }],
  affiliation: "",
  equalNote: "",
  // Recognition badges shown under the title. kind: "oral" (talk) | "award".
  badges: [
    { kind: "oral", icon: "fa-solid fa-microphone-lines", label: "Spotlight",
      venue: "CoRL 2026 Workshop on Open Problems in Contact-Rich Loco-Manipulation",
      short: "CoRL 2026 Workshop", url: "https://contact-rich-loco-manipulation.github.io/program/index.html" },
    { kind: "award", icon: "fa-solid fa-trophy", label: "Best Paper Award",
      venue: "IROS 2026 Workshop on Bridging Learning and Physics for Robust Whole-Body Robot Control",
      short: "IROS 2026 Workshop", url: "https://sites.google.com/view/iros2026ws-wbc/home" },
  ],
  links: [
    { label: "arXiv", icon: "fa-solid fa-file-lines", url: "https://arxiv.org/abs/2610.05678" },
    { label: "Code (coming soon)", icon: "fa-brands fa-github", disabled: true, title: "Code will be released later" },
  ],
  media: {
    hero: { src: "static/videos/hero_montage.mp4", poster: "static/images/posters/hero_montage.jpg",
            alt: "Montage of OCLO performing nine loco-manipulation tasks on a Unitree G1" },
  },
  abstract: "Most humanoid loco-manipulation controllers require human motion data to learn whole-body coordination and posture, leaving policies reliant on external sources to provide this data. We present <strong>OCLO (Online-posture Compliant LOco-manipulation)</strong>, a humanoid loco-manipulation system trained without human motion data and commanded only through two end-effector targets and a walking velocity. Because these targets do not uniquely determine whole-body posture, OCLO generates pelvis height and torso orientation online using an analytic reachability prior, further refined through policy-in-the-loop sampling with a task-agnostic cost. OCLO also learns whole-body compliance by displacing end-effector references according to measured forces through a spring-damper model, encouraging the legs, waist, and pelvis to yield to external loads. In simulation, using the reachability prior leads to a 77.8% success rate in acquiring the commanded reference, a vast improvement over the 37.8% success rate accomplished without the prior. Further, refinement reduces end-effector orientation error across all evaluated tasks. The same posture module improves a pretrained SONIC controller on all five tasks. Without compliance training, policies tend to lose balance under disturbances rather than sacrifice tracking. On a Unitree G1, OCLO maintains balance under end-effector disturbances that cause its ablations to fail and performs nine loco-manipulation tasks, including crouched walking and picking up a box from a low surface.",   // arXiv v5 source (oclo_arxiv_v5/oclo_arxiv_revised_v5.tex)
  highlights: [   // short stat strip; every number is from the paper
    { value: "82.2%", label: "simulated tracking success with the prior", vs: "15.6% at a fixed posture" },
    { value: "10/10", label: "hand pulls held on the real G1", vs: "5/10 trained without hand forces" },
    { value: "0", label: "hours of human motion data", vs: "trained only on sampled commands" },
    { value: "9", label: "real tasks from two hand targets", vs: "teleoperated, no posture command" },
  ],
  idea: [
    { title: "Every source gives the hands", img: "static/images/explain/sources.gif",
      alt: "Four command sources (VR teleoperation, a planner, a script or policy, an agentic model) each send two hand targets to the robot. The rest of the body is left open.",
      text: "VR teleoperation, planners, scripts, learned policies and agentic models specify different things. Every one of them says where the hands go." },
    { title: "The posture stays open", img: "static/images/explain/loco_posture.gif",
      alt: "The robot picks up, carries and places a box. Pelvis height h and torso lean theta change while the hands stay on the box.",
      text: "Many postures fit the same hands and feet. How low the pelvis sits (\\(h\\)) and how far the torso leans (\\(\\theta\\)) are left open." },
    { title: "So the body sets it, in one loop", img: "static/images/explain/pipeline.gif",
      alt: "Deployment loop: hand targets and walking velocity go in; the prior, with optional CEM, sets h and theta; springs and IK move the arms; the lower-body policy moves the legs and waist; measured hand force feeds back into the springs.",
      text: "Three training stages in simulation, then this loop on the robot. The prior, and CEM when needed, set the posture. IK moves the arms, and the policy keeps the balance." },
  ],
  takehomes: [
    { head: "A decoupled controller can still be compliant.", text: "IK arms on force-trained legs stayed upright, with no motion data." },
    { head: "Two hand targets could be how agentic AI drives a humanoid.", text: "The source picks the contact. The body handles posture and balance." },
  ],
  methodIntro: "Each part of OCLO answers one question by asking how a person handles it.",
  steps: [
    { title: "Practice everything", human: "A person learns balance by practicing many motions.",
      stages: [
        { img: "static/images/explain/stage1.gif", label: "Walk", alt: "Stage 1: the robot walks." },
        { img: "static/images/explain/stage2.gif", label: "Reach under hand forces", alt: "Stage 2: the robot reaches random hand targets while its hands are pushed and pulled." },
        { img: "static/images/explain/stage3.gif", label: "Follow posture commands", alt: "Stage 3: the robot follows pelvis-height and torso-lean commands." },
      ],
      text: "The only learned part is a lower-body policy for the twelve leg and three waist joints at 50&nbsp;Hz, trained with PPO in mjlab on MuJoCo Warp. Every command is sampled procedurally: walking velocity, hand targets with sampled hand loads, then pelvis height and torso lean. No motion capture, retargeted motion, teleoperation or demonstration data is used." },
    { title: "Let the hands give way", human: "Like your arm when someone bumps your cup.",
      img: "static/images/explain/compliance.gif",
      alt: "A person bumped while holding a cup lets the arm give; the robot's hand on a virtual spring is pushed and pulled and returns.",
      lead: "A virtual spring at each hand.",
      text: "The hand gives a little and the legs keep the balance. Each hand tracks a compliant reference \\(x_{\\mathrm{ref}}\\) that a virtual mass&ndash;spring&ndash;damper generates from its command.",
      eq: "m_v\\,\\ddot{x}_{\\mathrm{ref}} = k_p\\,(x_{\\mathrm{cmd}}-x_{\\mathrm{ref}}) + k_d\\,(\\dot{x}_{\\mathrm{rest}}-\\dot{x}_{\\mathrm{ref}}) + \\mathrm{sat}_a(F_{\\mathrm{ext}})",
      note: "Stiffness is drawn from 12 to 24 for each hold, and forces are capped at 40&nbsp;N. The policy observes the stiffness and the measured force. Training pushes and pulls the hands, so the legs, waist and pelvis learn to absorb it." },
    { title: "Bend just enough to reach", human: "You don't plan your hip height. You bend just enough to reach.",
      img: "static/images/explain/prior.gif",
      alt: "A person and the robot both lower the pelvis and lean more as the target moves lower and farther.",
      lead: "An analytic reachability prior.",
      text: "The prior does what a person does, in closed form: lower hands, lower pelvis; farther hands, more lean.",
      eq: "h=\\max\\!\\left(h_0-k_h\\,\\delta,\\;h_{\\min}\\right),\\qquad \\theta=k_\\theta\\,\\delta+k_\\eta\\,\\eta",
      note: "\\(\\delta\\) is how far the lower hand target is below standing reach, and \\(\\eta\\) how far the farther target is ahead. The constants are fitted once and fixed for all tasks. It runs in 0.07&nbsp;ms on a CPU.",
      stat: { value: "0.07 ms", label: "closed form, on a CPU" } },
    { title: "Shift until steady", human: "When a pose feels shaky, you shift until it is steady.",
      img: "static/images/explain/cem.gif", wide: true,
      alt: "A person holding a box shifts to a steadier stance; the robot's candidate postures are rolled out, some fall, and the best is kept.",
      lead: "Optional policy-in-the-loop refinement.",
      text: "The prior only checks reach. Refinement copies the robot's live state into simulations that run in parallel CPU threads, as in Sumo, rolls out the frozen policy under 64 candidate postures for 1&nbsp;s, and replans at 2&nbsp;Hz with the cross-entropy method, starting from the prior.",
      eq: "J(c)=w_f\\,\\mathbb{1}[\\mathrm{fall}]+\\frac{1}{T}\\sum_{t=1}^{T}\\sum_{k\\in\\mathcal{K}} w_k\\,C^{k}_t+w_r\\,\\lVert\\Lambda(c-c_{\\mathrm{prev}})\\rVert^2+w_s\\,\\lVert\\Lambda(c-c_{\\mathrm{prior}})\\rVert^2",
      note: "Each candidate is scored for falls, balance (capture point), hand and posture error, velocity, torque, joint limits, and closeness to the last plan and the prior. No term names an object or a task. On the robot's laptop CPU a replan takes 236&nbsp;ms.",
      stat: { value: "236 ms", label: "per replan on the robot's laptop" } },
  ],
  trainingClips: {
    title: "The three training stages in simulation",
    clips: [
      { src: "static/videos/stage1.mp4", poster: "static/images/posters/stage1.jpg", head: "Stage 1: stand and walk.", text: "Velocity and yaw-rate commands with the arms parked." },
      { src: "static/videos/stage2.mp4", poster: "static/images/posters/stage2.jpg", head: "Stage 2: load and reach.", text: "Sampled hand targets and hand loads through the spring&ndash;damper reference, at the nominal posture." },
      { src: "static/videos/stage3.mp4", poster: "static/images/posters/stage3.jpg", head: "Stage 3: crouch and lean.", text: "Pelvis-height and torso-lean commands down to a deep crouch, including crouch-walking under load." },
    ],
  },
  postureClips: {
    title: "Posture in simulation: prior, prior + CEM, and the CEM candidates",
    clips: [
      { src: "static/videos/deploy_prior.mp4", poster: "static/images/posters/deploy_prior.jpg", head: "OCLO (Prior).", text: "The closed-form prior alone, as used for the real-robot results." },
      { src: "static/videos/deploy_prior_cem.mp4", poster: "static/images/posters/deploy_prior_cem.jpg", head: "OCLO (Prior + CEM).", text: "The prior refined online, which lowers end-effector orientation error." },
      { src: "static/videos/deploy_prior_cem_candidates.mp4", poster: "static/images/posters/deploy_prior_cem_candidates.jpg", head: "CEM candidates.", text: "The candidate postures evaluated at each replan, each rolled out with the frozen policy and colored by its rollout cost.", wide: true },
    ],
  },
  sim: {
    title: "In simulation, the prior makes the targets reachable",
    lead: "Success (%) over 90 paired episodes per bar, with identical episode draws across methods (paper Table&nbsp;I).",
    note: "&dagger; Crouched Push is scored on falls only. The two policies trained without hand forces run with Prior + CEM at test time.",
    tasks: ["Track", "Base Push", "EE Push", "Sustained Load", "Crouched Push†"],
    series: [
      { name: "Fixed posture",        color: "#C5CCD3", v: [15.6, 7.8, 8.9, 8.9, 28.9] },
      { name: "CEM only",             color: "#9AA4AE", v: [37.8, 27.8, 25.6, 42.2, 40.0] },
      { name: "End-to-end posture",   color: "#66717C", v: [43.3, 15.6, 37.8, 54.4, 45.6] },
      { name: "No targets or forces", color: "#E6CF9C", v: [56.7, 13.3, 32.2, 41.1, 4.4] },
      { name: "No forces",            color: "#B88A2E", v: [56.7, 23.3, 40.0, 70.0, 16.7] },
      { name: "Prior (ours)",         color: "#12898A", v: [82.2, 61.1, 62.2, 64.4, 45.6], ours: true },
      { name: "Prior + CEM (ours)",   color: "#0A5455", v: [77.8, 62.2, 63.3, 72.2, 48.9], ours: true },
    ],
    cemStat: { label: "CEM on top of the prior", from: "17.6°", to: "11.5°",
               text: "Hand orientation error on Track. It is lower on all five tasks.",
               note: "On the robot's laptop: 236&nbsp;ms per replan, fast enough for 2&nbsp;Hz." },
  },
  hardware: {
    title: "On the real G1, hand forces in training keep it upright",
    lead: "We pull and push a G1 at the torso and at the hands while it holds fixed hand targets under a safety gantry. Torso disturbances: all three policies hold, so the ablations can balance. Through the hands: only OCLO holds. All three use the prior's posture.",
    pairs: [
      { title: "Pulled by the hand", ok: "pull_succ", fail: "pull_fail" },
      { title: "Pushed on the hand", ok: "push_succ", fail: "push_fail" },
      { title: "Pulled sideways on one hand, arms held wide", ok: "lateral_succ", fail: "lateral_fail" },
    ],
    okLabel: "OCLO", failLabel: "No forces",
    failNote: "No forces: a policy trained without hand-force sampling, with or without hand-target sampling.",
    columns: [
      { name: "Ours", trained: "hand targets + hand forces", ours: true },
      { name: "No forces", trained: "hand targets" },
      { name: "No targets or forces", trained: "neither" },
    ],
    groups: [
      { name: "Torso: all three hold", rows: [
        { name: "Pull, 40–60 N", v: [10, 8, 8] }, { name: "Push", v: [9, 8, 7] } ] },
      { name: "Hands: only ours holds", rows: [
        { name: "Pull, 20–40 N", v: [10, 5, 1] }, { name: "Push", v: [9, 3, 0] },
        { name: "Sideways pull, 40–60 N", v: [8, 2, 0] } ] },
    ],
    fullTable: {
      head: ["Method", "Torso pull 40–60 N", "Torso push", "Hand pull 20–40 N", "Hand pull 50–70 N", "Hand push", "Sideways pull 40–60 N"],
      rows: [
        { name: "B1: no hand targets, no hand forces", v: ["8/10", "7/10", "1/10", "–", "0/10", "0/10"] },
        { name: "B2: hand targets, no hand forces", v: ["8/10", "8/10", "5/10", "–", "3/10", "2/10"] },
        { name: "OCLO (Prior)", v: ["10/10", "9/10", "10/10", "10/10", "9/10", "8/10"], ours: true },
        { name: "OCLO (Prior + CEM)", v: ["9/10", "9/10", "9/10", "–", "8/10", "8/10"] },
      ],
      note: "Pulls go through an inline force gauge at the stated range, and pushes are applied by hand. B1, B2 and OCLO (Prior) hold the prior's posture, while OCLO (Prior + CEM) refines it online. A dash marks an untested condition.",
    },
  },
  tasks: {
    title: "Nine real tasks from two hand targets",
    lead: "Unitree G1 with OCLO (Prior), teleoperated from two hand controllers and the G1's joystick for walking, with no posture command.",
    groups: [
      { name: "Crouch and lean", desc: "The body lowers to reach, down to the floor.", items: [
        { file: "task_doll",       name: "Doll from the floor", speed: "2x", desc: "Crouching to pick up a doll from the floor." },
        { file: "task_escalator",  name: "Walking crouched",    speed: "1x", desc: "Walking while crouched." },
        { file: "task_box",        name: "Picking a low box",   speed: "3x", desc: "Picking a box from a low surface, turning, and placing it." } ] },
      { name: "Push and pull", desc: "Walking under sustained hand forces.", items: [
        { file: "task_chair_push", name: "Pushing a chair",     speed: "1x", desc: "Walking forward under a sustained pushing force." },
        { file: "task_cart_pull",  name: "Pulling a cart",      speed: "2x", desc: "Walking backward under a sustained pulling force." },
        { file: "task_curtain",    name: "Opening a curtain",   speed: "2x", desc: "Lateral stepping with the hand holding the curtain." } ] },
      { name: "Compliant contact", desc: "The hands stay on the surface.", items: [
        { file: "task_table_wipe", name: "Cleaning a sink",     speed: "2x", desc: "Wiping in contact with the surface." },
        { file: "task_draw_wipe",  name: "Drawing and wiping",  speed: "3x", desc: "Hand tracking over the full height of a board." },
        { file: "task_insert",     name: "Inserting a block",   speed: "3x", desc: "Inserting a block into a holder." } ] },
    ],
  },
  teleop: {
    title: "Two-point teleoperation",
    lead: "The operator holds two hand controllers. Their poses and one clutch button per hand set the hand targets, and the G1's stock joystick sets the walking velocity. There is no head pose, no chest or hip tracker and no exoskeleton. Pelvis height and torso lean follow from the hand targets.",
    clips: ["teleop_1", "teleop_2", "teleop_3"],
  },
  agentic: {
    title: "Toward agentic AI: a VLM and a VLA drive the same body",
    badge: "Simulation · ongoing work · not in the paper",
    lead: "Teleoperation is only one source. A zero-shot VLM and a fine-tuned VLA send only two hand targets and a walking velocity to the same frozen controller, which handles the crouching and balancing.",
    tasks: ["Pick and place", "Box from the floor", "Wall button", "Table button"],
    keys: ["pp", "box", "wallbtn", "tablebtn"],
    rows: [
      { id: "vlm", name: "Zero-shot VLM", model: "Qwen3-VL-8B", success: [19, 27, 30, 30],
        desc: "Finds the target once from the head camera; scripted hand targets do the rest." },
      { id: "vla", name: "Fine-tuned VLA", model: "GR00T N1.6", success: [17, 13, 27, 30],
        desc: "One fine-tune on 1018 scripted demos of the four tasks; outputs the hand targets." },
    ],
    expert: [14, 25, 30, 29],
    note: "Successes out of 30 scenes per task. One successful scene per task is shown, at 3&times; speed. A scripted expert that reads the true object positions succeeds in 14, 25, 30 and 29 of 30. The VLA and every box run use the newest grasp physics, in which the object is attached to the wrists once both palms touch it. The other tasks did not change with it.",
  },
  bibtex: "",   // empty: the citation section is hidden
  footer: "OCLO \u00b7 2026",
};
