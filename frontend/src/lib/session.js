// Login session (token + user) localStorage mein. Keys wohi hain jo pehle se pages use karte hain.
export function getSession() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return token && user ? { token, user } : null;
  } catch {
    return null;
  }
}

export function saveSession(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export const homePathFor = (user) => (user?.role === 'superadmin' ? '/superadmin' : '/dashboard');
