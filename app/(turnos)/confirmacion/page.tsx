import { Suspense } from 'react';
import type { Metadata } from 'next';
import { RecordPage } from '@/components/booking/record-page';
export const metadata: Metadata = { title: 'Confirmación — Filo Azul', robots: { index: false, follow: false } };
export default function ConfirmacionPage() { return <Suspense fallback={<p role="status">Consultando confirmación…</p>}><RecordPage confirmation /></Suspense>; }
