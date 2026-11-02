import type { Metadata } from 'next';
import { ReviewPage } from '@/components/booking/review-page';
export const metadata: Metadata = { title: 'Revisar reserva — Filo Azul', robots: { index: false, follow: false } };
export default function RevisionPage() { return <ReviewPage />; }
