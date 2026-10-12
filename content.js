/* Edit the copy here only. Layouts:
   cover | bleed | numbers | journey | split | bento | statement | factors | takeaways | honor | recs | end
   wave = where the living brand ribbon sits on this slide (fractions of the viewport):
   y centre, amp amplitude, freq waves across the screen, tilt slope, thick ribbon width, glow brightness,
   dim darkening, my centre on phones. */
window.SLIDES = [
  {
    layout: "cover",
    wave: { y: .8, amp: .13, freq: .85, tilt: -.14, thick: .2, glow: 1, dim: 0, my: .82 },
    eyebrow: "Summer Training Report 2026",
    title: "Eight weeks inside the high-voltage grid",
    name: "Faisal Ahmed Al-Salmi", id: "44207135",
    meta: ["College of Engineering, Taif University", "July 6 - August 28, 2026", "Supervisor: Ezzeldin Abushady"]
  },
  {
    layout: "bleed",
    wave: { y: .92, amp: .05, freq: 1, tilt: 0, thick: .05, glow: .6, dim: 0 },
    image: "switchgear-room.jpeg", alt: "A long switchgear corridor with a yellow line on the floor",
    title: "Where I spent the summer",
    body: "High Voltage Transmission Substations Department, Saudi Electricity Company (SEC), Western Region, Jeddah.",
    caption: "Switchgear room"
  },
  {
    layout: "numbers",
    wave: { y: .86, amp: .09, freq: 1.2, tilt: -.12, thick: .09, glow: .9, dim: 0, my: .9 },
    title: "The training in four numbers",
    big: { value: 8, label: "weeks in the field", sub: "July 6 to August 28, 2026" },
    stats: [
      { value: 2, decimals: 0, unit: "", label: "tasks: SF6 monitoring in GIS, and control room ergonomics" },
      { value: 13.8, decimals: 1, unit: "kV", label: "cable feeder panel in the switchgear room" },
      { value: 110, decimals: 0, unit: "kV", label: "synchro trolley panel at the substation" }
    ]
  },
  {
    layout: "journey",
    wave: { y: .9, amp: .05, freq: 1.5, tilt: 0, thick: .06, glow: .8, dim: 0 },
    title: "How the eight weeks unfolded",
    phases: [
      { weeks: 2, range: "Weeks 1-2", title: "HSE & Orientation", body: "High-voltage safety rules, personal protective equipment (PPE) and site familiarization." },
      { weeks: 3, range: "Weeks 3-5", title: "Transmission Substations", body: "Field inspections, power transformer maintenance, GIS and SF6 pressure checks." },
      { weeks: 3, range: "Weeks 6-8", title: "Control Room Ergonomics & Reporting", body: "Control panel layout analysis, thermal and visual ergonomic evaluation, and the final report." }
    ]
  },
  {
    layout: "split",
    wave: { y: .93, amp: .1, freq: .9, tilt: .25, thick: .1, glow: .9, dim: 0 },
    eyebrow: "Task 1",
    title: "Monitoring SF6 in GIS switchgear",
    body: "Gas Insulated Switchgear (GIS) uses SF6 gas for arc quenching and insulation.",
    challengeLabel: "Challenge",
    challenge: "Monitoring gas leakage and holding precise pressure thresholds under high ambient temperatures.",
    solutionLabel: "Solution",
    solution: "Pressure-temperature compensation charts.",
    link: "Academic link: fluid mechanics, thermodynamics, mechanical safety engineering.",
    image: "switchgear-feeder.jpeg", caption: "13.8 kV cable feeder panel"
  },
  {
    layout: "bento",
    wave: { y: .5, amp: .28, freq: .6, tilt: -.1, thick: .22, glow: .75, dim: 0, my: .55 },
    title: "Inside the substation",
    body: "Photos from the training sites in Jeddah.",
    images: [
      { src: "mv-cables.jpeg", caption: "Medium-voltage cable trays under the floor" },
      { src: "battery-room.jpeg", caption: "Battery room" },
      { src: "synchro-panel.jpeg", caption: "110 kV synchro trolley panel" },
      { src: "se-office.jpeg", caption: "Saudi Energy office" }
    ]
  },
  {
    layout: "statement",
    wave: { y: .66, amp: .2, freq: 1.25, tilt: .1, thick: .2, glow: 1.15, dim: 0, my: .7 },
    title: "From equipment to the control room",
    body: "In the final weeks the focus moved to the operators who monitor the grid on SCADA for long hours."
  },
  {
    layout: "factors",
    wave: { y: .93, amp: .06, freq: 1.8, tilt: 0, thick: .05, glow: .8, dim: 0 },
    eyebrow: "Task 2",
    title: "Ergonomics in the SCADA control room",
    body: "I evaluated four factors at the operator workstations:",
    factors: ["Workstation height", "Screen distance", "Lighting glare", "Thermal settings"],
    recsLabel: "Recommendations",
    recs: ["Optimal monitor arrangement", "Adjustable seating standards", "Better access ramps for technicians"],
    link: "Academic link: Industrial Engineering, Human Factors (Ergonomics), Facility Design."
  },
  {
    layout: "takeaways",
    wave: { y: .92, amp: .1, freq: .7, tilt: -.2, thick: .12, glow: .85, dim: 0 },
    title: "What I take away",
    learnedLabel: "What I learned",
    learned: [
      { key: "Equipment", text: "GIS switchgear mechanics, high-voltage circuit breakers and transformer protection." },
      { key: "Ergonomics", text: "Applying human factors in high-stress control rooms." },
      { key: "Operations", text: "SCADA monitoring and emergency shutdown protocols." }
    ],
    challengesLabel: "What I faced",
    challenges: [
      { key: "Safety", text: "Strict high-voltage safety zones that require a Permit to Work (PTW)." },
      { key: "Reporting", text: "Merging mechanical, electrical and human-factors data into one report." }
    ]
  },
  {
    layout: "honor", variant: "portrait",
    wave: { y: .84, amp: .12, freq: .8, tilt: .15, thick: .14, glow: 1.2, dim: .58, my: .9 },
    lead: "Honored by the", title: "Director of the Technology Transfer Department, Jeddah",
    body: "He presented me with my summer training completion certificate at the Saudi Electricity Company.",
    image: "honor-director.jpeg", alt: "Receiving the training completion certificate in front of the Saudi flag and the Saudi Energy flag"
  },
  {
    layout: "honor", variant: "landscape",
    wave: { y: .86, amp: .12, freq: .95, tilt: -.15, thick: .14, glow: 1.2, dim: .58, my: .9 },
    lead: "Honored by the", title: "Field Training Supervisor",
    body: "He supervised my field work and presented me with my training completion certificate.",
    image: "honor-supervisor.jpeg", alt: "Receiving the training completion certificate in the department office"
  },
  {
    layout: "recs",
    wave: { y: .9, amp: .08, freq: 1.1, tilt: .1, thick: .08, glow: .85, dim: 0 },
    title: "Two recommendations",
    items: [
      { to: "For future trainees", text: "Learn high-voltage equipment standards and SCADA basics before the placement starts." },
      { to: "For the department", text: "Extend ergonomic assessments to mobile control units and remote field stations." }
    ]
  },
  {
    layout: "end",
    wave: { y: .36, amp: .035, freq: 1, tilt: 0, thick: .012, glow: 1.3, dim: 0, my: .3 },
    title: "Thank you",
    body: "Faisal Ahmed Al-Salmi, Taif University"
  }
];
