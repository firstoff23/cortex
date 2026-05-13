import React from "react";

// Slider.jsx — controlo nativo de intervalo para configuração por lobo.
export default function Slider({
  valor = 0.7,
  onChange,
  min = 0,
  max = 1,
  passo = 0.1,
  cor = "var(--accent, #10b981)",
  label = "Temperatura",
}) {
  return (
    <label style={{ display: "grid", gap: 7, color: "var(--text, #8a8aa0)", fontSize: 11 }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span>{label}</span>
        <strong style={{ color: cor }}>{Number(valor).toFixed(1)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        onChange={(event) => onChange?.(Number(event.target.value))}
        aria-label={label}
        style={{
          width: "100%",
          accentColor: cor,
          cursor: "pointer",
        }}
      />
    </label>
  );
}
