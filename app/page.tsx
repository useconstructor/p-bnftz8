import Link from 'next/link';
import { FiloPhoto, ServiceCatalogue, WorkshopRitual, BookingInvitation, PhotoCredits } from '@/components/filo/public';

export default function Home() {
  return (
    <main id="contenido" className="bg-[#EFF4F5] text-[#153E55]">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-10 lg:pt-20">
        <div className="flex justify-between border-t-2 border-[#153E55] pt-3 text-xs font-semibold uppercase tracking-widest">
          <span>Filo Azul / Taller conceptual</span><span>Bogotá · 01</span>
        </div>
        <div className="grid items-end gap-8 py-10 lg:grid-cols-[1.2fr_1fr]">
          <h1 className="font-heading text-6xl font-bold leading-[1.02] tracking-tighter sm:text-8xl">Un corte con carácter.</h1>
          <div className="border-l-4 border-[#AF552F] pl-6">
            <p className="max-w-sm text-xl">Una silla. Herramientas a la vista. El cuidado como punto de encuentro.</p>
            <Link href="/reservar" className="brand-button mt-6">Explorar turnos</Link>
          </div>
        </div>
        <div className="border-x border-[#153E55]/30 bg-[#D6E0E3] p-3 sm:p-6">
          <FiloPhoto variant="hero" />
          <p className="mt-4 text-sm">Referencia de taller: fotografía real de Winn’s Barber Shop, no de unas instalaciones de Filo Azul.</p>
        </div>
        <p className="mt-4 text-sm">Demostración ficticia en Chapinero, Bogotá. Sin atención presencial ni cobros.</p>
      </section>

      <section className="bg-[#153E55] px-5 py-16 text-[#EFF4F5] sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <h2 className="font-heading text-4xl font-semibold tracking-tight">Acero, oficio<br />y una pausa.</h2>
          <p className="max-w-xl text-lg leading-relaxed">Filo Azul imagina una barbería de barrio desde lo esencial: la silla como centro, el azul petróleo como calma y el cobre como acento de trabajo. Un taller conceptual donde cada línea tiene intención; no una historia de negocio real.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-5 py-16 sm:px-10">
        <section id="servicios">
          <p className="text-sm uppercase tracking-widest text-[#AF552F]">02 / Elige la forma</p>
          <h2 className="mb-8 mt-3 font-heading text-4xl font-semibold">Cuatro servicios. Una silla.</h2>
          <ServiceCatalogue />
        </section>
        <section id="ritual">
          <h2 className="mb-8 font-heading text-4xl font-semibold">03 / El ritual del taller</h2>
          <WorkshopRitual />
        </section>
        <section id="ubicacion">
          <p className="mb-5 border-l-4 border-[#AF552F] pl-4">Chapinero / Bogotá · Ubicación conceptual, sin dirección de atención.</p>
          <BookingInvitation />
        </section>
        <PhotoCredits />
      </div>
    </main>
  );
}