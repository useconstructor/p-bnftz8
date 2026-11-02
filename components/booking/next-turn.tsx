'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import type { Availability } from '@/lib/client/booking/types';
import { dateLabel, localDate } from '@/lib/client/booking/business';
import { useFlow } from './flow-provider';
import { focusStyle } from './ui';
export function NextTurn() {
  const { state, edit } = useFlow();
  const [next, setNext] = useState<{ fecha: string; hora: string } | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'empty'>('loading');
  const [retry, setRetry] = useState(0);
  const version = state.catalog?.version, zone = state.catalog?.zonaHoraria;
  const option = state.draft.opcion || state.catalog?.opciones[0]?.id;
  useEffect(() => {
    if (!option || !zone) return;
    const abort = new AbortController(); setStatus('loading'); setNext(null);
    void (async () => {
      const start = localDate(zone);
      for (let offset = 0; offset < 14; offset++) {
        const date = new Date(start + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + offset);
        const fecha = date.toISOString().slice(0, 10);
        const response = await fetch('/api/disponibilidad?' + new URLSearchParams({ opcion: option, fecha }), { credentials: 'same-origin', cache: 'no-store', signal: abort.signal });
        const result = await response.json();
        if (!response.ok || result.ok !== true) throw new Error('No pudimos consultar el próximo turno.');
        const availability = result.data as Availability;
        if (availability.opcion !== option || availability.fecha !== fecha || !Array.isArray(availability.turnos)) throw new Error('No pudimos comprobar los turnos.');
        const slot = availability.turnos.find(turn => Number.isInteger(turn.disponibles) && turn.disponibles >= 1);
        if (slot) { if (!abort.signal.aborted) { setNext({ fecha, hora: slot.hora }); setStatus('ready'); } return; }
      }
      if (!abort.signal.aborted) setStatus('empty');
    })().catch(() => { if (!abort.signal.aborted) setStatus('error'); });
    return () => abort.abort();
  }, [option, version, zone, retry]);
  return <div className="mt-2 border-l-4 border-[var(--brand-accent)] bg-[var(--brand-surface)] px-3 py-2" data-next-turn>
    {status === 'loading' ? <p role="status" className="text-sm">Consultando el próximo turno…</p> : status === 'error' ? <div role="alert" className="flex flex-wrap items-center gap-x-3"><p className="text-sm">No pudimos consultar el próximo turno.</p><button type="button" onClick={() => setRetry(n => n + 1)} className={`flex min-h-11 items-center gap-2 text-sm font-semibold underline ${focusStyle}`}><RotateCw size={14} /> Reintentar próximo turno</button></div> : next ? state.draft.opcion && !state.referenceError ? <button type="button" onClick={() => edit(next)} className={`flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm ${focusStyle}`}><span><span className="block font-semibold underline">Próximo turno disponible</span>{dateLabel(next.fecha)} · <strong>{next.hora}</strong></span><ArrowUpRight size={16} className="shrink-0" /></button> : <p className="text-sm"><span className="block font-semibold">Próximo turno disponible</span>{dateLabel(next.fecha)} · <strong>{next.hora}</strong></p> : <p className="text-sm">No encontramos turnos en los próximos 14 días. Puedes consultar otra fecha.</p>}
  </div>;
}
