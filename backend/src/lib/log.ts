export function createLogger(context: string) {
  return {
    info: (msg: string, meta?: any) => console.log(`[${context}] INFO:`, msg, meta || ''),
    error: (msg: string, meta?: any) => console.error(`[${context}] ERROR:`, msg, meta || ''),
  };
}
