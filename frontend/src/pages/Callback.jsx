import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { addOrgConnection } from '../scripts/orgStore';

const SALESFORCE_TOKEN_URL = 'https://test.salesforce.com/services/oauth2/token';
const CLIENT_ID = 'YOUR_CONNECTED_APP_CONSUMER_KEY'; // Must match salesforceAuth.js
const REDIRECT_URI = 'http://localhost:5173/callback'; // Must match salesforceAuth.js

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const verifier = sessionStorage.getItem('pkce_verifier');

    if (code && verifier) {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', CLIENT_ID);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code', code);
      params.append('code_verifier', verifier);

      axios
        .post(SALESFORCE_TOKEN_URL, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
        .then((response) => {
          // The access token is the org's session id (sid) for jsforce.
          // Persist this org alongside any other connected orgs (multi-org)
          // so it shows up as a session card in the webapp.
          addOrgConnection({
            accessToken: response.data.access_token,
            instanceUrl: response.data.instance_url,
          });
          navigate('/');
        })
        .catch((error) => {
          console.error('Error exchanging token:', error);
          alert('Login failed. Check console.');
        });
    } else {
      console.error('Missing code or verifier');
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Processing Login...</h1>
    </div>
  );
}
