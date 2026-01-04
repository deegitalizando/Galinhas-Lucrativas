
/**
 * Utilitário definitivo para converter qualquer erro em texto legível.
 * Garante que erros do Supabase (PostgrestError) sejam extraídos corretamente.
 */
export const getErrorMessage = (err: any): string => {
  if (!err) return 'Erro desconhecido';
  
  if (typeof err === 'string') return err;

  if (typeof err === 'object') {
    const errorBody = err.error || err;
    const msg = errorBody.message || errorBody.error_description || errorBody.error;
    const details = errorBody.details && errorBody.details !== 'null' ? errorBody.details : '';
    const hint = errorBody.hint && errorBody.hint !== 'null' ? errorBody.hint : '';
    const code = errorBody.code ? `(Código: ${errorBody.code})` : '';

    if (msg) {
      return `${msg} ${details ? ` - ${details}` : ''} ${hint ? ` [Dica: ${hint}]` : ''} ${code}`.trim();
    }

    try {
      const str = JSON.stringify(err);
      if (str !== '{}') return `Detalhe do Erro: ${str}`;
    } catch (e) {}
  }

  const final = String(err);
  return final === '[object Object]' 
    ? 'Erro técnico de comunicação. Verifique os nomes das colunas no seu Supabase.' 
    : final;
};
