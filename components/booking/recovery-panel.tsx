'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandNotice } from '@/components/brand';
import { confirmationHref, dateLabel } from '@/lib/client/booking/business';
import type { RawDraft, Reservation } from '@/lib/client/booking/types';
import { useFlow } from './flow-provider';
import { Action, RouteAction } from './ui';

function DraftValues({ draft }: { draft: RawDraft | null }) {
  const { state } = useFlow();
  if (!draft) return <p>Sin borrador.</p>;
  return <dl className="grid gap-2 text-sm">{Object.entries({ Servicio: state.catalog?.opciones.find(option => option.id === draft.opcion)?.nombre || draft.opcion || 'Sin elegir', Fecha: draft.fecha, Turno: draft.hora, Nombre: draft.nombre, Email: draft.email, Teléfono: draft.telefono, Personas: draft.personas, Notas: draft.notas }).map(([label, value]) => <div key={label} className="grid grid-cols-[5rem_1fr] gap-3"><dt className="font-semibold">{label}</dt><dd className="min-w-0 whitespace-pre-wrap break-words">{value || '—'}</dd></div>)}</dl>;
}
export function RecoveryPanel({ onRecovered, onNewIntent }: { onRecovered?: (record: Reservation) => void | Promise<void>; onNewIntent?: () => void } = {}) {
  const { state, controller, renewPresentation } = useFlow(); const router = useRouter();
  const [working, setWorking] = useState(false);
  const [localError, setLocalError] = useState('');
  const run = async (action: () => Promise<unknown>) => { if (working) return; setWorking(true); setLocalError(''); try { await action(); } catch (error) { setLocalError(error instanceof Error ? error.message : 'No pudimos completar la solicitud. Reintenta.'); } finally { setWorking(false); } };
  const recover = async () => { const record = await controller.recoverPending(); if (record) { if (onRecovered) await onRecovered(record); else router.push(confirmationHref(record)); } };
  return <div className="space-y-4 empty:hidden">
    {state.phase === 'session-blocked' && <BrandNotice kind="error" title="No pudimos abrir tu sesión privada"><p>{state.problem?.message}</p><div className="mt-3 flex flex-wrap gap-3"><Action onClick={() => run(() => controller.retrySession())} disabled={working}>Reintentar sesión</Action><a className="inline-flex min-h-11 items-center underline" href="/reservar" target="_blank" rel="noreferrer">Abrir el sitio directamente</a></div></BrandNotice>}
    {state.draftConflict && <BrandNotice kind="warning" title="El borrador cambió en otra vista">
      <p>Compara los datos antes de elegir. Tus cambios siguen aquí.</p>
      <div className="my-4 grid gap-6 md:grid-cols-2"><section><h3 className="mb-2 font-semibold">Tus cambios en esta vista</h3><DraftValues draft={state.draftConflict.localDraft} /></section><section><h3 className="mb-2 font-semibold">Borrador guardado en la otra vista</h3><DraftValues draft={state.draftConflict.server.draft} /></section></div>
      {state.draftConflict.server.lastValid && <details className="mb-4"><summary className="min-h-11 cursor-pointer py-2">Última revisión válida conservada</summary><DraftValues draft={{ ...state.draftConflict.server.lastValid.payload, personas: String(state.draftConflict.server.lastValid.payload.personas), paso: 'contacto' }} /></details>}
      <div className="flex flex-wrap gap-3"><Action disabled={working} onClick={() => run(async () => { if (await controller.resolveDraftConflict('use-server')) renewPresentation(); })}>Usar el borrador guardado</Action><Action secondary disabled={working} onClick={() => run(async () => { if (await controller.resolveDraftConflict('overwrite-local')) renewPresentation(); })}>Conservar mis cambios</Action></div>
    </BrandNotice>}
    {state.pending && <div data-booking-pending role="status"><BrandNotice kind="warning" title={state.phase === 'saving' ? 'Comprobando el resultado…' : state.phase === 'rejected' ? 'El envío necesita atención' : 'El resultado todavía no está confirmado'}>
      <p>{state.phase === 'rejected' ? state.problem?.message : 'La respuesta pudo interrumpirse después de guardar. Recupera el envío original para conocer el resultado antes de enviar otra reserva.'}</p>
      {state.pending.tipo === 'crear' && <p className="mt-2 whitespace-pre-wrap text-sm">Envío original: {state.catalog?.opciones.find(option => option.id === (state.pending?.tipo === 'crear' ? state.pending.payload.opcion : ''))?.nombre || 'Servicio seleccionado'} · {dateLabel(state.pending.payload.fecha)} · {state.pending.payload.hora}. Los datos originales se conservan aunque edites el formulario.</p>}
      {state.pending.tipo === 'cancelar' && <p className="mt-2">La cancelación aún no está confirmada. Conservamos el último estado consultado hasta recuperar la respuesta.</p>}
      <div className="mt-4 flex flex-wrap gap-3"><Action data-booking-action="recover" disabled={working || state.phase === 'saving'} onClick={() => run(recover)}>Recuperar envío original</Action><Action secondary data-booking-action="new-intent" disabled={working || state.phase === 'saving'} onClick={() => run(async () => { if (await controller.startNewIntent()) { if (onNewIntent) onNewIntent(); else router.push('/reservar'); } })}>Iniciar otro intento</Action><RouteAction href="/reservar" secondary>Editar borrador</RouteAction></div>
    </BrandNotice></div>}
    {state.recoveries.length > 0 && <details className="border-y border-[var(--brand-muted)]/40 py-2"><summary className="min-h-11 cursor-pointer py-2 font-semibold">Envíos anteriores recuperables ({state.recoveries.length})</summary><p className="mb-3 text-sm">Iniciar otro intento no borra el anterior. Comprueba su resultado aquí.</p><ul className="space-y-3">{state.recoveries.map((pending, index) => <li key={pending.clave} className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm">{pending.tipo === 'crear' ? `Reserva del ${dateLabel(pending.payload.fecha)} a las ${pending.payload.hora}` : 'Cancelación anterior'}</span><Action secondary disabled={working || Boolean(state.pending)} onClick={() => run(async () => { if (await controller.activateRecovery(pending.clave)) await recover(); })}>Recuperar envío {index + 1}</Action></li>)}</ul></details>}
    {!state.pending && !state.draftConflict && state.phase !== 'session-blocked' && state.problem && !state.availabilityLoading && <BrandNotice kind="error" title="Necesitamos comprobar tus datos"><p>{state.problem.message}</p>{!state.catalog && <Action onClick={() => run(() => controller.start())} disabled={working}>Reintentar carga</Action>}</BrandNotice>}
    {localError && <p role="alert" className="text-[var(--brand-accent)]">{localError}</p>}
  </div>;
}
