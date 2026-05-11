import { useFileUpload } from '../hooks/useFileUpload.js';

// FileUpload.jsx — componente visual leve; a extracção fica toda no hook.
export default function FileUpload({ onUpload }) {
  const {
    ficheiro,
    erro,
    isDragging,
    inputRef,
    accept,
    handleClick,
    handleChange,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleRemove,
  } = useFileUpload({ onUpload });

  const dropZone = {
    border: '2px dashed var(--border)',
    borderRadius: '12px',
    padding: '2rem',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.2s, background 0.2s',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent)',
    color: 'var(--text)',
    outline: 'none',
  };

  const draggingStyle = isDragging
    ? {
        borderColor: 'var(--accent)',
        background: 'rgba(168,85,247,0.05)',
      }
    : null;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar ficheiro"
        onClick={handleClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{ ...dropZone, ...draggingStyle }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />

        {!ficheiro ? (
          <>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(168,85,247,0.10)',
                border: '1px solid rgba(168,85,247,0.28)',
                fontSize: 26,
              }}
            >
              📎
            </div>
            <div style={{ color: 'var(--text-h)', fontSize: 15, fontWeight: 800 }}>
              Arrasta ou clica para enviar
            </div>
            <div style={{ color: 'var(--text)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
              Tipos aceites: imagens, PDF, DOCX, TXT, CSV, XLSX, áudio
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12 }}>
              {['IMG', 'PDF', 'DOCX', 'TXT', 'CSV', 'XLSX', 'MP3/WAV'].map((tipo) => (
                <span
                  key={tipo}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    color: 'var(--text)',
                    fontSize: 10,
                    padding: '3px 7px',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {tipo}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            {ficheiro.previewUrl && (
              <img
                src={ficheiro.previewUrl}
                alt={ficheiro.nome}
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  objectFit: 'cover',
                }}
              />
            )}
            <div style={{ color: 'var(--text-h)', fontSize: 13, fontWeight: 700 }}>
              {ficheiro.nome}
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRemove();
              }}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 999,
                background: 'transparent',
                color: 'var(--text)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                padding: '5px 12px',
              }}
            >
              Remover
            </button>
          </div>
        )}
      </div>

      {erro && (
        <div
          style={{
            marginTop: 8,
            color: '#fca5a5',
            background: '#2a0a0a',
            border: '1px solid #5a1a1a',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 12,
          }}
        >
          {erro}
        </div>
      )}
    </div>
  );
}
