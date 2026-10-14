"use client";

import { useCallback, useEffect, useState } from 'react';

export default function useResource(loader) {
  const [state, setState] = useState({ data: null, error: '', loaded: false });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    loader().then(data => {
      if (active) setState({ data, error: '', loaded: true });
    }).catch(error => {
      if (active) setState({ data: null, error: error.message, loaded: true });
    });
    return () => { active = false; };
  }, [loader, version]);
  const reload = useCallback(() => { setState({ data: null, error: '', loaded: false }); setVersion(v => v + 1); }, []);
  return { ...state, reload };
}
