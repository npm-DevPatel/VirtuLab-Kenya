/**
 * bio-3 — Osmosis in Plant Tissue & Visking Tubing
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Cut potato cylinders', instruction: 'Cut potato cylinders of uniform length and diameter using a cork borer and scalpel; measure and record initial length and mass of each cylinder.' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Prepare sucrose solutions', instruction: 'Prepare a series of sucrose solutions of known concentration (e.g. 0, 0.2, 0.4, 0.6, 0.8, 1.0 mol/dm³).' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Immerse cylinders', instruction: 'Place one or two potato cylinders into each concentration; leave for at least 30 minutes.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Measure final mass', instruction: 'Remove cylinders, blot dry with filter paper, and measure and record final length and mass.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Calculate % change', instruction: 'Calculate percentage change in mass for each concentration: ((final − initial) / initial) × 100.' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Plot % change vs concentration', instruction: 'Plot percentage change in mass against sucrose concentration; the point where the graph crosses zero gives the solute concentration of the potato cell sap.' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Explain in terms of water potential', instruction: 'Explain the results in terms of water potential, osmosis, and the relationship between the cell sap and the external solution.' },
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
