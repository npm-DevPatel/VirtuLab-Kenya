/**
 * VirtuLab Kenya - Experiment catalogue data
 * All 12 KCSE-aligned experiments across Chemistry, Physics, Biology.
 * Titles and descriptions are verbatim from the project spec (file 01).
 * Procedure outlines are factually accurate to the real experiment method.
 */

export const experiments = [
  // ── Chemistry ──────────────────────────────────────────────────────
  {
    id: "titration",
    subject: "Chemistry",
    title: "Volumetric Analysis (Titration)",
    description:
      "Acid-base and redox titrations to determine unknown concentration or molar mass.",
    procedure: [
      "Rinse the burette with the titrant solution, then fill it to the 0.00 cm³ mark and record the initial reading.",
      "Pipette a measured volume of the analyte solution into a conical flask and add 2–3 drops of the appropriate indicator (e.g. phenolphthalein for acid-base, potassium manganate(VII) acts as its own for redox).",
      "Run the titrant slowly from the burette into the conical flask, swirling continuously.",
      "Approach the endpoint carefully - add titrant drop by drop until a permanent colour change is observed.",
      "Record the final burette reading and calculate the titre volume (final − initial).",
      "Repeat until at least two concordant titres (within 0.10 cm³ of each other) are obtained.",
      "Use the mean concordant titre and the mole ratio from the balanced equation to calculate the unknown concentration or molar mass.",
    ],
  },
  {
    id: "qualitative-inorganic",
    subject: "Chemistry",
    title: "Qualitative Analysis: Inorganic",
    description:
      "Identifying cations and anions using reagents such as sodium hydroxide and aqueous ammonia.",
    procedure: [
      "Dissolve a small sample of the unknown substance in distilled water to make a test solution.",
      "Add dilute sodium hydroxide solution dropwise, then in excess; observe any precipitate colour and whether it dissolves in excess.",
      "Add dilute aqueous ammonia dropwise, then in excess; observe precipitate and solubility in excess.",
      "Record cation inference based on colour and behaviour of precipitates (e.g. blue precipitate soluble in excess NaOH and NH₃ indicates Cu²⁺).",
      "Test the solution for anions: add dilute HCl to test for carbonate (effervescence), add barium chloride for sulphate (white precipitate), add silver nitrate for halides.",
      "Compile results in a table: ion tested, reagent added, observation, inference.",
    ],
  },
  {
    id: "qualitative-organic",
    subject: "Chemistry",
    title: "Qualitative Analysis: Organic",
    description:
      "Using bromine water and acidified potassium manganate(VII) to distinguish saturated from unsaturated hydrocarbons.",
    procedure: [
      "Label two test tubes A and B. Add a few drops of the test hydrocarbon to each.",
      "To tube A, add bromine water (orange-brown) dropwise; observe whether the colour is retained or decolorised.",
      "To tube B, add acidified potassium manganate(VII) solution (purple) dropwise; observe colour change.",
      "Record observations: decolorisation of bromine water and/or KMnO₄ indicates the presence of a C=C double bond (unsaturated).",
      "Repeat with a known saturated compound as a control and a known unsaturated compound as a positive reference.",
      "Write your conclusion, distinguishing the two samples based on the combined test results.",
    ],
  },
  {
    id: "thermochemistry",
    subject: "Chemistry",
    title: "Thermochemistry & Reaction Rates",
    description:
      "Measuring enthalpy changes (heat of solution) and tracking reaction rate via the \"disappearing cross\" method (sodium thiosulphate and acid).",
    procedure: [
      "Part A - Heat of solution: Record the initial temperature of 100 cm³ of distilled water in a polystyrene cup.",
      "Weigh a measured mass of the solute (e.g. anhydrous sodium chloride or potassium nitrate); add it to the water and stir.",
      "Record the maximum or minimum temperature reached; calculate ΔT and then ΔH using Q = mcΔT.",
      "Part B - Disappearing cross: Draw a bold X on paper; place a conical flask over it.",
      "Measure 50 cm³ of sodium thiosulphate solution into the flask; add a measured volume of dilute HCl and immediately start the stopwatch.",
      "Look down through the flask; stop the timer when the cross is no longer visible through the cloudy precipitate.",
      "Repeat at different concentrations (or temperatures) and plot rate (1/time) against the variable to show the relationship.",
    ],
  },

  // ── Physics ────────────────────────────────────────────────────────
  {
    id: "ohms-law",
    subject: "Physics",
    title: "Electricity: Ohm's Law & Internal Resistance",
    description:
      "Wiring circuits with cells, voltmeters and ammeters to determine EMF and internal resistance.",
    procedure: [
      "Connect the cell(s), ammeter (in series), and a variable resistor in a simple circuit; connect the voltmeter in parallel across the cell terminals.",
      "Set the variable resistor to its maximum resistance; close the switch and record the voltmeter reading (terminal p.d.) and ammeter reading (current I).",
      "Decrease resistance in steps; record V and I at each setting - aim for 6–8 pairs of readings.",
      "Plot a V–I graph (V on y-axis, I on x-axis); the gradient gives the negative of internal resistance (−r) and the y-intercept gives the EMF (ε).",
      "Read off ε and r from the graph; compare with the manufacturer's stated EMF if available.",
      "State sources of uncertainty (e.g. ammeter resistance, cell warming during the experiment).",
    ],
  },
  {
    id: "convex-lenses",
    subject: "Physics",
    title: "Optics: Convex Lenses",
    description:
      "Using an illuminated object, convex lens and screen to determine focal length.",
    procedure: [
      "Set up the optical bench: illuminated object (lamp and cross-wire) at one end, convex lens in a holder in the middle, white screen at the other end.",
      "Move the screen until a sharp, clear image of the cross-wire is formed on it; record the object distance u (object to lens) and image distance v (lens to screen).",
      "Repeat for at least six different values of u (each larger than the focal length).",
      "For each pair, calculate focal length using the formula: 1/f = 1/v − 1/u (using real-is-positive sign convention).",
      "Calculate the mean focal length from all valid readings.",
      "Plot a 1/v vs 1/u graph; the intercepts on each axis both equal 1/f, providing a graphical determination of focal length.",
    ],
  },
  {
    id: "simple-pendulum",
    subject: "Physics",
    title: "Mechanics: Simple Pendulum",
    description: "Timing oscillations to calculate acceleration due to gravity.",
    procedure: [
      "Attach a bob to a string of measured length L (measure from the pivot to the centre of the bob).",
      "Displace the bob by a small angle (less than 10°) and release; time 20 complete oscillations with a stopwatch.",
      "Divide by 20 to get the period T; repeat twice more and take the mean period.",
      "Change the string length and repeat for at least six different lengths.",
      "Plot T² (y-axis) against L (x-axis); the graph should be a straight line through the origin.",
      "Calculate g from the gradient: gradient = 4π²/g, so g = 4π²/gradient.",
      "Compare your value of g with the accepted value (9.81 m/s²) and comment on any discrepancy.",
    ],
  },
  {
    id: "hookes-law",
    subject: "Physics",
    title: "Mechanics: Hooke's Law",
    description:
      "Investigating spring extension under varying slotted masses.",
    procedure: [
      "Clamp the spring vertically from a stand; attach a pointer and position a metre rule alongside it.",
      "Record the natural (unloaded) length of the spring as the reference position.",
      "Add slotted masses one at a time (e.g. 100 g increments); after each addition, allow the spring to settle and record the new length.",
      "Calculate the extension (new length − natural length) for each load.",
      "Plot a load-extension graph; identify the linear (Hooke's Law) region and the elastic limit.",
      "Calculate the spring constant k from the gradient of the linear region: k = F/x (N/m).",
      "Remove masses and check whether the spring returns to its original length; note if the elastic limit was exceeded.",
    ],
  },

  // ── Biology ────────────────────────────────────────────────────────
  {
    id: "food-tests",
    subject: "Biology",
    title: "Food Tests",
    description:
      "Using Benedict's, Iodine and Biuret reagents to test for reducing sugars, starch and proteins.",
    procedure: [
      "Prepare four test tubes, each containing a small sample of the food substance dissolved or suspended in water.",
      "Benedict's test (reducing sugars): Add 2 cm³ of Benedict's solution; heat in a water bath for 2–3 minutes; a brick-red precipitate is a positive result.",
      "Iodine test (starch): Add 2 drops of iodine solution; a blue-black colour is a positive result.",
      "Biuret test (proteins): Add 2 cm³ of sodium hydroxide solution, then add copper sulphate solution drop by drop; a purple/violet colour is a positive result.",
      "Record all observations and inferences in a results table: food tested, reagent, observation, conclusion.",
      "Compare results with positive and negative controls for each test.",
    ],
  },
  {
    id: "enzyme-activity",
    subject: "Biology",
    title: "Enzyme Activity",
    description:
      "Investigating how temperature and pH affect enzyme reaction rate, e.g. amylase breaking down starch.",
    procedure: [
      "Prepare a series of water baths at different temperatures (e.g. 10°C, 20°C, 30°C, 40°C, 50°C, 60°C).",
      "Place test tubes containing 1% starch solution into the water bath for 5 minutes to equilibrate.",
      "Add a measured volume of amylase solution to each starch tube; mix and restart the timer.",
      "At regular intervals (e.g. every minute), remove one drop from each tube and test with iodine on a spotting tile.",
      "Record the time taken for the blue-black colour to no longer appear (starch fully digested).",
      "Plot reaction rate (1/time) against temperature; identify the optimum temperature.",
      "Repeat the experiment varying pH (using buffer solutions) while keeping temperature constant, to investigate pH effects.",
    ],
  },
  {
    id: "osmosis",
    subject: "Biology",
    title: "Osmosis & Diffusion",
    description:
      "Observing weight/volume changes in potato cylinders or Visking tubing across sucrose concentration gradients.",
    procedure: [
      "Cut potato cylinders of uniform length and diameter using a cork borer and scalpel; measure and record initial length and mass of each cylinder.",
      "Prepare a series of sucrose solutions of known concentration (e.g. 0, 0.2, 0.4, 0.6, 0.8, 1.0 mol/dm³).",
      "Place one or two potato cylinders into each concentration; leave for at least 30 minutes.",
      "Remove cylinders, blot dry with filter paper, and measure and record final length and mass.",
      "Calculate percentage change in mass for each concentration: ((final − initial) / initial) × 100.",
      "Plot percentage change in mass against sucrose concentration; the point where the graph crosses zero gives the solute concentration of the potato cell sap.",
      "Explain the results in terms of water potential, osmosis, and the relationship between the cell sap and the external solution.",
    ],
  },
  {
    id: "dichotomous-keys",
    subject: "Biology",
    title: "Dichotomous Keys & Specimen Observation",
    description:
      "Examining structural adaptations of leaves and flowers to identify them using a key.",
    procedure: [
      "Collect or examine provided specimens of leaves and/or flowers; handle them carefully and lay them flat.",
      "Begin with the first couplet in the dichotomous key; read both statements and decide which applies to your specimen.",
      "Follow the direction given (proceed to a numbered couplet or arrive at a name) and continue through the key.",
      "Record each couplet number and choice made as you work through the key, so your reasoning can be checked.",
      "When you reach an identification, write down the name of the organism and note the key features that led to it.",
      "Sketch the specimen, labelling at least three structural adaptations (e.g. parallel venation, waxy cuticle, thorn).",
      "Repeat the identification independently starting from couplet 1 to verify your result.",
    ],
  },
];

/** Convenience lookup by experiment id */
export function getExperiment(id) {
  return experiments.find((e) => e.id === id) || null;
}

/** Filter by subject */
export function getBySubject(subject) {
  return experiments.filter((e) => e.subject === subject);
}

export const subjects = ["Chemistry", "Physics", "Biology"];
