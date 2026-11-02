'use client';
import { useId } from 'react';
import type { Option } from '@/lib/client/booking/types';
import { money } from '@/lib/client/booking/business';
import { focusStyle, headingStyle } from './ui';
export function ServiceIndex({ options, selectedId, onSelect, disabled, className = '' }: { options: readonly Option[]; selectedId: string | null; onSelect: (id: string) => void; disabled?: boolean; className?: string }) {
  const name = useId(); const index = options.findIndex(option => option.id === selectedId);
  return <div className={`relative border-y border-[var(--brand-muted)] ${className}`} role="radiogroup" aria-label="Elige un servicio">
    {index >= 0 && <span aria-hidden="true" data-service-marker className="pointer-events-none absolute top-0 left-0 h-20 w-1 bg-[var(--brand-accent)] transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `translateY(${index * 80}px)` }} />}
    {options.map(option => <label key={option.id} className={`relative flex h-20 cursor-pointer items-center justify-between gap-4 border-b border-[var(--brand-muted)]/40 px-4 last:border-b-0 ${selectedId === option.id ? 'bg-[var(--brand-surface)]' : 'hover:bg-[var(--brand-surface)]/50'}`}>
      <input className={`peer absolute h-5 w-5 opacity-0 ${focusStyle}`} type="radio" name={name} value={option.id} checked={selectedId === option.id} onChange={() => onSelect(option.id)} disabled={disabled} />
      <span className={`${headingStyle} text-base peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[var(--brand-accent)] md:text-lg`}>{option.nombre}</span><span className="shrink-0 text-sm font-medium">{money(option.precio)}</span>
    </label>)}
  </div>;
}
export function SelectionGuide({ selectedId, className = '' }: { selectedId: string | null; className?: string }) { return <p className={`text-sm text-[var(--brand-muted)] ${className}`}>{selectedId ? 'Tu servicio elegido continúa contigo al reservar.' : 'Elige el servicio que quieres explorar. Todos ocupan un turno de una hora.'}</p>; }
