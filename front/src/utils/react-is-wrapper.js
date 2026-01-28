// Wrapper para react-is que garante compatibilidade com MUI
// Re-exportar tudo de react-is primeiro
export * from 'react-is';

// isValidElementType está disponível no CJS mas não é exportado no ESM
// Implementação compatível baseada na versão CJS
export function isValidElementType(type) {
  return (
    typeof type === 'string' ||
    typeof type === 'function' ||
    (typeof type === 'object' &&
      type !== null &&
      typeof type.$$typeof === 'symbol')
  );
}
