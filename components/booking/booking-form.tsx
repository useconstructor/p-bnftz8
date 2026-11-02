'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, RotateCw } from 'lucide-react';
import { BrandNotice, WorkshopEdge } from '@/components/brand';
import { validateDraft } from '@/lib/client/booking/controller';
import { dateLabel, localDate, money, trackBooking } from '@/lib/client/booking/business';
import type { Field, FieldErrors } from '@/lib/client/booking/types';
import { useFlow } from './flow-provider';
import { NextTurn } from './next-turn';
import { Action, fieldStyle, focusStyle, headingStyle, InlineError } from './ui';

const labels: Partial<Record<Field, string>> = { opcion: 'Servicio', fecha: 'Fecha', hora: 'Turno', nombre: 'Nombre', email: 'Email', telefono: 'Teléfono', notas: 'Notas', personas: 'Personas' };
export function BookingForm() {
  const { state, controller, step, setStep, edit, focus, focusField, review, reviewing, retryAvailability } = useFlow();
  const [localErrors, setLocalErrors] = useState<FieldErrors>({});
  const errors = { ...localErrors, ...state.errors };
  const catalog = state.catalog;
  const selected = !state.referenceError ? catalog?.opciones.find(option => option.id === state.draft.opcion) : undefined;
  const busy = state.phase === 'saving' || reviewing;
  const change = (field: Field, value: string) => { setLocalErrors(current => ({ ...current, [field]: undefined })); edit({ [field]: value }); };
  const fieldProps = (field: Field) => ({ id: field, name: field, ref: focus.targetRef(field), 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `${field}-error` : undefined, className: fieldStyle });
  const proceed = () => {
    const all = validateDraft(state.draft, state.catalog, Date.now(), state.referenceError, state.mediaReady);
    const selectionErrors: FieldErrors = {};
    for (const key of ['opcion', 'fecha', 'hora', 'personas'] as Field[]) if (all[key]) selectionErrors[key] = all[key];
    if (!selectionErrors.hora && !state.availability?.turnos.some(slot => slot.hora === state.draft.hora && slot.disponibles >= Number(state.draft.personas))) selectionErrors.hora = 'Elige un turno con cupo disponible.';
    setLocalErrors(selectionErrors);
    const first = (['opcion', 'fecha', 'hora', 'personas'] as Field[]).find(field => selectionErrors[field]);
    if (first) { focus.requestFocus(first); return; }
    setStep('contacto'); edit({ paso: 'contacto' }); focus.requestFocus('nombre'); trackBooking('Booking contact');
  };
  if (!catalog) return <p className="py-4">Los servicios estarán aquí cuando termine la consulta.</p>;
  return <form noValidate onSubmit={event => { event.preventDefault(); if (step === 'opcion-turno') proceed(); else void review(); }} className="space-y-4 pb-8">
    {Object.values(errors).some(Boolean) && <div role="alert" data-booking-errors className="border-l-4 border-[var(--brand-accent)] bg-[var(--brand-surface)] p-4"><p className="font-semibold">Revisa estos datos para continuar</p><ul className="mt-2">{Object.entries(errors).filter(([, message]) => message).map(([field, message]) => <li key={field}><button type="button" onClick={() => focusField(field as Field)} className={`min-h-11 text-left text-sm underline underline-offset-4 ${focusStyle}`}>{labels[field as Field] || 'Servicio'}: {message}</button></li>)}</ul></div>}
    {step === 'opcion-turno' ? <section aria-labelledby="seleccion-title">
      <h2 id="seleccion-title" className={`${headingStyle} mb-2 text-xl md:text-2xl`}>Servicio y turno</h2>
      {state.referenceError && <BrandNotice kind="warning" title="El servicio del enlace no está disponible"><p>{state.referenceError}</p></BrandNotice>}
      <label htmlFor="opcion" className="mb-2 block text-base font-semibold">Servicio</label>
      <select {...fieldProps('opcion')} value={selected?.id || ''} disabled={busy} onChange={event => { setLocalErrors({}); if (event.target.value) { void controller.chooseOption(event.target.value).catch(() => {}); trackBooking('Service selected'); } else change('opcion', ''); }}>
        <option value="">Elige un servicio</option>{catalog.opciones.map(option => <option key={option.id} value={option.id}>{option.nombre} · {money(option.precio, catalog.moneda)} demo</option>)}
      </select><InlineError id="opcion-error">{errors.opcion}</InlineError>
      <NextTurn />
      {selected && <p className="mt-2 text-sm text-[var(--brand-muted)]" data-booking-selection>{selected.nombre} · {money(selected.precio, catalog.moneda)} demo · {selected.duracionMinutos} minutos</p>}
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 md:gap-5">
        <div><label htmlFor="fecha" className="mb-2 flex items-center gap-2 font-semibold"><CalendarDays size={18} /> Fecha</label><input {...fieldProps('fecha')} type="date" min={localDate(catalog.zonaHoraria)} value={state.draft.fecha} onChange={event => change('fecha', event.target.value)} disabled={busy} /><InlineError id="fecha-error">{errors.fecha}</InlineError><p className="mt-2 text-sm text-[var(--brand-muted)]">Lunes a sábado, 10:00–19:00. Último inicio: 18:00. Hora de Bogotá.</p></div>
        <div><label htmlFor="hora" className="mb-2 block font-semibold">Turno</label><select {...fieldProps('hora')} value={state.draft.hora} onChange={event => change('hora', event.target.value)} disabled={busy}>
          <option value="">Elige una hora</option>{catalog.politica.horas.map(hora => { const available = state.availability?.turnos.find(slot => slot.hora === hora); return <option key={hora} value={hora} disabled={!available || available.disponibles < Number(state.draft.personas)}>{hora}{state.availabilityLoading ? ' · consultando' : !available ? ' · sin disponibilidad confirmada' : available.disponibles < Number(state.draft.personas) ? ' · no disponible' : ' · disponible'}</option>; })}
        </select><InlineError id="hora-error">{errors.hora}</InlineError>
          <Action type="submit" data-booking-action="continue" className="mt-2 w-full px-2" aria-label="Continuar a mis datos" disabled={busy || state.phase === 'session-blocked'}>Continuar <ArrowRight size={18} /></Action>
          {state.availabilityLoading ? <p className="mt-2 text-sm" role="status">Comprobando turnos…</p> : state.availability ? <div className="mt-2 flex flex-wrap items-center gap-x-3"><p className="text-sm">{state.availability.turnos.some(slot => slot.disponibles >= Number(state.draft.personas)) ? 'El cupo se comprueba de nuevo al guardar.' : 'Sin cupos en esta fecha. Elige otra fecha.'}</p><button type="button" className={`min-h-11 text-sm underline ${focusStyle}`} onClick={retryAvailability}>Actualizar disponibilidad</button></div> : state.draft.opcion && state.draft.fecha ? <div role="alert" className="mt-2"><p className="text-sm">No pudimos confirmar la disponibilidad. Conservamos tu selección.</p><Action secondary onClick={retryAvailability}><RotateCw size={16} /> Reintentar disponibilidad</Action></div> : <p className="mt-2 text-sm">Elige servicio y fecha para consultar turnos.</p>}
        </div>
      </div>
      {catalog.politica.maxPersonas > 1 && <div className="mt-4"><label htmlFor="personas" className="mb-2 block font-semibold">Personas</label><input {...fieldProps('personas')} type="number" value={state.draft.personas} min={catalog.politica.minPersonas} max={catalog.politica.maxPersonas} onChange={event => change('personas', event.target.value)} /><InlineError id="personas-error">{errors.personas}</InlineError></div>}
      
    </section> : <section aria-labelledby="contacto-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 id="contacto-title" className={`${headingStyle} text-2xl`}>Tus datos</h2><Action secondary onClick={() => { setStep('opcion-turno'); edit({ paso: 'opcion-turno' }); focus.requestFocus('opcion'); }}><ArrowLeft size={16} /> Cambiar servicio o turno</Action></div>
      <WorkshopEdge serviceName={selected?.nombre} status="neutral"><p data-booking-selection className="text-sm">{dateLabel(state.draft.fecha)} · {state.draft.hora || 'Sin turno'} · {selected ? `${money(selected.precio, catalog.moneda)} demo` : 'Elige un servicio'}</p></WorkshopEdge>
      <p className="my-4 text-sm text-[var(--brand-muted)]">Estos datos quedan en tu reserva privada de demostración. No enviamos mensajes ni cobramos pagos.</p>
      <div className="grid gap-5 md:grid-cols-2">
        <div><label htmlFor="nombre" className="mb-2 block font-semibold">Nombre</label><input {...fieldProps('nombre')} autoComplete="name" value={state.draft.nombre} onChange={event => change('nombre', event.target.value)} disabled={busy} /><InlineError id="nombre-error">{errors.nombre}</InlineError></div>
        <div><label htmlFor="email" className="mb-2 block font-semibold">Email</label><input {...fieldProps('email')} type="email" autoComplete="email" value={state.draft.email} onChange={event => change('email', event.target.value)} disabled={busy} /><InlineError id="email-error">{errors.email}</InlineError></div>
        <div><label htmlFor="telefono" className="mb-2 block font-semibold">Teléfono</label><input {...fieldProps('telefono')} type="tel" autoComplete="tel" value={state.draft.telefono} onChange={event => change('telefono', event.target.value)} disabled={busy} /><InlineError id="telefono-error">{errors.telefono}</InlineError><p className="mt-2 text-sm text-[var(--brand-muted)]">Puedes conservar espacios, guiones, paréntesis y el prefijo +.</p></div>
        <div className="md:col-span-2"><label htmlFor="notas" className="mb-2 block font-semibold">Notas <span className="font-normal">(opcional)</span></label><textarea {...fieldProps('notas')} rows={3} value={state.draft.notas} onChange={event => change('notas', event.target.value)} disabled={busy} /><InlineError id="notas-error">{errors.notas}</InlineError><p className="mt-1 text-sm text-[var(--brand-muted)]">Hasta 2000 caracteres.</p></div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4"><Action type="submit" data-booking-action="review" disabled={busy || Boolean(state.pending) || Boolean(state.draftConflict) || state.phase === 'session-blocked' || !state.mediaReady || state.availabilityLoading}>{reviewing ? 'Revisando…' : 'Revisar reserva'}<ArrowRight size={18} /></Action><p className="max-w-sm text-sm text-[var(--brand-muted)]">Revisar no guarda la reserva ni retiene el turno.</p></div>
    </section>}
  </form>;
}
