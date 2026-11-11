/**
 * phys-3 — Mechanics: Simple Pendulum
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Attach bob to string of length L', instruction: 'Attach a bob to a string of measured length L (measure from the pivot to the centre of the bob).' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Time 20 oscillations', instruction: 'Displace the bob by a small angle (less than 10°) and release; time 20 complete oscillations with a stopwatch.' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Calculate mean period T', instruction: 'Divide by 20 to get the period T; repeat twice more and take the mean period.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Change L and repeat', instruction: 'Change the string length and repeat for at least six different lengths.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Plot T² vs L', instruction: 'Plot T² (y-axis) against L (x-axis); the graph should be a straight line through the origin.' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Calculate g from gradient', instruction: 'Calculate g from the gradient: gradient = 4π²/g, so g = 4π²/gradient.' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Compare with accepted value', instruction: 'Compare your value of g with the accepted value (9.81 m/s²) and comment on any discrepancy.' },
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
