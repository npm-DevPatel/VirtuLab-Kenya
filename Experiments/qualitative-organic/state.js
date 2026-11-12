export class ExperimentState {
    constructor(experiment) {
        this.experiment = experiment;
        this.totalSteps = 6;
        this.reset();
    }

    reset() {
        this.currentStep = 1;
        this.completed = false;
        this.status = 'READY';
        this.statusText = 'Sample Z Ready';

        // Apparatus & Chemical States
        this.burnerLit = false;
        this.flameType = 'none'; // 'none' | 'bunsen' | 'sooty'
        this.spatulaHasSample = false;
        this.spatulaSootLevel = 0; // 0.0 to 1.0 black carbon deposit on spatula tip

        // Litmus paper states ('dry' | 'acidic')
        this.blueLitmusState = 'dry';
        this.redLitmusState = 'dry';

        // 3 Test Tubes (A: Bromine Water, B: H+/KMnO4, C: Litmus + NaHCO3)
        this.tubes = {
            A: {
                volume: 0.0,
                color: 0xf4f8fb,
                opacity: 0.32,
                bromineAdded: false,
                decolourised: false,
                effervescence: 0.0,
            },
            B: {
                volume: 0.0,
                color: 0xf4f8fb,
                opacity: 0.32,
                kmno4Added: false,
                decolourised: false,
                effervescence: 0.0,
            },
            C: {
                volume: 0.0,
                color: 0xf4f8fb,
                opacity: 0.32,
                litmusTested: false,
                nahco3Added: false,
                effervescence: 0.0,
                foamLevel: 0.0,
            },
        };

        // Progressive KCSE Paper 3 Q3 Observation & Inference Table
        this.observations = [
            {
                test: '1. Divide Liquid Z into 3 portions (A, B, C) & scoop sample',
                obs: 'Clear, colourless organic liquid with a sharp characteristic odour',
                inf: 'Soluble polar organic compound',
                done: false,
            },
            {
                test: '2. Ignite Liquid Z on metallic spatula in Bunsen flame',
                obs: 'Pending test...',
                inf: 'Pending...',
                done: false,
            },
            {
                test: '3. Portion A + 3 drops of Bromine water, Br₂(aq)',
                obs: 'Pending test...',
                inf: 'Pending...',
                done: false,
            },
            {
                test: '4. Portion B + 3 drops of acidified KMnO₄(aq)',
                obs: 'Pending test...',
                inf: 'Pending...',
                done: false,
            },
            {
                test: '5. Portion C + Moist Litmus papers, then solid NaHCO₃',
                obs: 'Pending test...',
                inf: 'Pending...',
                done: false,
            },
        ];
    }

    handleAction(actionId, payload, { labScene, fx, syncAll }) {
        switch (actionId) {
            case 'DIVIDE_SAMPLE': {
                this.statusText = 'Dividing Liquid Z...';
                syncAll(this.getSnapshot());

                labScene.setCameraPreset?.('bench');
                fx.playDivideSampleAnimation(
                    (tubeKey) => {
                        if (tubeKey === 'spatula') {
                            this.spatulaHasSample = true;
                        } else if (this.tubes[tubeKey]) {
                            this.tubes[tubeKey].volume = 2.5;
                            this.tubes[tubeKey].color = 0xf0f7ff;
                            this.tubes[tubeKey].opacity = 0.36;
                        }
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        this.observations[0].done = true;
                        this.currentStep = 2;
                        this.statusText = '3 Portions Ready';
                        labScene.setCameraPreset?.('burner');
                        syncAll(this.getSnapshot());
                    }
                );
                return this.getSnapshot();
            }

            case 'IGNITE_SPATULA': {
                this.burnerLit = true;
                this.flameType = 'bunsen';
                this.statusText = 'Igniting Sample Z...';
                labScene.setCameraPreset?.('burner');
                syncAll(this.getSnapshot());

                fx.playSpatulaIgnitionAnimation(
                    () => {
                        // Spatula enters flame -> roaring yellow smoky/sooty flame
                        this.flameType = 'sooty';
                        this.spatulaSootLevel = 1.0;
                        this.statusText = 'Luminous Sooty Flame!';
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        this.flameType = 'bunsen';
                        this.burnerLit = false;
                        this.observations[1].obs = 'Burns with a yellow, luminous smoky (sooty) flame';
                        this.observations[1].inf = 'C=C or C≡C unsaturated organic compound (high C:H ratio)';
                        this.observations[1].done = true;
                        this.currentStep = 3;
                        this.statusText = 'Unsaturation Suspected';
                        labScene.setCameraPreset?.('rack');
                        syncAll(this.getSnapshot());
                    }
                );
                return this.getSnapshot();
            }

            case 'ADD_BROMINE': {
                this.statusText = 'Adding Br₂(aq) to Tube A...';
                labScene.setCameraPreset?.('tubeA');
                syncAll(this.getSnapshot());

                fx.playBromineTestAnimation(
                    (dropStep) => {
                        // Briefly show orange-red bromine tint before swirl decolourises it
                        this.tubes.A.bromineAdded = true;
                        this.tubes.A.volume = 2.8;
                        if (dropStep < 3) {
                            this.tubes.A.color = 0xea580c;
                            this.tubes.A.opacity = 0.65;
                        } else {
                            this.tubes.A.color = 0xf97316;
                            this.tubes.A.opacity = 0.55;
                        }
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        // Decolourised upon swirling (addition across C=C bond)
                        this.tubes.A.decolourised = true;
                        this.tubes.A.color = 0xf4f9ff;
                        this.tubes.A.opacity = 0.34;
                        this.observations[2].obs = 'Yellow-orange bromine water is instantly decolourised';
                        this.observations[2].inf = 'C=C double bond (alkene functional group) confirmed';
                        this.observations[2].done = true;
                        this.currentStep = 4;
                        this.statusText = 'Br₂(aq) Decolourised';
                        syncAll(this.getSnapshot());
                    }
                );
                return this.getSnapshot();
            }

            case 'ADD_KMNO4': {
                this.statusText = 'Adding H⁺/KMnO₄ to Tube B...';
                labScene.setCameraPreset?.('tubeB');
                syncAll(this.getSnapshot());

                fx.playKMnO4TestAnimation(
                    (dropStep) => {
                        // Briefly show deep purple KMnO4 tint before swirl decolourises it
                        this.tubes.B.kmno4Added = true;
                        this.tubes.B.volume = 2.8;
                        if (dropStep < 3) {
                            this.tubes.B.color = 0x7e22ce;
                            this.tubes.B.opacity = 0.78;
                        } else {
                            this.tubes.B.color = 0x9333ea;
                            this.tubes.B.opacity = 0.62;
                        }
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        // Purple KMnO4 decolourised to colourless diol
                        this.tubes.B.decolourised = true;
                        this.tubes.B.color = 0xf6f8fc;
                        this.tubes.B.opacity = 0.35;
                        this.observations[3].obs = 'Purple acidified KMnO₄(aq) turns colourless immediately';
                        this.observations[3].inf = 'C=C double bond or oxidisable -OH group present';
                        this.observations[3].done = true;
                        this.currentStep = 5;
                        this.statusText = 'KMnO₄ Decolourised';
                        syncAll(this.getSnapshot());
                    }
                );
                return this.getSnapshot();
            }

            case 'TEST_CARBOXYLIC': {
                this.statusText = 'Testing Portion C...';
                labScene.setCameraPreset?.('tubeC');
                syncAll(this.getSnapshot());

                fx.playCarboxylicTestAnimation(
                    () => {
                        // Phase 1: Litmus paper dip -> Blue litmus turns Red
                        this.tubes.C.litmusTested = true;
                        this.blueLitmusState = 'acidic';
                        this.redLitmusState = 'acidic';
                        this.statusText = 'Blue Litmus → Red (pH ≈ 3)';
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        // Phase 2: NaHCO3 solid added -> brisk CO2 effervescence
                        this.tubes.C.nahco3Added = true;
                        this.tubes.C.volume = 3.1;
                        this.tubes.C.effervescence = 1.0;
                        this.tubes.C.foamLevel = 1.0;
                        this.statusText = 'Brisk CO₂ Effervescence!';
                        syncAll(this.getSnapshot());
                    },
                    () => {
                        this.tubes.C.effervescence = 0.25;
                        this.tubes.C.foamLevel = 0.35;
                        this.observations[4].obs =
                            'Blue litmus turns red; brisk effervescence of colourless gas with NaHCO₃(s)';
                        this.observations[4].inf = 'Carboxylic acid (-COOH) functional group confirmed';
                        this.observations[4].done = true;
                        this.currentStep = 6;
                        this.completed = true;
                        this.statusText = 'Z = Unsaturated Acid';
                        labScene.setCameraPreset?.('bench');
                        syncAll(this.getSnapshot());
                    }
                );
                return this.getSnapshot();
            }

            case 'RESET_EXP': {
                this.reset();
                labScene.setCameraPreset?.('bench');
                syncAll(this.getSnapshot());
                return this.getSnapshot();
            }

            default:
                return this.getSnapshot();
        }
    }

    getStepMetadata() {
        const steps = [
            {
                index: 1,
                tag: 'STEP 1 OF 6',
                title: 'Divide Unknown Organic Liquid Z',
                shortTitle: 'Divide Liquid Z into Tubes A, B, C',
                instruction:
                    'You are provided with an unknown organic compound labelled Liquid Z. Divide Liquid Z equally into three clean test tubes (Portions A, B, and C) and place a small drop onto the metallic spatula for the ignition test.',
                actions: [
                    {
                        id: 'DIVIDE_SAMPLE',
                        label: 'Pour Liquid Z into Tubes A, B & C →',
                        style: 'btn-primary full-width',
                    },
                ],
            },
            {
                index: 2,
                tag: 'STEP 2 OF 6',
                title: 'Ignition Test on Metallic Spatula',
                shortTitle: 'Burn Liquid Z on Metallic Spatula',
                instruction:
                    'Light the Bunsen burner and hold the metallic spatula containing Liquid Z in the non-luminous flame. Observe whether the organic compound burns with a clean blue flame or a yellow smoky (sooty) flame.',
                actions: [
                    {
                        id: 'IGNITE_SPATULA',
                        label: 'Ignite Liquid Z in Bunsen Flame 🔥 →',
                        style: 'btn-primary full-width',
                    },
                ],
            },
            {
                index: 3,
                tag: 'STEP 3 OF 6',
                title: 'Test for Unsaturation: Bromine Water',
                shortTitle: 'Portion A + Bromine Water, Br₂(aq)',
                instruction:
                    'To the first portion (Tube A), add 3 drops of yellow-orange Bromine water, Br₂(aq), and shake gently to mix. Observe any rapid decolourisation across the carbon-carbon double bond.',
                actions: [
                    {
                        id: 'ADD_BROMINE',
                        label: 'Add 3 Drops Bromine Water to Tube A →',
                        style: 'btn-primary full-width',
                    },
                ],
            },
            {
                index: 4,
                tag: 'STEP 4 OF 6',
                title: "Baeyer's Test: Acidified KMnO₄(aq)",
                shortTitle: 'Portion B + Acidified KMnO₄(aq)',
                instruction:
                    'To the second portion (Tube B), add 3 drops of purple acidified Potassium Manganate(VII) solution (H⁺/KMnO₄) and swirl gently. Observe whether the purple permanganate ion is decolourised.',
                actions: [
                    {
                        id: 'ADD_KMNO4',
                        label: 'Add 3 Drops H⁺/KMnO₄ to Tube B →',
                        style: 'btn-primary btn-pink full-width',
                    },
                ],
            },
            {
                index: 5,
                tag: 'STEP 5 OF 6',
                title: 'Test for Carboxylic Acid: Litmus & NaHCO₃',
                shortTitle: 'Portion C + Litmus & Solid NaHCO₃',
                instruction:
                    'Test the third portion (Tube C) with moist blue and red litmus papers, then add a spatulaful of solid Sodium Hydrogen Carbonate (NaHCO₃). Watch for colour change on litmus and brisk CO₂ effervescence.',
                actions: [
                    {
                        id: 'TEST_CARBOXYLIC',
                        label: 'Test Litmus & Add Solid NaHCO₃ to Tube C →',
                        style: 'btn-accent full-width',
                    },
                ],
            },
            {
                index: 6,
                tag: 'STEP 6 OF 6 — COMPLETE',
                title: 'Deduction: Unsaturated Carboxylic Acid',
                shortTitle: 'Confirm >C=C< and -COOH Groups',
                instruction:
                    'All KCSE Paper 3 Question 3 functional group tests are complete! Liquid Z burns with a sooty flame, decolourises both Br₂(aq) and H⁺/KMnO₄(aq), turns blue litmus red, and liberates CO₂(g) with NaHCO₃ — confirming both an Alkene (>C=C<) and Carboxylic Acid (-COOH) group (e.g., Propenoic / Maleic acid).',
                actions: [
                    {
                        id: 'RESET_EXP',
                        label: '↺ Repeat Organic Analysis',
                        style: 'btn-secondary full-width',
                    },
                ],
            },
        ];

        return steps[this.currentStep - 1] || steps[0];
    }

    getSnapshot() {
        const stepMeta = this.getStepMetadata();
        const completedCount = this.observations.filter((o) => o.done).length;

        let deducedGroups = 'Awaiting Tests...';
        if (completedCount === 2) deducedGroups = 'Unsaturated (>C=C< suspected)';
        else if (completedCount === 3 || completedCount === 4) deducedGroups = 'Alkene (>C=C<) Confirmed';
        else if (completedCount >= 5) deducedGroups = '>C=C< and -COOH Confirmed';

        return {
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            completed: this.completed,
            status: this.status,
            statusText: this.statusText,
            stepMeta,
            burnerLit: this.burnerLit,
            flameType: this.flameType,
            spatulaHasSample: this.spatulaHasSample,
            spatulaSootLevel: this.spatulaSootLevel,
            blueLitmusState: this.blueLitmusState,
            redLitmusState: this.redLitmusState,
            tubes: JSON.parse(JSON.stringify(this.tubes)),
            allSteps: [
                { index: 1, shortTitle: 'Divide Liquid Z into A, B, C' },
                { index: 2, shortTitle: 'Ignition Test (Sooty Flame)' },
                { index: 3, shortTitle: 'Portion A + Bromine Water' },
                { index: 4, shortTitle: 'Portion B + Acidified KMnO₄' },
                { index: 5, shortTitle: 'Portion C + Litmus & NaHCO₃' },
                { index: 6, shortTitle: 'Deduce >C=C< & -COOH Groups' },
            ],
            instrument: {
                tabLabel: 'Observations',
                title: 'KCSE 233/3 Q3 — Organic Functional Log',
                primaryLabel: 'Identified Functional Groups',
                primaryValue: deducedGroups,
                primaryUnit: '',
                rows: this.observations.map((o) => ({
                    label: o.test,
                    value: o.done ? `${o.obs} → [${o.inf}]` : 'Pending...',
                })),
            },
            cameraPresets: [
                { id: 'bench', label: 'Full Bench View' },
                { id: 'burner', label: 'Bunsen Burner & Spatula' },
                { id: 'rack', label: 'Test Tube Rack (A, B, C)' },
                { id: 'tubeA', label: 'Zoom Tube A (Br₂ Test)' },
                { id: 'tubeB', label: 'Zoom Tube B (KMnO₄ Test)' },
                { id: 'tubeC', label: 'Zoom Tube C (NaHCO₃ Test)' },
            ],
        };
    }
}

export default ExperimentState;