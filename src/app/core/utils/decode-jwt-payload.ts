/**
 * Decodifica el payload de un JWT (Base64URL). `atob` solo acepta Base64 clásico;
 * sin esta conversión muchos tokens quedan ilegibles y `roles` llega vacío.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    return JSON.parse(atob(base64)) as T;
  } catch {
    return null;
  }
}
