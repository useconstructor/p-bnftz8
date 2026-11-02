'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrandNotice, BrandPage, WorkshopEdge } from '@/components/brand';
import { dateLabel, detailHref, money } from '@/lib/client/booking/business';
import type { Reservation } from '@/lib/client/booking/types';
import { useFlow } from './flow-provider';
import { RecoveryPanel } from './recovery-panel';
import { Action, RouteAction } from './ui';
export function HistoryPage() {
 const {controller,state}=useFlow();
 const [snapshot,setSnapshot]=useState<{owner:typeof controller;rows:Reservation[]}|null>(null);
 const [read,setRead]=useState<{owner:typeof controller;status:'loading'|'verified'|'error';error:string}>({owner:controller,status:'loading',error:''});
 const sequence=useRef(0);const activeOwner=useRef(controller);activeOwner.current=controller;
 const rows=snapshot?.owner===controller?snapshot.rows:null;const status=read.owner===controller?read.status:'loading';const error=read.owner===controller?read.error:'';
 const reload=useCallback(async()=>{const ticket=++sequence.current;const current=()=>ticket===sequence.current&&activeOwner.current===controller;setSnapshot(previous=>previous?.owner===controller?previous:null);setRead({owner:controller,status:'loading',error:''});try{await controller.start();if(!current())return;const result=await controller.loadReservations();if(!current())return;setSnapshot({owner:controller,rows:result});setRead({owner:controller,status:'verified',error:''});}catch(issue){if(current())setRead({owner:controller,status:'error',error:issue instanceof Error?issue.message:'No pudimos consultar tus reservas.'});}},[controller]);
 useEffect(()=>{void reload();return()=>{sequence.current++;};},[reload]);
 return <BrandPage title="Tus turnos en Filo Azul." subtitle="Registros privados de esta sesión. Reservas de demostración, sin pagos ni mensajes."><div className="max-w-4xl pb-8"><RecoveryPanel onRecovered={()=>void reload()} onNewIntent={()=>void reload()}/>{status==='loading'&&<p role="status">Consultando tus reservas…</p>}{error&&<BrandNotice kind="error" title="No pudimos actualizar tus reservas"><p>{error}</p></BrandNotice>}{rows&&status!=='verified'&&<BrandNotice kind="info" title="Última lectura verificada"><p>Conservamos los registros consultados anteriormente. Su estado actual necesita verificarse de nuevo.</p></BrandNotice>}{rows?.length===0&&<section className="border-y border-brand-muted/40 py-6"><h2 className="font-heading text-2xl">Todavía no hay turnos aquí.</h2><p className="mt-3">{status==='verified'?'Esta sesión no tiene reservas guardadas.':'La última consulta verificada no tenía reservas.'} Explorar los servicios no crea una reserva.</p><RouteAction href="/servicios" secondary>Explorar servicios</RouteAction></section>}{rows&&rows.length>0&&<ul className="space-y-4">{rows.map(row=><li key={row.id}><WorkshopEdge serviceName={row.opcionNombre} status={status==='verified'&&row.estado==='cancelada'?'cancelled':'neutral'}><p>{dateLabel(row.fecha)} · {row.hora} · Hora de Bogotá</p><p className="mt-2">{status==='verified'?'Estado':'Último estado verificado'}: <strong>{row.estado==='activa'?'Activa':'Cancelada'}</strong></p><p className="mt-2 text-sm">{money(row.precio,row.moneda)} · 60 min · Código {row.codigo}</p><Link className="brand-link mt-2" href={detailHref(row)}>Abrir detalle y gestionar reserva</Link></WorkshopEdge></li>)}</ul>}<div className="mt-6 flex flex-wrap gap-3"><Action secondary disabled={status==='loading'||Boolean(state.pending)} onClick={()=>void reload()}>Recargar mis reservas</Action><RouteAction href="/servicios" secondary>Ver servicios</RouteAction></div></div></BrandPage>;
}
