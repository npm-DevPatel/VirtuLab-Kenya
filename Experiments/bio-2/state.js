/**
 * bio-2 — Enzyme Activity (Temperature & pH)
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Prepare water baths', instruction: 'Prepare a series of water baths at different temperatures (e.g. 10°C, 20°C, 30°C, 40°C, 50°C, 60°C).' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Equilibrate starch solution', instruction: 'Place test tubes containing 1% starch solution into the water bath for 5 minutes to equilibrate.' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Add amylase and start timer', instruction: 'Add a measured volume of amylase solution to each starch tube; mix and restart the timer.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Test with iodine at intervals', instruction: 'At regular intervals (e.g. every minute), remove one drop from each tube and test with iodine on a spotting tile.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Record digestion time', instruction: 'Record the time taken for the blue-black colour to no longer appear (starch fully digested).' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Plot rate vs temperature', instruction: 'Plot reaction rate (1/time) against temperature; identify the optimum temperature.' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Investigate pH effects', instruction: 'Repeat the experiment varying pH (using buffer solutions) while keeping temperature constant, to investigate pH effects.' },
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
