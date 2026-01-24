import { useState } from 'react';

export function useQrViewModel() {
  const [lastCode, setLastCode] = useState<string | null>(null);

  const simulateScan = () => {
    setLastCode('WINI-ORIGEN-2026');
  };

  return {
    lastCode,
    simulateScan,
  };
}
