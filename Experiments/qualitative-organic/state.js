/**
 * CHEM-3: Qualitative Analysis — Organic Functional Groups
 * Starter experiment state. Steps are pulled live from lib/experiments.js.
 */
import { experiments } from '@/lib/experiments.js';

const exp = experiments.find(e => e.id === 'qualitative-organic');

const STEPS = (exp?.procedure || []).map((instruction, i) => ({
    index: i + 1,
    tag: `STEP ${i + 1} OF ${exp.procedure.length}`,
    title: `Step ${i + 1}`,
    instruction,
}));

export class ExperimentState {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentStep = 1;
        this.status = 'READY';
    }

    nextStep() {
        if (this.currentStep < STEPS.length) this.currentStep++;
        return this.getSnapshot();
    }

    getSnapshot() {
        const stepMeta = { ...STEPS[this.currentStep - 1] };
        return {
            currentStep: this.currentStep,
            totalSteps: STEPS.length,
            stepMeta,
            status: this.status,
        };
    }
}