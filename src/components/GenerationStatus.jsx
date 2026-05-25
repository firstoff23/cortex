import React from 'react';
import { GENERATION_STATES, GENERATION_LABELS } from '../utils/generationStates.js';

export default function GenerationStatus({ state, lobeName = '', T = {} }) {
  if (!state || state === GENERATION_STATES.IDLE || state === GENERATION_STATES.ERROR) {
    return null;
  }

  const label = GENERATION_LABELS[state] || '';
  const displayText = lobeName ? `${lobeName} — ${label}` : label;

  // Cores dinâmicas de acordo com o estado
  let statusColor = T.ts || 'var(--text-secondary, #8a8aa0)';
  if (state === GENERATION_STATES.THINKING) {
    statusColor = 'var(--accent, #3b82f6)';
  } else if (state === GENERATION_STATES.WRITING) {
    statusColor = 'var(--accent-writing, #10b981)';
  } else if (state === GENERATION_STATES.DONE) {
    statusColor = '#22c55e'; // Verde de sucesso
  } else if (state === GENERATION_STATES.STOPPED) {
    statusColor = '#6b7280'; // Cinzento
  } else if (state === GENERATION_STATES.PAUSED) {
    statusColor = '#eab308'; // Âmbar
  }

  return (
    <div
      role="status"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: '11px',
        color: statusColor,
        background: T.s1 || 'var(--bg-secondary, #1a1a2e)',
        border: `1px solid ${T.b2 || 'var(--border-secondary, #2a2a4e)'}`,
        borderRadius: '20px',
        margin: '8px 0',
        transition: 'all 0.3s ease',
        fontWeight: 500,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
      }}
    >
      <style>{`
        @keyframes dotBlink {
          0% { opacity: .2; }
          20% { opacity: 1; }
          100% { opacity: .2; }
        }
        @keyframes cursorBlink {
          50% { opacity: 0; }
        }
        .gen-dot {
          animation: dotBlink 1.4s infinite both;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          display: inline-block;
        }
        .gen-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .gen-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        .gen-cursor {
          display: inline-block;
          width: 2px;
          height: 10px;
          background-color: currentColor;
          animation: cursorBlink 1s step-start infinite;
          margin-left: 2px;
          vertical-align: middle;
        }
      `}</style>

      {/* Ícone de status dinâmico */}
      {state === GENERATION_STATES.THINKING && (
        <div style={{ display: 'flex', gap: 2, marginRight: 2 }}>
          <span className="gen-dot" />
          <span className="gen-dot" />
          <span className="gen-dot" />
        </div>
      )}

      {state === GENERATION_STATES.WRITING && (
        <span style={{ marginRight: 2 }}>✍️</span>
      )}

      {state === GENERATION_STATES.DONE && (
        <span style={{ marginRight: 2, fontWeight: 'bold' }}>✓</span>
      )}

      {state === GENERATION_STATES.STOPPED && (
        <span style={{ marginRight: 2 }}>⏹</span>
      )}

      {state === GENERATION_STATES.PAUSED && (
        <span style={{ marginRight: 2 }}>⏸</span>
      )}

      <span>{displayText}</span>

      {state === GENERATION_STATES.WRITING && (
        <span className="gen-cursor" />
      )}
    </div>
  );
}
