/**
 * phys-1 — Electricity: Ohm's Law & Internal Resistance
 * Experiment state manager.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 6', title: 'Connect the circuit', instruction: 'Connect the cell(s), ammeter (in series), and a variable resistor in a simple circuit; connect the voltmeter in parallel across the cell terminals.' },
    { index: 2, tag: 'STEP 2 OF 6', title: 'Set max resistance and record V, I', instruction: 'Set the variable resistor to its maximum resistance; close the switch and record the voltmeter reading (terminal p.d.) and ammeter reading (current I).' },
    { index: 3, tag: 'STEP 3 OF 6', title: 'Decrease resistance in steps', instruction: 'Decrease resistance in steps; record V and I at each setting — aim for 6–8 pairs of readings.' },
    { index: 4, tag: 'STEP 4 OF 6', title: 'Plot V–I graph', instruction: 'Plot a V–I graph (V on y-axis, I on x-axis); the gradient gives the negative of internal resistance (−r) and the y-intercept gives the EMF (ε).' },
    { index: 5, tag: 'STEP 5 OF 6', title: 'Read ε and r from graph', instruction: 'Read off ε and r from the graph; compare with the manufacturer\'s stated EMF if available.' },
    { index: 6, tag: 'STEP 6 OF 6', title: 'State sources of uncertainty', instruction: 'State sources of uncertainty (e.g. ammeter resistance, cell warming during the experiment).' },
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
