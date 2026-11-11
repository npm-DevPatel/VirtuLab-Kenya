/**
 * phys-2 — Optics: Convex Lenses (Focal Length)
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 6', title: 'Set up optical bench', instruction: 'Set up the optical bench: illuminated object (lamp and cross-wire) at one end, convex lens in a holder in the middle, white screen at the other end.' },
    { index: 2, tag: 'STEP 2 OF 6', title: 'Focus a sharp image', instruction: 'Move the screen until a sharp, clear image of the cross-wire is formed on it; record the object distance u and image distance v.' },
    { index: 3, tag: 'STEP 3 OF 6', title: 'Repeat for 6+ values of u', instruction: 'Repeat for at least six different values of u (each larger than the focal length).' },
    { index: 4, tag: 'STEP 4 OF 6', title: 'Calculate f for each pair', instruction: 'For each pair, calculate focal length using the formula: 1/f = 1/v − 1/u (using real-is-positive sign convention).' },
    { index: 5, tag: 'STEP 5 OF 6', title: 'Calculate mean focal length', instruction: 'Calculate the mean focal length from all valid readings.' },
    { index: 6, tag: 'STEP 6 OF 6', title: 'Plot 1/v vs 1/u graph', instruction: 'Plot a 1/v vs 1/u graph; the intercepts on each axis both equal 1/f, providing a graphical determination of focal length.' },
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
