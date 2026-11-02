import type { Metadata } from 'next';
import { BookingForm } from '@/components/booking/booking-form';
export const metadata: Metadata = { title: 'Reservar — Filo Azul', robots: { index: false, follow: false } };
export default function ReservarPage() { return <BookingForm />; }
