import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const instanceUrl = sessionStorage.getItem('instance_url');
  const accessToken = sessionStorage.getItem('access_token');

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
        <p className="text-green-600 font-semibold mb-2">Logged in successfully!</p>
        <div className="mb-4">
          <p className="text-gray-600">
            <strong>Instance URL:</strong> {instanceUrl}
          </p>
          <p className="text-gray-600 truncate">
            <strong>Access Token:</strong> {accessToken ? '********' : 'None'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
