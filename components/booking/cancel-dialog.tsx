'use client';
import { useEffect, useRef } from 'react';
import { useNativeBookingDialog } from '@/lib/client/booking/presentation';
import type { Reservation } from '@/lib/client/booking/types';
import { dateLabel } from '@/lib/client/booking/business';
import { Action, headingStyle } from './ui';
export type CancellationIdentity={identity:string;id:string;codigo:string};
export function CancelDialog({record,identity,canCancel,busy,isAuthorized,onCancel}:{record:Reservation;identity:string;canCancel:boolean;busy:boolean;isAuthorized:()=>boolean;onCancel:(opened:CancellationIdentity)=>Promise<void>}) {
 const triggerRef=useRef<HTMLButtonElement>(null);const modal=useNativeBookingDialog({triggerRef});const opened=useRef<CancellationIdentity|null>(null);const submitting=useRef(false);
 useEffect(()=>{if(!canCancel&&!busy){opened.current=null;modal.close();}},[canCancel,busy,identity,record.id,record.codigo,modal.close]);
 useEffect(()=>()=>{opened.current=null;},[identity,record.id,record.codigo]);
 if(record.estado==='cancelada')return null;
 const open=()=>{if(!canCancel||busy||!isAuthorized())return;opened.current={identity,id:record.id,codigo:record.codigo};modal.open();};
 const confirm=async()=>{const saved=opened.current;if(submitting.current||!canCancel||busy||!isAuthorized()||!saved||saved.identity!==identity||saved.id!==record.id||saved.codigo!==record.codigo)return;submitting.current=true;try{await onCancel(saved);modal.close();}finally{submitting.current=false;}};
 return <><button type="button" ref={triggerRef} data-booking-action="cancel" disabled={!canCancel||busy} onClick={open} className="min-h-11 border border-[var(--brand-accent)] px-4 py-2 font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-surface)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)] disabled:opacity-55">Cancelar reserva</button>
  <dialog ref={modal.dialogRef} aria-labelledby={`cancel-title-${record.id}`} aria-describedby={`cancel-description-${record.id}`} className="fixed inset-0 m-auto max-h-[90dvh] w-[min(92vw,560px)] overflow-y-auto border-t-4 border-[var(--brand-accent)] bg-[var(--brand-background)] p-6 text-[var(--brand-text)] backdrop:bg-[var(--brand-primary)]/70 md:p-8">
   <h2 id={`cancel-title-${record.id}`} className={`${headingStyle} text-2xl`}>¿Cancelar esta reserva?</h2><p id={`cancel-description-${record.id}`} className="my-4"><strong>{record.opcionNombre}</strong><br/>{dateLabel(record.fecha)} · {record.hora}<br/><span className="text-sm">Código {record.codigo}</span></p><p className="mb-5 text-sm">El turno se libera únicamente cuando el servidor confirma la cancelación. La reserva seguirá en tu historial como cancelada.</p>
   <div className="flex flex-wrap gap-3"><Action secondary disabled={busy} onClick={()=>{opened.current=null;modal.close('keep');}}>Volver sin cancelar</Action><Action disabled={!canCancel||busy} data-booking-action="confirm-cancel" onClick={()=>void confirm()}>{busy?'Comprobando cancelación…':'Confirmar cancelación'}</Action></div>
  </dialog>
 </>;
}
