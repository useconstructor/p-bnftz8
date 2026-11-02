import Link from 'next/link';
import { BrandPage } from '@/components/brand';
export default function NotFound() { return <BrandPage title="Este camino no lleva a una silla."><p>No encontramos la página. Puedes explorar los servicios o volver al inicio.</p><div className="mt-4 flex gap-4"><Link href="/" className="brand-link">Volver al inicio</Link><Link href="/servicios" className="brand-link">Ver servicios</Link></div></BrandPage>; }
