import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../App';

interface AuthDebuggerProps {
  user: User | null;
}

// A helper function to decode the JWT payload
// NOTE: This should only be used for debugging on the client-side.
// Do not rely on client-side JWT claims for security.
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return null;
  }
}

export function AuthDebugger({ user }: AuthDebuggerProps) {
  const [claims, setClaims] = useState<any>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (session) {
        console.log('Session exists. Decoding access token...');
        const decodedClaims = decodeJwt(session.access_token);
        if (decodedClaims) {
          console.log("Decoded JWT Claims:", decodedClaims);
          setClaims(decodedClaims);
        }
      } else {
        setClaims(null);
      }
    });

    // Cleanup the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-inner mt-4">
      <h3 className="font-semibold text-gray-800">Authentication Debugger</h3>
      {user ? (
        <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto">
          {JSON.stringify(claims, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No active session. Please log in.</p>
      )}
    </div>
  );
}
