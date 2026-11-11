/**
 * bio-4 — Dichotomous Keys & Specimen Identification
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Collect/examine specimens', instruction: 'Collect or examine provided specimens of leaves and/or flowers; handle them carefully and lay them flat.' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Begin first couplet', instruction: 'Begin with the first couplet in the dichotomous key; read both statements and decide which applies to your specimen.' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Follow the key', instruction: 'Follow the direction given (proceed to a numbered couplet or arrive at a name) and continue through the key.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Record choices', instruction: 'Record each couplet number and choice made as you work through the key, so your reasoning can be checked.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Write identification', instruction: 'When you reach an identification, write down the name of the organism and note the key features that led to it.' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Sketch and label', instruction: 'Sketch the specimen, labelling at least three structural adaptations (e.g. parallel venation, waxy cuticle, thorn).' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Verify identification', instruction: 'Repeat the identification independently starting from couplet 1 to verify your result.' },
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
