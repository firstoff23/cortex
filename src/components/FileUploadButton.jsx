// FileUploadButton.jsx — botão de carregamento com arrastar-e-largar e clique
import { useRef, useState } from 'react';
import ErrorMessage from './ErrorMessage.jsx';

// Extensões aceites pelo input de ficheiro
const ACCEPT = '.pdf,.docx,.txt,.md,.csv,.xlsx,.mp3,.wav';

/**
 * Botão de carregamento de ficheiros com arrastar-e-largar.
 * Usa CSS variables do projecto (sem Tailwind).
 * @param {{ onFicheiro: (File) => void, ficheiro: object|null, erro: string|null, onLimpar: () => void }} props
 */
export default function FileUploadButton({ onFicheiro, ficheiro, erro, onLimpar }) {
  const inputRef    = useRef(null);
  const [drag, setDrag] = useState(false);

  // Validação básica antes de passar para cima
  function processar(file) {
    if (!file) return;
    onFicheiro(file);
  }

  function aoSoltar(e) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer?.files?.[0];
    processar(file);
  }

  function aoEscolher(e) {
    const file = e.target.files?.[0];
    processar(file);
    // Limpar input para permitir novo carregamento do mesmo ficheiro
    e.target.value = '';
  }

  // Estilos dependentes de estado
  const estiloBotao = {
    display:        'flex',
    alignItems:     'center',
    gap:            5,
    padding:        '6px 10px',
    borderRadius:   10,
    border:         `1px solid ${drag ? 'var(--accent, #10b981)' : 'var(--border, #2e303a)'}`,
    background:     drag
      ? 'rgba(16,185,129,0.12)'
      : ficheiro
        ? 'rgba(16,185,129,0.08)'
        : 'var(--s2, #14141e)',
    color:          ficheiro ? 'var(--accent, #10b981)' : 'var(--ts, #6868a0)',
    fontSize:       11,
    cursor:         'pointer',
    transition:     'all 0.18s ease',
    userSelect:     'none',
    whiteSpace:     'nowrap',
    maxWidth:       220,
  };

  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={aoSoltar}
    >
      {/* Input de ficheiro escondido */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={aoEscolher}
        style={{ display: 'none' }}
      />

      {ficheiro ? (
        /* Ficheiro carregado — mostra nome + botão limpar */
        <div style={estiloBotao}>
          <span style={{ fontSize: 13 }}>📄</span>
          <span
            style={{
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
              maxWidth:     140,
              color:        'var(--accent, #10b981)',
              fontSize:     10,
            }}
            title={ficheiro.nome}
          >
            {ficheiro.nome}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onLimpar(); }}
            title="Remover ficheiro"
            style={{
              background:  'transparent',
              border:      'none',
              cursor:      'pointer',
              color:       'var(--ts, #6868a0)',
              fontSize:    12,
              lineHeight:  1,
              padding:     0,
              flexShrink:  0,
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* Nenhum ficheiro — botão 📎 */
        <button
          onClick={() => inputRef.current?.click()}
          title="Anexar ficheiro (PDF, DOCX, TXT, MD, CSV, XLSX, MP3, WAV)"
          style={estiloBotao}
        >
          <span style={{ fontSize: 15 }}>📎</span>
          {drag && <span style={{ fontSize: 10 }}>Larga aqui</span>}
        </button>
      )}

      {/* Mensagem de erro inline */}
      {erro && (
        <div
          style={{
            position:   'absolute',
            bottom:     '110%',
            left:       0,
            whiteSpace: 'nowrap',
            zIndex:     100,
            boxShadow:  '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <ErrorMessage error={erro} />
        </div>
      )}
    </div>
  );
}
