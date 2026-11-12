export class ExperimentState {
    constructor(experiment) {
        this.experiment = experiment;
        this.reset();
    }

    reset() {
        this.currentStep = 1; // 1 to 6

        // Sub-progress flags within steps
        this.solutionPrepared = false;
        this.step2Stage = 0; // 0: awaiting dropwise NaOH, 1: dropwise added (white ppt), 2: excess added (dissolved)
        this.step3Stage = 0; // 0: awaiting dropwise NH3, 1: dropwise added (white ppt), 2: excess added (dissolved)
        this.step4Stage = 0; // 0: awaiting HNO3, 1: HNO3 added, 2: AgNO3 added (no ppt)
        this.step5Stage = 0; // 0: awaiting HCl, 1: HCl added, 2: BaCl2 added (white ppt BaSO4)
        this.completed = false;

        this.activeTube = 1; // 1, 2, 3, or 4

        // Visual states of the 4 test tubes
        this.tubes = {
            1: {
                label: 'Portion 1 (NaOH)',
                volume: 0, // 0 to 1
                liquidColor: 0xe0f2fe,
                liquidOpacity: 0.38,
                pptHeight: 0, // 0 to 1
                pptColor: 0xffffff,
                pptOpacity: 0,
                turbidity: 0, // cloudiness in liquid
                statusText: 'Empty',
            },
            2: {
                label: 'Portion 2 (NH₃)',
                volume: 0,
                liquidColor: 0xe0f2fe,
                liquidOpacity: 0.38,
                pptHeight: 0,
                pptColor: 0xffffff,
                pptOpacity: 0,
                turbidity: 0,
                statusText: 'Empty',
            },
            3: {
                label: 'Portion 3 (AgNO₃)',
                volume: 0,
                liquidColor: 0xe0f2fe,
                liquidOpacity: 0.38,
                pptHeight: 0,
                pptColor: 0xffffff,
                pptOpacity: 0,
                turbidity: 0,
                statusText: 'Empty',
            },
            4: {
                label: 'Portion 4 (BaCl₂)',
                volume: 0,
                liquidColor: 0xe0f2fe,
                liquidOpacity: 0.38,
                pptHeight: 0,
                pptColor: 0xffffff,
                pptOpacity: 0,
                turbidity: 0,
                statusText: 'Empty',
            },
        };

        // Cumulative KCSE Observation Log
        this.obsLog = {
            appearance: 'Pending dissolution...',
            naoh: 'Not tested yet',
            nh3: 'Not tested yet',
            halide: 'Not tested yet',
            sulphate: 'Not tested yet',
        };
    }

    handleAction(actionId, payload, { labScene, fx, syncAll }) {
        return new Promise((resolve) => {
            // Quick Swirl helper usable at any step
            if (actionId === 'SWIRL_TUBE') {
                fx?.swirlTube?.(this.activeTube);
                resolve(this.getSnapshot());
                return;
            }

            // STEP 1: Dissolve Solid M & Divide into 4 Test Tubes
            if (actionId === 'PREPARE_PORTIONS' && this.currentStep === 1) {
                labScene?.setCameraPreset?.('rack');
                fx?.playPreparePortions?.(() => {
                    this.solutionPrepared = true;
                    for (let i = 1; i <= 4; i++) {
                        this.tubes[i].volume = 0.42;
                        this.tubes[i].liquidColor = 0xe8f4f8;
                        this.tubes[i].liquidOpacity = 0.42;
                        this.tubes[i].statusText = 'Clear colourless solution';
                    }
                    this.obsLog.appearance = 'Colourless solution (Cu²⁺, Fe²⁺, Fe³⁺ absent)';
                    this.currentStep = 2;
                    this.activeTube = 1;
                    labScene?.setCameraPreset?.('tube1');
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 2A: Add 2M NaOH Dropwise to Tube 1
            if (actionId === 'NAOH_DROPWISE' && this.currentStep === 2 && this.step2Stage === 0) {
                this.activeTube = 1;
                labScene?.setCameraPreset?.('tube1');
                fx?.playReagentDropper?.('naoh', 1, 3, () => {
                    this.step2Stage = 1;
                    this.tubes[1].volume = 0.56;
                    this.tubes[1].liquidColor = 0xf8fafc;
                    this.tubes[1].liquidOpacity = 0.86;
                    this.tubes[1].pptHeight = 0.75;
                    this.tubes[1].pptOpacity = 0.94;
                    this.tubes[1].turbidity = 0.85;
                    this.tubes[1].statusText = 'White precipitate formed';
                    this.obsLog.naoh = 'Dropwise: White ppt (Zn²⁺, Al³⁺, Pb²⁺)';
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 2B: Add Excess 2M NaOH to Tube 1 -> Precipitate Dissolves
            if (actionId === 'NAOH_EXCESS' && this.currentStep === 2 && this.step2Stage === 1) {
                this.activeTube = 1;
                labScene?.setCameraPreset?.('tube1');
                fx?.playReagentDropper?.('naoh', 1, 5, () => {
                    this.step2Stage = 2;
                    this.tubes[1].volume = 0.78;
                    this.tubes[1].liquidColor = 0xe0f2fe;
                    this.tubes[1].liquidOpacity = 0.40;
                    this.tubes[1].pptHeight = 0.0;
                    this.tubes[1].pptOpacity = 0.0;
                    this.tubes[1].turbidity = 0.0;
                    this.tubes[1].statusText = 'White ppt soluble in excess';
                    this.obsLog.naoh = 'White ppt, soluble in excess → Zn²⁺, Al³⁺, Pb²⁺';
                    this.currentStep = 3;
                    this.activeTube = 2;
                    setTimeout(() => {
                        labScene?.setCameraPreset?.('tube2');
                        syncAll?.(this.getSnapshot());
                    }, 450);
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 3A: Add Aqueous Ammonia (NH3) Dropwise to Tube 2
            if (actionId === 'NH3_DROPWISE' && this.currentStep === 3 && this.step3Stage === 0) {
                this.activeTube = 2;
                labScene?.setCameraPreset?.('tube2');
                fx?.playReagentDropper?.('nh3', 2, 3, () => {
                    this.step3Stage = 1;
                    this.tubes[2].volume = 0.56;
                    this.tubes[2].liquidColor = 0xf8fafc;
                    this.tubes[2].liquidOpacity = 0.86;
                    this.tubes[2].pptHeight = 0.75;
                    this.tubes[2].pptOpacity = 0.94;
                    this.tubes[2].turbidity = 0.85;
                    this.tubes[2].statusText = 'White gelatinous ppt';
                    this.obsLog.nh3 = 'Dropwise: White ppt formed';
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 3B: Add Excess Aqueous Ammonia (NH3) to Tube 2 -> Dissolves (Confirms Zn2+)
            if (actionId === 'NH3_EXCESS' && this.currentStep === 3 && this.step3Stage === 1) {
                this.activeTube = 2;
                labScene?.setCameraPreset?.('tube2');
                fx?.playReagentDropper?.('nh3', 2, 5, () => {
                    this.step3Stage = 2;
                    this.tubes[2].volume = 0.78;
                    this.tubes[2].liquidColor = 0xe0f2fe;
                    this.tubes[2].liquidOpacity = 0.40;
                    this.tubes[2].pptHeight = 0.0;
                    this.tubes[2].pptOpacity = 0.0;
                    this.tubes[2].turbidity = 0.0;
                    this.tubes[2].statusText = 'Ppt soluble in excess (Zn²⁺)';
                    this.obsLog.nh3 = 'White ppt soluble in excess → Zn²⁺ confirmed!';
                    this.currentStep = 4;
                    this.activeTube = 3;
                    setTimeout(() => {
                        labScene?.setCameraPreset?.('tube3');
                        syncAll?.(this.getSnapshot());
                    }, 450);
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 4A: Acidify Tube 3 with Dilute HNO3
            if (actionId === 'ADD_HNO3' && this.currentStep === 4 && this.step4Stage === 0) {
                this.activeTube = 3;
                labScene?.setCameraPreset?.('tube3');
                fx?.playReagentDropper?.('hno3', 3, 3, () => {
                    this.step4Stage = 1;
                    this.tubes[3].volume = 0.54;
                    this.tubes[3].statusText = 'Acidified with HNO₃ (no effervescence)';
                    this.obsLog.halide = 'HNO₃ added: No effervescence (CO₃²⁻ absent)';
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 4B: Add 0.1M AgNO3 to Tube 3 -> No precipitate (Cl-, Br-, I- absent)
            if (actionId === 'ADD_AGNO3' && this.currentStep === 4 && this.step4Stage === 1) {
                this.activeTube = 3;
                labScene?.setCameraPreset?.('tube3');
                fx?.playReagentDropper?.('agno3', 3, 3, () => {
                    this.step4Stage = 2;
                    this.tubes[3].volume = 0.68;
                    this.tubes[3].statusText = 'No white/cream ppt (Halides absent)';
                    this.obsLog.halide = 'No precipitate → Cl⁻, Br⁻, I⁻ absent';
                    this.currentStep = 5;
                    this.activeTube = 4;
                    setTimeout(() => {
                        labScene?.setCameraPreset?.('tube4');
                        syncAll?.(this.getSnapshot());
                    }, 450);
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 5A: Acidify Tube 4 with Dilute HCl
            if (actionId === 'ADD_HCL' && this.currentStep === 5 && this.step5Stage === 0) {
                this.activeTube = 4;
                labScene?.setCameraPreset?.('tube4');
                fx?.playReagentDropper?.('hcl', 4, 3, () => {
                    this.step5Stage = 1;
                    this.tubes[4].volume = 0.54;
                    this.tubes[4].statusText = 'Acidified with dil. HCl';
                    this.obsLog.sulphate = 'Acidified with HCl: Ready for BaCl₂';
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 5B: Add 0.1M BaCl2 to Tube 4 -> Dense White Precipitate of BaSO4
            if (actionId === 'ADD_BACL2' && this.currentStep === 5 && this.step5Stage === 1) {
                this.activeTube = 4;
                labScene?.setCameraPreset?.('tube4');
                fx?.playReagentDropper?.('bacl2', 4, 4, () => {
                    this.step5Stage = 2;
                    this.tubes[4].volume = 0.72;
                    this.tubes[4].liquidColor = 0xf1f5f9;
                    this.tubes[4].liquidOpacity = 0.90;
                    this.tubes[4].pptHeight = 0.92;
                    this.tubes[4].pptOpacity = 0.98;
                    this.tubes[4].turbidity = 0.95;
                    this.tubes[4].statusText = 'Dense white ppt (BaSO₄)';
                    this.obsLog.sulphate = 'Thick white ppt insoluble in HCl → SO₄²⁻ confirmed!';
                    this.currentStep = 6;
                    setTimeout(() => {
                        labScene?.setCameraPreset?.('rack');
                        syncAll?.(this.getSnapshot());
                    }, 500);
                    resolve(this.getSnapshot());
                });
                return;
            }

            // STEP 6: Confirm Final KCSE Deduction (ZnSO4)
            if (actionId === 'CONFIRM_IDENTIFICATION' && this.currentStep === 6) {
                this.completed = true;
                labScene?.setCameraPreset?.('bench');
                fx?.playCompletionSparkle?.();
                resolve(this.getSnapshot());
                return;
            }

            resolve(this.getSnapshot());
        });
    }

    getStepMetadata() {
        const steps = [
            {
                step: 1,
                title: 'Dissolve Solid M & Divide into 4 Portions',
                instruction:
                    'Transfer a spatulaful of unknown Solid M into a clean boiling tube, dissolve in 10 cm³ of distilled water, and divide equally into 4 test tubes in the rack.',
                statusLabel: 'Sample Ready',
                statusTone: 'status-neutral',
                actions: [
                    {
                        id: 'PREPARE_PORTIONS',
                        label: 'Dissolve Solid M & Fill 4 Test Tubes →',
                        style: 'btn-primary full-width',
                    },
                ],
            },
            {
                step: 2,
                title: 'Portion 1: Test with 2M Sodium Hydroxide (NaOH)',
                instruction:
                    this.step2Stage === 0
                        ? 'To the 1st portion in Test Tube 1, add 2M NaOH solution dropwise while swirling and observe whether a precipitate forms.'
                        : 'A white gelatinous precipitate of Zn(OH)₂ has formed! Now add 2M NaOH in excess to see if the precipitate redissolves.',
                statusLabel:
                    this.step2Stage === 0
                        ? 'Tube 1: Awaiting NaOH'
                        : 'White Ppt Formed',
                statusTone: this.step2Stage === 0 ? 'status-neutral' : 'status-warning',
                actions:
                    this.step2Stage === 0
                        ? [
                            {
                                id: 'NAOH_DROPWISE',
                                label: '+ Add 2M NaOH Dropwise (Tube 1) →',
                                style: 'btn-primary full-width',
                            },
                        ]
                        : [
                            {
                                id: 'NAOH_EXCESS',
                                label: '+ Add Excess 2M NaOH (Dissolve Ppt) →',
                                style: 'btn-accent full-width',
                            },
                            {
                                id: 'SWIRL_TUBE',
                                label: 'Swirl Test Tube 1',
                                style: 'btn-secondary full-width',
                            },
                        ],
            },
            {
                step: 3,
                title: 'Portion 2: Confirmatory Cation Test with 2M NH₃(aq)',
                instruction:
                    this.step3Stage === 0
                        ? 'Since Zn²⁺, Al³⁺, and Pb²⁺ all dissolve in excess NaOH, add 2M Aqueous Ammonia (NH₃) dropwise to Portion 2 in Test Tube 2.'
                        : 'White precipitate formed! Now add excess 2M NH₃(aq). Only Zn(OH)₂ dissolves in excess ammonia to form [Zn(NH₃)₄]²⁺.',
                statusLabel:
                    this.step3Stage === 0
                        ? 'Tube 2: Awaiting NH₃'
                        : 'White Ppt (Tube 2)',
                statusTone: this.step3Stage === 0 ? 'status-neutral' : 'status-warning',
                actions:
                    this.step3Stage === 0
                        ? [
                            {
                                id: 'NH3_DROPWISE',
                                label: '+ Add 2M NH₃(aq) Dropwise (Tube 2) →',
                                style: 'btn-primary full-width',
                            },
                        ]
                        : [
                            {
                                id: 'NH3_EXCESS',
                                label: '+ Add Excess 2M NH₃(aq) to Confirm Zn²⁺ →',
                                style: 'btn-accent full-width',
                            },
                            {
                                id: 'SWIRL_TUBE',
                                label: 'Swirl Test Tube 2',
                                style: 'btn-secondary full-width',
                            },
                        ],
            },
            {
                step: 4,
                title: 'Portion 3: Halide & Carbonate Anion Test (HNO₃ + AgNO₃)',
                instruction:
                    this.step4Stage === 0
                        ? 'To the 3rd portion in Test Tube 3, first add dilute Nitric Acid (HNO₃) to check for carbonate effervescence and prevent false precipitates.'
                        : 'No effervescence observed (CO₃²⁻ absent). Now add 3 drops of 0.1M Silver Nitrate (AgNO₃) to test for Cl⁻, Br⁻, or I⁻.',
                statusLabel:
                    this.step4Stage === 0
                        ? 'Tube 3: Acidify First'
                        : 'HNO₃ Added — Add AgNO₃',
                statusTone: 'status-neutral',
                actions:
                    this.step4Stage === 0
                        ? [
                            {
                                id: 'ADD_HNO3',
                                label: '1. Acidify Tube 3 with Dilute HNO₃ →',
                                style: 'btn-primary full-width',
                            },
                        ]
                        : [
                            {
                                id: 'ADD_AGNO3',
                                label: '2. Add 0.1M AgNO₃ Solution (Tube 3) →',
                                style: 'btn-accent full-width',
                            },
                            {
                                id: 'SWIRL_TUBE',
                                label: 'Swirl Test Tube 3',
                                style: 'btn-secondary full-width',
                            },
                        ],
            },
            {
                step: 5,
                title: 'Portion 4: Sulphate Anion Test (Dil. HCl + BaCl₂)',
                instruction:
                    this.step5Stage === 0
                        ? 'To the 4th portion in Test Tube 4, add dilute Hydrochloric Acid (HCl) first to destroy any sulphite or carbonate interference.'
                        : 'Now add 0.1M Barium Chloride (BaCl₂) solution. Formation of a thick white precipitate confirms Sulphate ions (SO₄²⁻).',
                statusLabel:
                    this.step5Stage === 0
                        ? 'Tube 4: Acidify First'
                        : 'Ready for BaCl₂',
                statusTone: this.step5Stage === 0 ? 'status-neutral' : 'status-warning',
                actions:
                    this.step5Stage === 0
                        ? [
                            {
                                id: 'ADD_HCL',
                                label: '1. Acidify Tube 4 with Dilute HCl →',
                                style: 'btn-primary full-width',
                            },
                        ]
                        : [
                            {
                                id: 'ADD_BACL2',
                                label: '2. Add 0.1M BaCl₂ (Confirm SO₄²⁻) →',
                                style: 'btn-primary full-width',
                            },
                            {
                                id: 'SWIRL_TUBE',
                                label: 'Swirl Test Tube 4',
                                style: 'btn-secondary full-width',
                            },
                        ],
            },
            {
                step: 6,
                title: this.completed
                    ? 'Qualitative Analysis Complete: Solid M = Zinc Sulphate (ZnSO₄)'
                    : 'Deduce Cation & Anion Identity of Solid M',
                instruction: this.completed
                    ? 'Excellent practical work! Cation = Zn²⁺ (white ppt soluble in both excess NaOH and excess NH₃). Anion = SO₄²⁻ (white BaSO₄ ppt insoluble in dil. HCl). Click Reset Lab to practice again.'
                    : 'Review your 4 test tube observations in the Observation Log below and record the final chemical identity of Solid M.',
                statusLabel: this.completed ? 'ZnSO₄ Verified ✓' : 'Ready to Conclude',
                statusTone: 'status-success',
                actions: this.completed
                    ? [
                        {
                            id: 'SWIRL_TUBE',
                            label: 'Zn²⁺ and SO₄²⁻ Recorded ✓ (Inspect Rack)',
                            style: 'btn-secondary full-width',
                            disabled: true,
                        },
                    ]
                    : [
                        {
                            id: 'CONFIRM_IDENTIFICATION',
                            label: 'Confirm Identity: Cation Zn²⁺ & Anion SO₄²⁻ ✓',
                            style: 'btn-primary full-width',
                        },
                    ],
            },
        ];

        return steps[this.currentStep - 1];
    }

    getSnapshot() {
        const activeTubeObj = this.tubes[this.activeTube];
        return {
            currentStep: this.currentStep,
            activeTube: this.activeTube,
            tubes: JSON.parse(JSON.stringify(this.tubes)),
            completed: this.completed,
            stepMeta: this.getStepMetadata(),
            allSteps: [
                'Dissolve Solid M & divide into 4 portions',
                'Test Portion 1 with dropwise & excess NaOH',
                'Test Portion 2 with dropwise & excess NH₃(aq)',
                'Test Portion 3 with dil. HNO₃ + AgNO₃',
                'Test Portion 4 with dil. HCl + BaCl₂',
                'Deduce Cation (Zn²⁺) & Anion (SO₄²⁻)',
            ],
            cameraPresets: [
                { id: 'bench', label: 'Full Bench View' },
                { id: 'rack', label: 'Zoom Test Tube Rack' },
                { id: `tube${this.activeTube}`, label: `Zoom Active Tube (${this.activeTube})` },
                { id: 'reagents', label: 'Zoom Reagent Tray' },
            ],
            instrument: {
                tabLabel: 'Observations',
                title: 'KCSE Qualitative Observation Log',
                primaryLabel: `Active Tube ${this.activeTube} Status`,
                primaryValue: `Tube ${this.activeTube}`,
                primaryUnit: activeTubeObj.statusText,
                rows: [
                    { label: '1. NaOH Test', value: this.obsLog.naoh },
                    { label: '2. NH₃(aq) Test', value: this.obsLog.nh3 },
                    { label: '3. AgNO₃ Test', value: this.obsLog.halide },
                    { label: '4. BaCl₂ Test', value: this.obsLog.sulphate },
                ],
            },
        };
    }
}

export default ExperimentState;