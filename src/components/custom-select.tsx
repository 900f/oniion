'use client';
import { useState, useRef, useEffect } from 'react';
import { IconChevronRight } from '@/components/icons';

type Option = { value: string; label: string; preview?: React.ReactNode };

export function CustomSelect({
  value, onChange, options, placeholder = 'Select…',
}: {
  value: string; onChange: (v: string) => void;
  options: Option[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="custom-select" ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {selected?.preview}
          <span>{selected?.label || placeholder}</span>
        </span>
        <span style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s', color: '#555', display: 'flex' }}>
          <IconChevronRight size={14} />
        </span>
      </button>
      {open && (
        <div className="custom-select-menu">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`custom-select-option${opt.value === value ? ' selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.preview}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
