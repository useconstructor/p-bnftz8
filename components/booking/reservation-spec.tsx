'use client';
import { useState } from 'react';
import type { Reservation, ReviewSnapshot } from '@/lib/client/booking/types';
import { dateLabel, money } from '@/lib/client/booking/business';
import { WorkshopEdge } from '@/components/brand';
import { Action, headingStyle } from './ui';
export function ReservationSpec({ review, record, verified = false, busy = false }: { review?: ReviewSnapshot; record?: Reservation; verified?: boolean; busy?: boolean }) {
  const [copyMessage, setCopyMessage] = useState<{ id: string; codigo: string; message: string } | null>(null);
  const data = record || review?.payload;
  if (!data) return null;
  const name = record?.opcionNombre || review!.opcion.nombre;
  const description = record?.opcionDescripcion || review!.opcion.descripcion;
  const price = record?.precio ?? review!.opcion.precio;
  const duration = record?.duracionMinutos ?? review!.opcion.duracionMinutos;
  const currency = record?.moneda || review!.moneda;
  const zone = record?.zonaHoraria || review!.zonaHoraria;
  return <div data-booking-selection data-booking-record-id={record?.id}>
    <WorkshopEdge serviceName={name} status={record && verified ? record.estado === 'cancelada' ? 'cancelled' : 'confirmed' : 'neutral'}><p className="text-lg font-semibold">{money(price, currency)} <span className="text-sm font-normal">precio demo · {duration} minutos</span></p></WorkshopEdge>
    <p className="my-4 max-w-2xl text-base text-[var(--brand-muted)]">{description}</p>
    <dl className="grid gap-x-8 gap-y-4 border-y border-[var(--brand-muted)]/40 py-5 sm:grid-cols-2">
      {Object.entries({ Fecha: dateLabel(data.fecha), Turno: data.hora, 'Zona horaria': zone, Nombre: data.nombre, Email: data.email, Teléfono: data.telefono, Personas: String(data.personas), Notas: data.notas || 'Sin notas' }).map(([label, value]) => <div key={label} className={label === 'Notas' ? 'sm:col-span-2' : ''}><dt className="mb-1 text-sm text-[var(--brand-muted)]">{label}</dt><dd className={`whitespace-pre-wrap break-words ${label === 'Fecha' || label === 'Turno' ? `${headingStyle} text-lg` : 'text-base'}`} data-booking-field={label}>{value}</dd></div>)}
    </dl>
    {record && <div className="mt-4"><Action secondary disabled={!verified || busy} onClick={async () => { const saved=record;try { await navigator.clipboard.writeText(saved.codigo);setCopyMessage({id:saved.id,codigo:saved.codigo,message:'Código copiado.'}); } catch { setCopyMessage({id:saved.id,codigo:saved.codigo,message:'No pudimos copiarlo. Puedes seleccionar el código mostrado arriba.'}); } }}>Copiar código</Action>{verified && copyMessage?.id===record.id && copyMessage.codigo===record.codigo && <p role="status" className="mt-2 text-sm">{copyMessage.message}</p>}</div>}
    {record && <dl className="mt-4 grid gap-3 text-xs text-[var(--brand-muted)] sm:grid-cols-2"><div><dt>Guardada</dt><dd>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: record.zonaHoraria }).format(new Date(record.createdAt))}</dd></div><div><dt>Última actualización</dt><dd>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: record.zonaHoraria }).format(new Date(record.updatedAt))}</dd></div>{record.cancelledAt && <div><dt>Cancelada</dt><dd>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: record.zonaHoraria }).format(new Date(record.cancelledAt))}</dd></div>}</dl>}
    {record && <details className="mt-3 border-t border-[var(--brand-muted)]/40 pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm underline">Ver fechas exactas guardadas</summary><dl className="grid gap-2 text-sm [&_dd]:break-all [&_dd]:whitespace-pre-wrap"><dt>Guardada</dt><dd>{record.createdAt}</dd><dt>Última actualización</dt><dd>{record.updatedAt}</dd>{record.cancelledAt && <><dt>Cancelada</dt><dd>{record.cancelledAt}</dd></>}</dl></details>}
  </div>;
}
