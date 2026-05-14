import React from 'react';

export default function FrustrationBanner({ onRetry, onDismiss, T }) {
  // Theme aware styling (T is passed from cortex-digital.jsx)
  const isDark = T.bg.match(/^#[0-3]/); // simple dark mode heuristic
  const bgColor = isDark ? 'rgba(120, 53, 15, 0.2)' : '#fffbeb'; // amber-900/20 or amber-50
  const borderColor = isDark ? 'rgba(217, 119, 6, 0.3)' : '#fde68a'; // amber-600/30 or amber-200
  const textColor = isDark ? '#fcd34d' : '#92400e'; // amber-300 or amber-800
  const btnBg = isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7'; // amber-500/15 or amber-100
  const btnHover = isDark ? 'rgba(245, 158, 11, 0.25)' : '#fde68a';
  
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: '12px 16px',
      margin: '0 16px 12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'modalSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>🤍</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: textColor, lineHeight: 1.4 }}>
          Parece que as coisas não estão a correr bem. Posso tentar de outra forma?
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: textColor,
            fontSize: 12,
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '1'}
          onMouseOut={e => e.currentTarget.style.opacity = '0.8'}
        >
          Estou bem, obrigado
        </button>
        
        <button
          onClick={onRetry}
          style={{
            background: btnBg,
            border: `1px solid ${borderColor}`,
            color: textColor,
            fontSize: 12,
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = btnHover}
          onMouseOut={e => e.currentTarget.style.background = btnBg}
        >
          Tenta de novo de forma diferente
        </button>
      </div>
    </div>
  );
}
