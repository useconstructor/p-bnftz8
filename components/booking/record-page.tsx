'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrandNotice, BrandPage } from '@/components/brand';
import { detailHref, loadOwnedCode } from '@/lib/client/booking/business';
import type { Reservation } from '@/lib/client/booking/types';
import { ContextMedia } from './context-media';
import { useFlow } from './flow-provider';
import { RecoveryPanel } from './recovery-panel';
import { ReservationSpec } from './reservation-spec';
import { CancelDialog, type CancellationIdentity } from './cancel-dialog';
import { Action, headingStyle, RouteAction } from './ui';
type Snapshot = { identity: string; record: Reservation };
type ReadState = { identity: string; status: 'loading' | 'verified' | 'error'; error: string };
export function RecordPage({ codigo: suppliedCode, confirmation = false }: { codigo?: string; confirmation?: boolean }) {
 const params = useSearchParams(); const router = useRouter(); const codigo = suppliedCode ?? params.get('codigo') ?? '';
 const { controller, state } = useFlow();
 const identity = JSON.stringify([confirmation ? 'confirmation' : 'detail', codigo]);
 const activeIdentity = useRef(identity); activeIdentity.current = identity;
 const [snapshot, setSnapshot] = useState<Snapshot|null>(null);
 const snapshotRef = useRef<Snapshot|null>(null); snapshotRef.current = snapshot;
 const [read, setRead] = useState<ReadState>({ identity, status: 'loading', error: '' });
 const sequence = useRef(0); const authorizedRead = useRef<CancellationIdentity|null>(null); const lock = useRef(false); const [busy,setBusy] = useState(false);
 const record = snapshot?.identity === identity ? snapshot.record : null;
 const loading = read.identity !== identity || read.status === 'loading';
 const verified = read.identity === identity && read.status === 'verified';
 const error = read.identity === identity ? read.error : '';
 const reload = useCallback(async () => {
  const ticket=++sequence.current; const current=()=>ticket===sequence.current && activeIdentity.current===identity;
  const previous=snapshotRef.current?.identity===identity?snapshotRef.current.record:null;
  authorizedRead.current=null;setSnapshot(value=>value?.identity===identity?value:null);setRead({identity,status:'loading',error:''});
  try { await controller.start();if(!current())return;const result=await loadOwnedCode(controller,codigo);if(!current())return;
   if(result.codigo!==codigo || (previous && result.id!==previous.id))throw new Error('No pudimos comprobar que el registro corresponde a esta reserva.');
   const next={identity,record:result};snapshotRef.current=next;setSnapshot(next);authorizedRead.current={identity,id:result.id,codigo:result.codigo};setRead({identity,status:'verified',error:''});
  } catch(issue) { if(current())setRead({identity,status:'error',error:issue instanceof Error?issue.message:'No pudimos consultar esta reserva.'}); }
 },[controller,codigo,identity]);
 useEffect(()=>{void reload();return()=>{sequence.current++;authorizedRead.current=null;};},[reload]);
 const isAuthorized=()=>activeIdentity.current===identity && !!record && authorizedRead.current?.identity===identity && authorizedRead.current.id===record.id && authorizedRead.current.codigo===record.codigo;
 const canCancel=!!record && record.estado==='activa' && verified && !busy && !state.pending;
 const cancel=async(opened:CancellationIdentity)=>{
  if(!canCancel || !record || lock.current || controller.getSnapshot().pending || !isAuthorized() || opened.identity!==identity || opened.id!==record.id || opened.codigo!==record.codigo)return;
  const ticket=++sequence.current;const current=()=>ticket===sequence.current&&activeIdentity.current===identity;
  authorizedRead.current=null;lock.current=true;setBusy(true);setRead({identity,status:'loading',error:''});
  try {const result=await controller.cancel(record.id);if(!current())return;
   if(result && result.id===record.id && result.codigo===record.codigo && result.estado==='cancelada') {const next={identity,record:result};snapshotRef.current=next;setSnapshot(next);authorizedRead.current={identity,id:result.id,codigo:result.codigo};setRead({identity,status:'verified',error:''});}
   else setRead({identity,status:'error',error:'No pudimos confirmar la cancelación. Recupera el envío original o comprueba el resultado antes de actuar de nuevo.'});
  }catch(issue){if(current())setRead({identity,status:'error',error:issue instanceof Error?issue.message:'No pudimos confirmar la cancelación.'});}
  finally{lock.current=false;setBusy(false);}
 };
 const recovered=(result:Reservation)=>{if(result.codigo===codigo && (!record || result.id===record.id))void reload();else router.push(detailHref(result));};
 return <BrandPage title={confirmation?verified&&record?(record.estado==='cancelada'?'Reserva demo cancelada':'Reserva demo guardada'):'Consultar confirmación':'Detalle de tu reserva'} subtitle="Tu registro privado en Filo Azul.">
  <div className="mx-auto max-w-4xl space-y-5 pb-8" data-booking-flow><RecoveryPanel onRecovered={recovered} onNewIntent={()=>void reload()}/>
   {loading&&<p role="status">Consultando el registro guardado…</p>}
   {error&&<BrandNotice kind="error" title={record?'No pudimos actualizar esta reserva':'No pudimos abrir esta reserva'}><p>{error}</p><div className="mt-3 flex flex-wrap gap-3"><Action disabled={loading||busy} onClick={()=>void reload()}>Reintentar consulta</Action><RouteAction href="/mis-reservas" secondary>Mis reservas</RouteAction></div></BrandNotice>}
   {record&&!verified&&<BrandNotice kind="info" title="Última lectura verificada"><p>Conservamos los datos consultados anteriormente. Su estado actual necesita verificarse de nuevo; la cancelación queda bloqueada mientras comprobamos el resultado.</p></BrandNotice>}
   {record&&<article data-booking-record-id={record.id} data-booking-read-state={verified?'verified':loading?'refreshing':'stale'} className="space-y-5">
    <header className="flex flex-wrap items-center gap-4">{record.recursos[0]&&<ContextMedia resource={record.recursos[0]} variant="compact" className="w-32"/>}<div><p className="text-sm text-[var(--brand-muted)]">Código de reserva</p><p className={`${headingStyle} break-all text-2xl`}>{record.codigo}</p><p className={`mt-1 text-sm font-semibold ${!verified||record.estado==='cancelada'?'text-[var(--brand-muted)]':'text-[var(--brand-success)]'}`}>{verified?(record.estado==='cancelada'?'Cancelada':'Guardada · activa'):`Último estado verificado: ${record.estado==='cancelada'?'cancelada':'activa'}`}</p></div></header>
    <p className="text-sm">{verified?(record.estado==='cancelada'?'La cancelación está confirmada por el servidor. Este registro se conserva en tu historial.':'La reserva demo quedó guardada. No implica atención real, pagos ni mensajes.'):'Los siguientes datos corresponden a la última consulta verificada, no a una confirmación del estado actual.'}</p>
    <ReservationSpec record={record} verified={verified} busy={busy}/>
    <div className="flex flex-wrap gap-3"><RouteAction href="/mis-reservas">Mis reservas</RouteAction>{confirmation?<RouteAction href={detailHref(record)} secondary>Abrir detalle</RouteAction>:<CancelDialog key={identity+record.id} record={record} identity={identity} canCancel={canCancel} busy={busy} isAuthorized={isAuthorized} onCancel={cancel}/>}<RouteAction href="/" secondary>Volver a Inicio</RouteAction></div>
   </article>}
   <Action secondary disabled={loading||busy} onClick={()=>void reload()}>{loading?'Consultando…':'Actualizar reserva'}</Action>
  </div>
 </BrandPage>;
}
