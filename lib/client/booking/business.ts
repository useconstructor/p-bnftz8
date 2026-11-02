import { BookingError, type BookingController } from './controller';
import type { Catalog, Option, Reservation, Resource } from './types';

export function bookingHref(id: string): string { return '/reservar?opcion=' + encodeURIComponent(id); }
export function confirmationHref(record: Reservation): string { return '/confirmacion?codigo=' + encodeURIComponent(record.codigo); }
export function detailHref(record: Reservation): string { return '/reserva/' + encodeURIComponent(record.codigo); }
export type PublicOfferItem = { id: string; nombre: string; descripcion: string; precio: number; recursos: Resource[] };
export async function fetchPublicCatalog(): Promise<Catalog> {
  const response = await fetch('/api/catalogo', { credentials: 'same-origin', cache: 'no-store' });
  const envelope = await response.json();
  if (!response.ok || envelope.ok !== true) throw new Error(envelope.error?.message || 'No pudimos consultar los servicios. Reintenta.');
  const data = envelope.data as Catalog;
  if (!data || !Number.isInteger(data.version) || !Number.isInteger(data.presentacionVersion) || typeof data.moneda !== 'string' || typeof data.zonaHoraria !== 'string' || !data.politica || !Array.isArray(data.opciones) || data.opciones.some((option: Option) => !option.id || !option.nombre || typeof option.descripcion !== 'string' || !Number.isFinite(option.precio) || !Array.isArray(option.recursos))) throw new Error('Los servicios no están disponibles. Reintenta la consulta.');
  return data;
}
export async function fetchPublicOffer(): Promise<{ moneda: string; items: PublicOfferItem[] }> {
  const catalog = await fetchPublicCatalog();
  return { moneda: catalog.moneda, items: catalog.opciones };
}
export async function loadOwnedCode(controller: BookingController, codigo: string): Promise<Reservation> {
  if (!codigo || codigo.length > 100) throw new BookingError('NOT_FOUND', 'No encontramos esa reserva en esta sesión.', 404);
  const records = await controller.loadReservations();
  const record = records.find(item => item.codigo === codigo);
  if (!record) throw new BookingError('NOT_FOUND', 'No encontramos esa reserva en esta sesión.', 404);
  return controller.loadRecord(record.id);
}
export function money(value: number, currency = 'COP') { return new Intl.NumberFormat('es-CO', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value) + ' ' + currency; }
export function dateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || 'Sin fecha';
  const parsed = new Date(value + 'T12:00:00Z');
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}
export function localDate(zone: string) { const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); const read = (name: string) => parts.find(p => p.type === name)?.value; return `${read('year')}-${read('month')}-${read('day')}`; }
export function trackBooking(event: 'Booking started' | 'Service selected' | 'Booking contact' | 'Booking reviewed') { if (typeof window !== 'undefined') (window as Window & { constructorTrack?: (name: string) => void }).constructorTrack?.(event); }

// Choose a schedule date, not a claimed available slot. The API still checks capacity.
export function nextScheduledDate(catalog: Catalog, now = new Date()): string {
 const parts = new Intl.DateTimeFormat('en-CA', { timeZone: catalog.zonaHoraria, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
 const part = (name: string) => parts.find(value => value.type === name)?.value;
 const today = `${part('year')}-${part('month')}-${part('day')}`;
 const clock = new Intl.DateTimeFormat('en-GB', { timeZone: catalog.zonaHoraria, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
 const day = new Date(today + 'T12:00:00Z');
 for(let offset=0;offset<8;offset++) {
  if(catalog.politica.diasSemana.includes(day.getUTCDay()) && catalog.politica.horas.some(time => offset>0 || time>clock))return day.toISOString().slice(0,10);
  day.setUTCDate(day.getUTCDate()+1);
 }
 return '';
}
