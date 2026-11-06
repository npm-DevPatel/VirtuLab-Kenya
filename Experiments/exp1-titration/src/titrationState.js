export const STEPS = [
    {
        index: 1,
        tag: 'STEP 1 OF 5',
        title: 'Pipette 25.0 cm³ of 0.1M NaOH into Conical Flask',
        instruction:
            'Use the 25.0 cm³ volumetric pipette to draw Sodium Hydroxide (alkali) from the storage beaker on the left and transfer it into the conical flask resting on the white tile.',
    },
    {
        index: 2,
        tag: 'STEP 2 OF 5',
        title: 'Add 2–3 Drops of Phenolphthalein Indicator',
        instruction:
            'Add phenolphthalein indicator from the amber dropper bottle into the conical flask. In alkaline NaOH solution (pH > 10), phenolphthalein turns vibrant magenta-pink.',
    },
    {
        index: 3,
        tag: 'STEP 3 OF 5',
        title: 'Verify Initial Burette Reading (0.00 cm³)',
        instruction:
            'Inspect the 50.0 cm³ burette filled with 0.1M Hydrochloric Acid (HCl). Check the Meniscus Zoom Loupe (or snap camera to Burette Scale) to confirm the bottom of the meniscus sits at 0.00 cm³.',
    },
    {
        index: 4,
        tag: 'STEP 4 OF 5',
        title: 'Titrate Until Permanent Color Discharge (End-Point)',
        instruction:
            'Hold "Fast Stream" to rapidly run HCl until ~23.50 cm³, then swirl and add "Single Drops (+0.05 cm³)" until a single drop permanently discharges the pink color to clear/colorless (Target: 24.80 cm³).',
    },
    {
        index: 5,
        tag: 'STEP 5 OF 5',
        title: 'Experiment Complete — Final Titre Recorded',
        instruction: '',
    },
];

export class TitrationState {
    constructor() {
        this.reset();
    }

    reset() {
        this.currentStep = 1;
        this.buretteVolume = 0.0; // cm³ of HCl dispensed (0.00 to 50.00)
        this.flaskVolume = 0.0;   // Starts empty until pipetted in Step 1!
        this.maxVolume = 50.0;
        this.targetEndpoint = 24.8; // Exact neutralization volume
        this.tolerance = 0.15;      // KCSE concordant range: 24.65 - 24.95 cm³
        this.indicatorAdded = false;
        this.liquidColorHex = 0x7dd3fc; // Clear sky-tinted alkali before indicator
        this.status = 'NEUTRAL'; // NEUTRAL | ALKALINE | NEAR_ENDPOINT | ENDPOINT | OVERSHOT
    }

    confirmStep1() {
        if (this.currentStep === 1) {
            this.flaskVolume = 25.0;
            this.liquidColorHex = 0xbae6fd; // Visible clear aqueous solution
            this.currentStep = 2;
        }
        return this.getSnapshot();
    }

    addIndicator() {
        if (this.currentStep === 2) {
            this.indicatorAdded = true;
            this.liquidColorHex = 0xe11d74; // Deep, high-contrast phenolphthalein magenta
            this.status = 'ALKALINE';
            this.currentStep = 3;
        }
        return this.getSnapshot();
    }

    confirmMeniscus() {
        if (this.currentStep === 3) {
            this.currentStep = 4;
        }
        return this.getSnapshot();
    }

    dispenseAcid(amountCm3) {
        if (this.currentStep !== 4) return this.getSnapshot();

        this.buretteVolume = Math.min(
            this.maxVolume,
            parseFloat((this.buretteVolume + amountCm3).toFixed(2))
        );
        this.flaskVolume = parseFloat((25.0 + this.buretteVolume).toFixed(2));

        const diff = this.targetEndpoint - this.buretteVolume;

        if (diff > 1.3) {
            this.liquidColorHex = 0xe11d74; // Vibrant magenta
            this.status = 'ALKALINE';
        } else if (diff > 0.45) {
            this.liquidColorHex = 0xf472b6; // Medium rose pink
            this.status = 'NEAR_ENDPOINT';
        } else if (diff > this.tolerance) {
            this.liquidColorHex = 0xfbcfe8; // Very pale pink (1-2 drops away)
            this.status = 'NEAR_ENDPOINT';
        } else if (Math.abs(diff) <= this.tolerance) {
            this.liquidColorHex = 0xdbeafe; // Crisp water-clear neutralized solution
            this.status = 'ENDPOINT';
        } else {
            this.liquidColorHex = 0xdbeafe; // Colorless in excess acid
            this.status = 'OVERSHOT';
        }

        return this.getSnapshot();
    }

    finishTitration() {
        if (this.currentStep === 4) {
            this.currentStep = 5;
        }
        return this.getSnapshot();
    }

    getSnapshot() {
        const stepMeta = { ...STEPS[this.currentStep - 1] };

        if (this.currentStep === 5) {
            const vol = this.buretteVolume.toFixed(2);
            if (this.status === 'ENDPOINT') {
                stepMeta.instruction = `Full Marks (KCSE Concordant Titre)! You hit the exact colorless end-point at ${vol} cm³ (theoretical value: 24.80 cm³). NaOH + HCl → NaCl + H₂O.`;
            } else if (this.status === 'OVERSHOT') {
                stepMeta.instruction = `Recorded ${vol} cm³. You overshot the 24.80 cm³ neutralization point by ${(this.buretteVolume - this.targetEndpoint).toFixed(2)} cm³. Click "Reset Lab" to practice dropwise precision.`;
            } else {
                stepMeta.instruction = `Recorded ${vol} cm³ early! The solution in the flask is still pink (unreacted NaOH remains). Target end-point was 24.80 cm³.`;
            }
        }

        return {
            currentStep: this.currentStep,
            stepMeta,
            buretteVolume: this.buretteVolume,
            flaskVolume: this.flaskVolume,
            liquidColorHex: this.liquidColorHex,
            status: this.status,
            indicatorAdded: this.indicatorAdded,
        };
    }
}