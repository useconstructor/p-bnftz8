'use client';
import Link from 'next/link';
import { BrandPage, BrandNotice } from '@/components/brand';
export default function ErrorPage({ reset }: { reset: () => void }) { return <BrandPage title="La página necesita otro intento."><BrandNotice kind="error" title="No pudimos mostrar esta página"><p>Vuelve a intentarlo. Puedes regresar a los servicios sin crear una nueva reserva.</p><button type="button" onClick={reset} className="brand-button mt-4">Reintentar página</button></BrandNotice><Link href="/servicios" className="brand-link">Ver servicios</Link></BrandPage>; }
