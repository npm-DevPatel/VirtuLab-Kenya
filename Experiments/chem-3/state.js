/**
 * chem-3 — Qualitative Analysis: Organic (Functional Groups)
 * Experiment state manager: tracks bromine water and KMnO4 tests.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 6', title: 'Label test tubes A and B', instruction: 'Label two test tubes A and B. Add a few drops of the test hydrocarbon to each.' },
    { index: 2, tag: 'STEP 2 OF 6', title: 'Add bromine water to tube A', instruction: 'To tube A, add bromine water (orange-brown) dropwise; observe whether the colour is retained or decolorised.' },
    { index: 3, tag: 'STEP 3 OF 6', title: 'Add acidified KMnO₄ to tube B', instruction: 'To tube B, add acidified potassium manganate(VII) solution (purple) dropwise; observe colour change.' },
    { index: 4, tag: 'STEP 4 OF 6', title: 'Record observations', instruction: 'Record observations: decolorisation indicates the presence of a C=C double bond (unsaturated).' },
    { index: 5, tag: 'STEP 5 OF 6', title: 'Repeat with controls', instruction: 'Repeat with a known saturated compound as a control and a known unsaturated compound as a positive reference.' },
    { index: 6, tag: 'STEP 6 OF 6', title: 'Write conclusion', instruction: 'Write your conclusion, distinguishing the two samples based on the combined test results.' },
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
