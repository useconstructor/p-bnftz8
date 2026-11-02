import 'server-only';
import type { BookingConfig, CatalogData } from './booking-engine';
import { filoPhoto, filoServices } from '@/lib/filo';
const catalog: CatalogData = {
 version: 1, presentacionVersion: 1, moneda: 'COP', zonaHoraria: 'America/Bogota',
 opciones: filoServices.map(service => ({ ...service, duracionMinutos: 60, recursos: [{ ...filoPhoto }] })),
 politica: { diasSemana: [1,2,3,4,5,6], horas: ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'], minPersonas: 1, maxPersonas: 1, capacidad: 1, capacidadCompartida: true },
};
export function getBookingConfig(): BookingConfig {
 const appOrigin = process.env.APP_ORIGIN;
 if (!appOrigin) throw new Error('APP_ORIGIN is required');
 return { namespace: 'booking', appOrigin, vercelUrl: process.env.VERCEL_URL || undefined, catalog: structuredClone(catalog) };
}
