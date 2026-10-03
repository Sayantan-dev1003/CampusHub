import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function useApi(path, enabled = true) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ loading: Boolean(enabled && path), error: '', data: null, meta: null });

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || !path) {
      setState({ loading: false, error: '', data: null, meta: null });
      return undefined;
    }
    let active = true;
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(path)
      .then((result) => {
        if (!active) return;
        setState({ loading: false, error: '', data: result.data, meta: result.meta || null });
      })
      .catch((error) => {
        if (!active) return;
        setState({ loading: false, error: error.message || 'Request failed', data: null, meta: null });
      });
    return () => {
      active = false;
    };
  }, [path, enabled, tick]);

  return { ...state, reload };
}
