/**
 * bio-1 — Food Tests (Reducing Sugars, Starch, Proteins, Lipids)
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 6', title: 'Prepare food sample test tubes', instruction: 'Prepare four test tubes, each containing a small sample of the food substance dissolved or suspended in water.' },
    { index: 2, tag: 'STEP 2 OF 6', title: "Benedict's test (reducing sugars)", instruction: "Add 2 cm³ of Benedict's solution; heat in a water bath for 2–3 minutes; a brick-red precipitate is a positive result." },
    { index: 3, tag: 'STEP 3 OF 6', title: 'Iodine test (starch)', instruction: 'Add 2 drops of iodine solution; a blue-black colour is a positive result.' },
    { index: 4, tag: 'STEP 4 OF 6', title: 'Biuret test (proteins)', instruction: 'Add 2 cm³ of sodium hydroxide solution, then add copper sulphate solution drop by drop; a purple/violet colour is a positive result.' },
    { index: 5, tag: 'STEP 5 OF 6', title: 'Record observations', instruction: 'Record all observations and inferences in a results table: food tested, reagent, observation, conclusion.' },
    { index: 6, tag: 'STEP 6 OF 6', title: 'Compare with controls', instruction: 'Compare results with positive and negative controls for each test.' },
];

export class ExperimentState {
    constructor() { this.reset(); }

    reset() {
        this.currentStep = 1;
        this.status = 'IN_PROGRESS';
    }

    advanceStep() {
        if (this.currentStep < STEPS.length) {
            this.currentStep++;
            if (this.currentStep === STEPS.length) this.status = 'COMPLETE';
        }
        return this.getSnapshot();
    }

    getSnapshot() {
        return {
            currentStep: this.currentStep,
            stepMeta: { ...STEPS[this.currentStep - 1] },
            status: this.status,
        };
    }
}
