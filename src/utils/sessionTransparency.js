function readLabel(item) {
  const label = item?.nome || item?.name || item?.label || item?.id;
  return typeof label === "string" && label.trim() ? label.trim() : null;
}

function sourceKey(source) {
  if (typeof source === "string") return source.trim().toLowerCase();
  if (source && typeof source === "object") {
    return String(source.url || source.href || source.title || "").trim().toLowerCase();
  }
  return "";
}

/**
 * Produz apenas metadados de execução verificáveis para apresentação na UI.
 * Não recebe nem devolve prompts, raciocínio intermédio ou segredos.
 */
export function buildSessionTransparency(wolves = [], webSources = []) {
  const participants = Array.from(
    new Set(wolves.map(readLabel).filter(Boolean)),
  );
  const sources = Array.isArray(webSources) ? webSources : [];
  const sourceCount = new Set(sources.map(sourceKey).filter(Boolean)).size;

  return {
    participants,
    participantCount: participants.length,
    sourceCount,
    hasExternalSources: sourceCount > 0,
  };
}
