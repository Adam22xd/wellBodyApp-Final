import { useState } from "react";

interface CompleteProfileFormProps {
  initialCalorieGoal: number;
  initialWaterGoal: number;
  onSubmit: (calorieGoal: number, waterGoal: number) => Promise<void>;
}

export default function CompleteProfileForm({
  initialCalorieGoal,
  initialWaterGoal,
  onSubmit,
}: CompleteProfileFormProps) {
  const [calorieGoal, setCalorieGoal] = useState(
    initialCalorieGoal > 0 ? String(initialCalorieGoal) : "",
  );
  const [waterGoal, setWaterGoal] = useState(
    initialWaterGoal > 0 ? String(initialWaterGoal) : "",
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextCalorieGoal = Number(calorieGoal);
    const nextWaterGoal = Number(waterGoal);

    if (nextCalorieGoal <= 0 || nextWaterGoal <= 0) {
      setError("Ustaw oba cele, aby zakończyć rejestrację.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await onSubmit(nextCalorieGoal, nextWaterGoal);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Nie udało się zapisać ustawień profilu.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="containerRegistration" onSubmit={handleSubmit}>
      <div className="registrationbox">
        <p className="reg-text">Dokończ konfigurację konta</p>
        <p className="form-subtitle">
          Ustaw dzienne cele, aby przejść do aplikacji.
        </p>

        <input
          className="reg-input-email"
          type="number"
          min="1"
          placeholder="Cel kalorii"
          value={calorieGoal}
          onChange={(event) => setCalorieGoal(event.target.value)}
        />

        <input
          className="reg-input-pass"
          type="number"
          min="1"
          placeholder="Cel wody (ml)"
          value={waterGoal}
          onChange={(event) => setWaterGoal(event.target.value)}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Zapisywanie..." : "Zapisz i przejdź dalej"}
        </button>
      </div>
    </form>
  );
}
