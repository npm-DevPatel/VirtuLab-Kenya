/**
 * phys-4 — Mechanics: Hooke's Law (Spring Constant)
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Clamp spring vertically', instruction: 'Clamp the spring vertically from a stand; attach a pointer and position a metre rule alongside it.' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Record natural length', instruction: 'Record the natural (unloaded) length of the spring as the reference position.' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Add masses and record', instruction: 'Add slotted masses one at a time (e.g. 100 g increments); after each addition, allow the spring to settle and record the new length.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Calculate extensions', instruction: 'Calculate the extension (new length − natural length) for each load.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Plot load-extension graph', instruction: 'Plot a load-extension graph; identify the linear (Hooke\'s Law) region and the elastic limit.' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Calculate spring constant k', instruction: 'Calculate the spring constant k from the gradient of the linear region: k = F/x (N/m).' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Check elastic limit', instruction: 'Remove masses and check whether the spring returns to its original length; note if the elastic limit was exceeded.' },
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
