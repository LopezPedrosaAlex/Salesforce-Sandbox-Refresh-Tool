import { generateCodeVerifier, createCodeChallenge } from './pkce';

const SALESFORCE_AUTH = 'https://test.salesforce.com';
const CLIENT_ID = 'YOUR_CONNECTED_APP_CONSUMER_KEY';
const REDIRECT_URI = 'http://localhost:5173/callback';
const SCOPE = 'openid profile email api refresh_token';

/**
 * Kicks off the Salesforce OAuth 2.0 Authorization Code + PKCE flow.
 * Shared by the Navbar "connect org" button and the Auth empty state.
 */
export async function startSalesforceLogin() {
  const verifier = generateCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const state = crypto.randomUUID(); // CSRF protection
  const nonce = crypto.randomUUID(); // for OIDC ID token

  sessionStorage.setItem('pkce_verifier', verifier);
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_nonce', nonce);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${SALESFORCE_AUTH}?${params.toString()}`;
}
