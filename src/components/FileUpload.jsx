import { useFileUpload } from '../hooks/useFileUpload.js';

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
    background: 'transparent',
    color: 'var(--text)',
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
        onClick={handleClick}
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
            <div style={{ fontSize: 34, marginBottom: 10 }}>📎</div>
            <div style={{ color: 'var(--text-h)', fontSize: 15, fontWeight: 800 }}>
              Arrasta ou clica para enviar
            </div>
            <div style={{ color: 'var(--text)', fontSize: 12, marginTop: 6 }}>
              Tipos aceites: imagens, PDF, DOCX, TXT, CSV, XLSX, áudio
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
