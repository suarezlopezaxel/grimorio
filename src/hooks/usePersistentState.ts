import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { isRecord, migrate } from '../lib/persistence';

export type PersistentStateStatus = 'idle' | 'saving' | 'saved' | 'error';

interface PersistentEnvelope {
  version: number;
  data: unknown;
}

function readPersistentState<T>(key: string, initialValue: T): { value: T; status: PersistentStateStatus } {
  try {
    if (typeof window === 'undefined') {
      return { value: initialValue, status: 'idle' };
    }

    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) {
      return { value: initialValue, status: 'idle' };
    }

    const parsed: unknown = JSON.parse(storedValue);
    if (!isRecord(parsed) || typeof parsed.version !== 'number' || !('data' in parsed)) {
      throw new Error(`El valor guardado para "${key}" no tiene un formato válido.`);
    }

    const envelope: PersistentEnvelope = { version: parsed.version, data: parsed.data };
    const migrated = migrate<T>(envelope.data, envelope.version);
    if (migrated === null) {
      throw new Error(`No hay una migración disponible para la versión ${envelope.version}.`);
    }
    return { value: migrated, status: 'idle' };
  } catch {
    return { value: initialValue, status: 'error' };
  }
}

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  version: number,
  restore?: (value: T) => T,
): [
  T,
  Dispatch<SetStateAction<T>>,
  () => void,
  PersistentStateStatus,
] {
  const [initialState] = useState(() => {
    const storedState = readPersistentState(key, initialValue);
    try {
      return {
        ...storedState,
        value: restore ? restore(storedState.value) : storedState.value,
      };
    } catch {
      return { value: initialValue, status: 'error' as const };
    }
  });
  const [value, setValue] = useState<T>(initialState.value);
  const [status, setStatus] = useState<PersistentStateStatus>(initialState.status);
  const isFirstRender = useRef(true);
  const skipNextSave = useRef(false);
  const pendingSave = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    setStatus('saving');
    pendingSave.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify({ version, data: value }));
        setStatus('saved');
        pendingSave.current = setTimeout(() => setStatus('idle'), 1500);
      } catch {
        setStatus('error');
      }
    }, 500);

    return () => {
      if (pendingSave.current !== null) {
        clearTimeout(pendingSave.current);
        pendingSave.current = null;
      }
    };
  }, [key, value, version]);

  const clear = useCallback(() => {
    if (pendingSave.current !== null) {
      clearTimeout(pendingSave.current);
      pendingSave.current = null;
    }

    try {
      window.localStorage.removeItem(key);
      setStatus('idle');
    } catch {
      setStatus('error');
    }

    if (value !== initialValue) {
      skipNextSave.current = true;
      setValue(initialValue);
    }
  }, [initialValue, key, value]);

  return [value, setValue, clear, status];
}
