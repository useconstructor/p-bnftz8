import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RecordPage } from '@/components/booking/record-page';
export const metadata: Metadata = { title: 'Detalle de reserva — Filo Azul', robots: { index: false, follow: false } };
export default function ReservaPage() { return <Suspense fallback={<p role="status">Consultando tu reserva…</p>}><RecordPage /></Suspense>; }
