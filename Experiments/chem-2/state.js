/**
 * chem-2 — Qualitative Analysis: Inorganic
 * Experiment state manager: tracks current step, observations, and inferences.
 */

const STEPS = [
    { index: 1, tag: 'STEP 1 OF 6', title: 'Dissolve sample in distilled water', instruction: 'Dissolve a small sample of the unknown substance in distilled water to make a test solution.' },
    { index: 2, tag: 'STEP 2 OF 6', title: 'Add dilute NaOH dropwise then in excess', instruction: 'Add dilute sodium hydroxide solution dropwise, then in excess; observe any precipitate colour and whether it dissolves in excess.' },
    { index: 3, tag: 'STEP 3 OF 6', title: 'Add dilute aqueous ammonia', instruction: 'Add dilute aqueous ammonia dropwise, then in excess; observe precipitate and solubility in excess.' },
    { index: 4, tag: 'STEP 4 OF 6', title: 'Record cation inference', instruction: 'Record cation inference based on colour and behaviour of precipitates.' },
    { index: 5, tag: 'STEP 5 OF 6', title: 'Test for anions', instruction: 'Test the solution for anions: add dilute HCl for carbonate, barium chloride for sulphate, silver nitrate for halides.' },
    { index: 6, tag: 'STEP 6 OF 6', title: 'Compile results table', instruction: 'Compile results in a table: ion tested, reagent added, observation, inference.' },
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
