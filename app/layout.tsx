import type { Metadata } from 'next';
import Script from 'next/script';
import { BrandShell } from '@/components/brand';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Filo Azul · Un corte con carácter.', template: '%s · Filo Azul' }, description: 'Barbería ficticia en Chapinero, Bogotá. Cuatro servicios de demostración y reservas privadas de una silla. Ubicación y precios de ejemplo.', applicationName: 'Filo Azul', icons: { icon: '/brand/mark.svg' } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
 return <html lang="es"><body><BrandShell>{children}</BrandShell><Script src="/constructor-analytics.js" strategy="afterInteractive" /></body></html>;
}
