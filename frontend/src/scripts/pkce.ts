export function generateCodeVerifier(length = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const random = new Uint8Array(length);
  crypto.getRandomValues(random);
  return Array.from(random)
    .map((x) => charset[x % charset.length])
    .join('');
}

export async function sha256(input: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  return crypto.subtle.digest('SHA-256', enc.encode(input));
}

function base64url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let s = btoa(String.fromCharCode(...bytes));
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
}

export async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await sha256(verifier);
  return base64url(digest);
}
