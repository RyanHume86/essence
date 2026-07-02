import React, { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/hooks/usePrefs";
import { Input } from "@/components/ui/input";
import Companion from "@/components/companion/Companion";
import SchemePicker from "@/components/settings/SchemePicker";
import CreaturePicker from "@/components/settings/CreaturePicker";

// First-run onboarding: name → scheme → creature → welcome. Three calm choices,
// no tutorial. Persists through usePrefs (localStorage); picking a scheme
// re-skins this screen live. Completion sets `onboarded`, which drops the gate
// in App.jsx and lands the user on the (empty) Focus surface.
const STEPS = ["name", "scheme", "creature", "welcome"];

export default function Onboarding() {
  const { name, scheme, creature, setName, setScheme, setCreature, setOnboarded } = usePrefs();
  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState(name || "");
  const stepRef = useRef(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const commitName = () => {
    setName(nameInput);
    next();
  };

  // Move focus to the step's first control on each step (a11y — never trap).
  useEffect(() => {
    stepRef.current?.querySelector("input, button")?.focus();
  }, [step]);

  return (
    <div className="fixed inset-0 overflow-y-auto bg-background text-foreground safe-top safe-bottom">
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12">
        <div ref={stepRef} className="w-full max-w-sm">
          {/* Quiet step marker — small dots, never a loud progress bar */}
          <div className="flex items-center justify-center gap-2 mb-10" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                  i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* ── Step 1: name ── */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl font-semibold text-foreground">What should I call you?</h1>
                <p className="text-sm text-muted-foreground">A name to greet you by — you can leave it blank.</p>
              </div>
              <div>
                <label htmlFor="ob-name" className="sr-only">Your name</label>
                <Input
                  id="ob-name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && commitName()}
                  placeholder="Your name"
                  className="input-glow surface-raised h-12 rounded-2xl border-border px-5 text-center text-base"
                />
              </div>
              <button
                type="button"
                onClick={commitName}
                className="btn-accent-3d w-full h-12 rounded-2xl text-primary-foreground font-semibold text-sm select-none"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── Step 2: colour scheme (live re-skin) ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h1 className="font-heading text-2xl font-semibold text-foreground">Choose your space</h1>
                <p className="text-sm text-muted-foreground">Pick a colour scheme — you'll feel it right away.</p>
              </div>
              <SchemePicker value={scheme} onSelect={setScheme} />
              <div className="flex gap-3">
                <button type="button" onClick={back} className="h-12 px-5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
                  Back
                </button>
                <button type="button" onClick={next} className="btn-accent-3d flex-1 h-12 rounded-2xl text-primary-foreground font-semibold text-sm select-none">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: creature ── */}
          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl font-semibold text-foreground">Meet your companion</h1>
                <p className="text-sm text-muted-foreground">Quiet company as you go — never in the way.</p>
              </div>
              <CreaturePicker value={creature} onSelect={setCreature} />
              <div className="flex gap-3 justify-center">
                <button type="button" onClick={back} className="h-12 px-5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors select-none">
                  Back
                </button>
                <button type="button" onClick={next} className="btn-accent-3d flex-1 h-12 rounded-2xl text-primary-foreground font-semibold text-sm select-none">
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: warm welcome ── */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <Companion />
              <div className="space-y-1.5">
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  {name ? `This space is yours, ${name}.` : "This space is yours."}
                </h1>
                <p className="text-sm text-muted-foreground">No rush. We'll take it one thing at a time.</p>
              </div>
              <button
                type="button"
                onClick={() => setOnboarded(true)}
                className="btn-accent-3d w-full h-12 rounded-2xl text-primary-foreground font-semibold text-sm select-none"
              >
                Enter Akha
              </button>
              <p className="text-xs text-muted-foreground/70">You can change any of this later in Settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
