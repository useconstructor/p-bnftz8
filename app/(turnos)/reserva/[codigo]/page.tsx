import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RecordPage } from '@/components/booking/record-page';
export const metadata: Metadata = { title: 'Detalle de reserva — Filo Azul', robots: { index: false, follow: false } };
export default async function ReservaPage({ params }: { params: Promise<{ codigo: string }> }) { const { codigo } = await params; return <Suspense fallback={<p role="status">Consultando tu reserva…</p>}><RecordPage codigo={codigo} /></Suspense>; }
