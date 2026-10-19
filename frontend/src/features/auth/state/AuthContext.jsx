import { createContext, useEffect, useState } from 'react';
import { authApi } from '../service/auth.api.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'link-pulse-token';

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    authApi
      .currentUser(token)
      .then((response) => {
        if (active) setUser(response.data.user);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const saveSession = (response) => {
    const nextToken = response.data.token;
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.user);
  };

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    saveSession(response);
  };

  const register = async (details) => {
    const response = await authApi.register(details);
    saveSession(response);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };