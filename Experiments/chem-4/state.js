/**
 * chem-4 — Thermochemistry & Reaction Rates
 * Experiment state manager: tracks heat-of-solution and disappearing-cross steps.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 7', title: 'Record initial water temperature', instruction: 'Record the initial temperature of 100 cm³ of distilled water in a polystyrene cup.' },
    { index: 2, tag: 'STEP 2 OF 7', title: 'Weigh and add solute', instruction: 'Weigh a measured mass of the solute (e.g. anhydrous sodium chloride or potassium nitrate); add it to the water and stir.' },
    { index: 3, tag: 'STEP 3 OF 7', title: 'Record final temperature and calculate ΔH', instruction: 'Record the maximum or minimum temperature reached; calculate ΔT and then ΔH using Q = mcΔT.' },
    { index: 4, tag: 'STEP 4 OF 7', title: 'Draw X on paper, place flask', instruction: 'Draw a bold X on paper; place a conical flask over it.' },
    { index: 5, tag: 'STEP 5 OF 7', title: 'Add Na₂S₂O₃ and HCl, start timer', instruction: 'Measure 50 cm³ of sodium thiosulphate solution into the flask; add a measured volume of dilute HCl and immediately start the stopwatch.' },
    { index: 6, tag: 'STEP 6 OF 7', title: 'Time until cross disappears', instruction: 'Look down through the flask; stop the timer when the cross is no longer visible through the cloudy precipitate.' },
    { index: 7, tag: 'STEP 7 OF 7', title: 'Plot rate vs variable', instruction: 'Repeat at different concentrations (or temperatures) and plot rate (1/time) against the variable to show the relationship.' },
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
