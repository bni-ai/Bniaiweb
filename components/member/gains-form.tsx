"use client";

import { useRef, useState } from "react";

import { updateMyGainsAction } from "../../lib/actions/members";

type GainsValues = {
  gains_goals: string;
  gains_accomplishments: string;
  gains_interests: string;
  gains_networks: string;
  gains_skills: string;
};

const fields: Array<{ key: keyof GainsValues; label: string; accent: string }> = [
  { key: "gains_goals", label: "Goals", accent: "bg-[#fff1ea]" },
  { key: "gains_accomplishments", label: "Accomplishments", accent: "bg-[#fff7e8]" },
  { key: "gains_interests", label: "Interests", accent: "bg-[#eef6ff]" },
  { key: "gains_networks", label: "Networks", accent: "bg-[#f4f3ff]" },
  { key: "gains_skills", label: "Skills", accent: "bg-[#eefbf2]" },
];

function sameValues(left: GainsValues, right: GainsValues) {
  return fields.every(({ key }) => left[key] === right[key]);
}

export function GainsForm({
  initialValues,
  forceError = false,
}: {
  initialValues: GainsValues;
  forceError?: boolean;
}) {
  const [values, setValues] = useState<GainsValues>(initialValues);
  const [status, setStatus] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("離開欄位後會在 500ms 內自動儲存。");
  const lastSavedRef = useRef(initialValues);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(nextValues: GainsValues) {
    if (sameValues(nextValues, lastSavedRef.current)) {
      setStatus("saved");
      setMessage("目前內容已同步。");
      return;
    }

    setStatus("saving");
    setMessage("儲存中...");
    const formData = new FormData();
    for (const { key } of fields) {
      formData.set(key, nextValues[key]);
    }
    if (forceError) {
      formData.set("__force_error", "true");
    }

    try {
      await updateMyGainsAction(formData);
      lastSavedRef.current = nextValues;
      setStatus("saved");
      setMessage("已自動儲存。");
    } catch {
      setStatus("error");
      setMessage("自動儲存失敗，內容已保留，請重試。");
    }
  }

  function queueSave(nextValues: GainsValues) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setStatus("dirty");
    setMessage("500ms 內自動儲存...");
    debounceRef.current = setTimeout(() => {
      void save(nextValues);
    }, 500);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm">
        <span className="font-medium text-text-1">狀態：</span>
        <span>{message}</span>
        {status === "error" ? (
          <button
            type="button"
            className="rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary"
            onClick={() => void save(values)}
          >
            重試
          </button>
        ) : null}
      </div>

      <div className="grid gap-4">
        {fields.map(({ key, label, accent }) => (
          <label key={key} className={`grid gap-2 rounded-[24px] border border-border p-4 text-sm ${accent}`}>
            <span className="font-medium">{label}</span>
            <textarea
              name={key}
              value={values[key]}
              onChange={(event) => {
                const nextValues = { ...values, [key]: event.target.value };
                setValues(nextValues);
                setStatus("dirty");
              }}
              onBlur={() => queueSave(values)}
              className="min-h-28 rounded-2xl border border-border bg-white px-3 py-2.5"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
