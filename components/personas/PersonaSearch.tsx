'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PersonaSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function PersonaSearch({ value, onChange, placeholder = 'Buscar persona...' }: PersonaSearchProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {}, 300);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
      <input
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
