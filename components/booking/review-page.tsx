'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { BrandNotice } from '@/components/brand';
import { confirmationHref } from '@/lib/client/booking/business';
import { useFlow } from './flow-provider';
import { ReservationSpec } from './reservation-spec';
import { Action, RouteAction } from './ui';
export function ReviewPage() {
  const { state, controller, review, reviewing, focusField } = useFlow();
  const router = useRouter(); const snapshot = state.lastValid;
  const current = state.phase === 'review' && Boolean(snapshot) && state.mediaReady && !state.pending && !state.draftConflict;
  return <div className="space-y-5 pb-8">
    {!current && state.phase !== 'saving' && !state.pending && <BrandNotice kind="info" title={snapshot ? 'Comprueba de nuevo tu revisión' : 'Revisa antes de guardar'}><p>{snapshot ? 'Conservamos la última revisión válida. Comprueba los datos actuales y el turno antes de guardar.' : 'Completa el servicio, el turno y tus datos para obtener una revisión.'}</p><div className="mt-3 flex flex-wrap gap-3"><Action data-booking-action="review" disabled={reviewing || !state.mediaReady || state.availabilityLoading || Boolean(state.draftConflict) || state.phase === 'session-blocked'} onClick={() => void review()}>{reviewing ? 'Revisando…' : 'Revisar datos actuales'}</Action><RouteAction href="/reservar" secondary>Volver al borrador</RouteAction></div></BrandNotice>}
    {snapshot && <section aria-label={current ? 'Datos revisados' : 'Última revisión válida'}>{!current && state.phase !== 'saving' && <p className="mb-3 text-sm font-semibold">Última revisión válida · todavía no es una reserva guardada</p>}<ReservationSpec review={snapshot} /></section>}
    {current && <p className="text-sm text-[var(--brand-muted)]">Comprueba los datos. El turno se confirma al guardar y puede ocuparse mientras revisas.</p>}
    <div className="flex flex-wrap gap-3"><Action data-booking-action="save" disabled={!current || reviewing} onClick={async () => { const record = await controller.save(); if (record) router.push(confirmationHref(record)); }}>{state.phase === 'saving' ? 'Guardando y comprobando…' : 'Guardar reserva demo'}<Save size={17} /></Action><Action secondary disabled={state.phase === 'saving'} onClick={() => focusField('nombre')}><ArrowLeft size={16} /> Editar mis datos</Action><Action secondary disabled={state.phase === 'saving'} onClick={() => focusField('opcion')}>Cambiar servicio o turno</Action></div>
    <p className="text-sm text-[var(--brand-muted)]">Es una reserva de demostración: no implica atención real, cobros ni mensajes.</p>
  </div>;
}
