import { useState } from "react";

export default function useSteps(initial = 1) {
    const [step, setStep] = useState(initial);

    const nextStep = () => setStep((s) => s + 1);
    const resetSteps = () => setStep(initial);

    return { step, nextStep, resetSteps };
}
