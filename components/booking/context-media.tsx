'use client';
import { useRef } from 'react';
import { Expand, X } from 'lucide-react';
import type { Resource } from '@/lib/client/booking/types';
import { VerifiedBookingMedia, useNativeBookingDialog } from '@/lib/client/booking/presentation';
import { Action, focusStyle, headingStyle } from './ui';

type Props = { resource: Resource; variant: 'hero' | 'compact' | 'ritual'; onReady?: (resource: Resource, ready: boolean) => void; onDispose?: (resource: Resource) => void; className?: string };
export function ContextMedia({ resource, variant, onReady, onDispose, className = '' }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const viewer = useNativeBookingDialog({ triggerRef });
  const current = useRef(resource); current.current = resource;
  const same = (candidate: Resource | undefined) => candidate && ['id', 'version', 'url', 'sha256', 'width', 'height', 'alt'].every(key => candidate[key as keyof Resource] === current.current[key as keyof Resource]);
  return <figure className={`min-w-0 ${className}`}>
    <div className="relative">
      <VerifiedBookingMedia resource={resource}
        containerClassName={variant === 'compact' ? 'relative h-24 w-full bg-[var(--brand-surface)]' : variant === 'hero' ? 'relative aspect-[16/9] w-full bg-[var(--brand-surface)]' : 'relative aspect-[4/3] w-full bg-[var(--brand-surface)]'}
        className="absolute inset-0 h-full w-full object-contain object-center" loading={variant === 'ritual' ? 'lazy' : 'eager'}
        onReady={(actual, ready) => { if (same(actual)) onReady?.(actual!, ready); }}
        onDispose={actual => { if (same(actual)) { onReady?.(actual!, false); onDispose?.(actual!); } }}
        renderPending={<span className="flex h-full items-center justify-center px-2 text-xs" role="status">Cargando fotografía…</span>}
        renderError={({ retry }) => <div role="alert" className="flex h-full flex-wrap items-center justify-center gap-x-3 bg-[var(--brand-surface)] px-2 text-xs leading-4"><span>Fotografía no disponible.</span><button type="button" onClick={retry} className={`min-h-11 font-semibold underline underline-offset-4 ${focusStyle}`}>Reintentar imagen</button></div>} />
      <button ref={triggerRef} type="button" onClick={viewer.open} aria-label="Ver fotografía completa y créditos" className={`absolute right-0 bottom-0 flex min-h-11 min-w-11 items-center justify-center bg-[var(--brand-background)] text-[var(--brand-text)] ${focusStyle}`}><Expand size={18} /></button>
    </div>
    {variant !== 'compact' && <figcaption className="mt-2 text-xs leading-5 text-[var(--brand-muted)]">Fotografía documental representativa; no corresponde a Filo Azul. Encuadre de presentación. <button className={`min-h-11 underline ${focusStyle}`} onClick={viewer.open}>Ver original y créditos</button></figcaption>}
    <dialog ref={viewer.dialogRef} aria-labelledby={`foto-${resource.id}`} className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,1000px)] overflow-y-auto border border-[var(--brand-primary)] bg-[var(--brand-background)] p-4 text-[var(--brand-text)] backdrop:bg-[var(--brand-primary)]/70 md:p-8">
      <div className="mb-4 flex items-center justify-between gap-4"><h2 id={`foto-${resource.id}`} className={`${headingStyle} text-xl`}>La fotografía, completa</h2><Action secondary onClick={() => viewer.close()} aria-label="Cerrar fotografía"><X size={20} /></Action></div>
      <VerifiedBookingMedia resource={resource} className="max-h-[60dvh] w-full object-contain object-center" containerClassName="min-h-16 bg-[var(--brand-surface)]" renderPending={<p>Cargando fotografía…</p>} renderError={({ retry }) => <div role="alert" className="p-4"><p>No pudimos mostrar esta fotografía.</p><Action secondary onClick={retry}>Reintentar imagen</Action></div>} />
      <p className="mt-4 text-sm">{resource.alt}</p><p className="mt-2 text-xs leading-5">Imagen representativa de un espacio real ajeno a esta barbería ficticia. La vista completa conserva la imagen canónica sin recorte de presentación.</p>
      <p className="mt-2 text-xs leading-5">{resource.id === 'booking-context-1' ? <><a className="underline" href="https://commons.wikimedia.org/wiki/File:Winn%27s_Barber_Shop.jpg" target="_blank" rel="noreferrer">Winn’s Barber Shop · Visitor7</a> · <a className="underline" href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a></> : <a href="/media/booking-resources-v1.json" className="underline" target="_blank" rel="noreferrer">Procedencia del recurso documental</a>}</p>
    </dialog>
  </figure>;
}
