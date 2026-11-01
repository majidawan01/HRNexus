import { useCallback, useEffect, useRef, useState } from 'react';
import { errorText } from '../lib/errors';

// const { data, status, error, reload } = useResource(() => API.get('/x').then(r => r.data));
// status: loading | ready | error. reload(true) = chupke refresh (skeleton nahi dikhta).
export default function useResource(load) {
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const [key, setKey] = useState(0);
  const loadRef = useRef(load);

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data, error: '' });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: 'error', data: null, error: errorText(err, 'Could not load data.') });
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const reload = useCallback((silent = false) => {
    if (!silent) setState((s) => ({ ...s, status: 'loading' }));
    setKey((k) => k + 1);
  }, []);

  return { ...state, reload };
}
