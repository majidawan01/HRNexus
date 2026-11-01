import { useCallback, useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { AuthContext } from './auth-context';
import { clearSession, getSession, saveSession } from '../lib/session';

// Login session + company ki info (naam, plan, limit, employeeCount) ek hi jagah.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());
  // Login response mein company{name, plan, employeeLimit} aati hai, to sidebar ko foran mil jati hai
  const [company, setCompany] = useState(() => getSession()?.user?.company || null);

  const userId = session?.user?._id;
  const role = session?.user?.role;

  const refreshCompany = useCallback(async () => {
    try {
      const res = await API.get('/company/me');
      setCompany(res.data);
      return res.data;
    } catch {
      return null; // 401 ko axios interceptor sambhalta hai
    }
  }, []);

  // Page reload par taza company info (plan/employeeCount) le aao
  useEffect(() => {
    if (!userId || role === 'superadmin') return undefined;
    let cancelled = false;
    API.get('/company/me')
      .then((res) => {
        if (!cancelled) setCompany(res.data);
      })
      .catch(() => {}); // 401 ko axios interceptor sambhalta hai
    return () => {
      cancelled = true;
    };
  }, [userId, role]);

  const signIn = useCallback((data) => {
    saveSession(data);
    setSession({ token: data.token, user: data });
    setCompany(data.company || null);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
    setCompany(null);
  }, []);

  const value = useMemo(
    () => ({ user: session?.user || null, company, signIn, signOut, refreshCompany }),
    [session, company, signIn, signOut, refreshCompany]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
