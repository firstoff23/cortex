/**
 * Estados de progresso da geração de resposta.
 * Usar estas constantes em todo o projecto.
 */
export const GENERATION_STATES = {
  IDLE:      'idle',       // sem actividade
  THINKING:  'thinking',   // a processar o contexto
  WRITING:   'writing',    // a gerar texto (streaming activo)
  PAUSED:    'paused',     // aguarda aprovação ou input
  DONE:      'done',       // concluído com sucesso
  ERROR:     'error',      // falhou
  STOPPED:   'stopped'     // interrompido pelo utilizador
}

/**
 * Labels PT-PT para cada estado.
 */
export const GENERATION_LABELS = {
  idle:     '',
  thinking: 'A pensar…',
  writing:  'A escrever…',
  paused:   'À espera da tua confirmação…',
  done:     'Concluído',
  error:    'Ocorreu um erro',
  stopped:  'Geração interrompida.'
}
