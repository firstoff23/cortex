import React from "react";

export default function CouncilStatus({
  lobosAtivos = 0,
  juizAtual = "Rei do Córtex",
  modoAtual = "Normal",
  estadoSessao = "Pronto",
}) {
  const itens = [
    { label: "Lobos", value: `${lobosAtivos} lobos ativos` },
    { label: "Juiz", value: juizAtual },
    { label: "Modo", value: modoAtual },
    { label: "Sessão", value: estadoSessao },
  ];

  return (
    <section className="council-status" aria-label="Estado do conselho">
      {itens.map((item) => (
        <div className="council-status__item" key={item.label}>
          <span className="council-status__label">{item.label}</span>
          <strong className="council-status__value">{item.value}</strong>
        </div>
      ))}
    </section>
  );
}
