'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BrandPage, BrandSteps } from '@/components/brand';
import { useBookingController } from '@/lib/client/booking/use-booking-controller';
import { useMountedBookingFocus } from '@/lib/client/booking/presentation';
import { nextScheduledDate, trackBooking } from '@/lib/client/booking/business';
import type { Field, RawDraft } from '@/lib/client/booking/types';
import { ContextMedia } from './context-media';
import { RecoveryPanel } from './recovery-panel';

function useFlowOwner() {
  const { state, controller } = useBookingController();
  const focus = useMountedBookingFocus();
  const router = useRouter();
  const [step, setStep] = useState<'opcion-turno' | 'contacto'>('opcion-turno');
  const [availabilityRetry, setAvailabilityRetry] = useState(0);
  const [mediaEpoch, setMediaEpoch] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const reviewLock = useRef(false);
  const initialized = useRef(false);
  const initiallyEmptyNewDraft = useRef<boolean | null>(null);
  const catalogVersion = state.catalog?.version;
  const optionId = state.draft.opcion, date = state.draft.fecha, party = state.draft.personas;
  const isBooking = usePathname() === '/reservar' || usePathname() === '/revision';
  // Observe the bootstrap publication before a selected URL option is persisted.
  // This distinguishes a genuinely fresh draft from an older raw draft with no date.
  useEffect(() => {
    const capture = () => {
      const current = controller.getSnapshot();
      if (!current.catalog || initiallyEmptyNewDraft.current !== null) return;
      const draft = current.draft;
      initiallyEmptyNewDraft.current = current.revision === 0 && !current.pending && !current.recoveries.length && !current.draftConflict && !current.lastValid && !current.record && !draft.opcion && !draft.fecha && !draft.hora && !draft.nombre && !draft.email && !draft.telefono && !draft.notas && draft.paso === 'opcion-turno' && draft.personas === String(current.catalog.politica.minPersonas);
    };
    capture(); return controller.subscribe(capture);
  }, [controller]);
  useEffect(() => {
    const current = controller.getSnapshot();
    if (!current.catalog || initialized.current || !isBooking) return;
    initialized.current = true;
    setStep(current.draft.paso === 'contacto' ? 'contacto' : 'opcion-turno');
    const draft = current.draft;
    const emptyNewDraft = initiallyEmptyNewDraft.current === true && current.revision <= 1 && !current.pending && !current.recoveries.length && !current.draftConflict && !current.lastValid && !current.record && !draft.fecha && !draft.hora && !draft.nombre && !draft.email && !draft.telefono && !draft.notas && draft.paso === 'opcion-turno' && draft.personas === String(current.catalog.politica.minPersonas);
    if (emptyNewDraft) {
      const scheduledDate = nextScheduledDate(current.catalog);
      if (scheduledDate) void controller.editDraft({ fecha: scheduledDate }).catch(() => {});
    }
  }, [controller, catalogVersion, isBooking]);
  useEffect(() => {
    const current = controller.getSnapshot();
    if (!isBooking || !current.catalog || !optionId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !current.catalog.opciones.some(item => item.id === optionId)) return;
    void controller.loadAvailability();
    // Publications from this request do not schedule another request.
  }, [controller, catalogVersion, optionId, date, party, availabilityRetry, isBooking]);
  const edit = (patch: Partial<RawDraft>) => { void controller.editDraft(patch).catch(() => {}); };
  const focusField = (field: Field) => {
    const target = ['catalogoVersion', 'presentacionVersion', 'paso'].includes(field) ? 'opcion' : field;
    setStep(['opcion', 'fecha', 'hora', 'personas'].includes(target) ? 'opcion-turno' : 'contacto');
    router.push('/reservar'); focus.requestFocus(target);
  };
  const review = async () => {
    if (reviewLock.current) return;
    reviewLock.current = true; setReviewing(true);
    try {
      const snapshot = await controller.reviewServer();
      if (snapshot) { trackBooking('Booking reviewed'); router.push('/revision'); }
      else { const field = controller.getSnapshot().firstErrorField; if (field) focusField(field); }
    } finally { reviewLock.current = false; setReviewing(false); }
  };
  return { state, controller, focus, step, setStep, edit, focusField, review, reviewing, retryAvailability: () => setAvailabilityRetry(value => value + 1), mediaEpoch, renewPresentation: () => { setMediaEpoch(value => value + 1); setAvailabilityRetry(value => value + 1); } };
}
type Flow = ReturnType<typeof useFlowOwner>;
const FlowContext = createContext<Flow | null>(null);
export function useFlow() { const value = useContext(FlowContext); if (!value) throw new Error('Booking flow requires its route layout.'); return value; }
export function FlowProvider({ children }: { children: ReactNode }) {
  const flow = useFlowOwner(); const path = usePathname();
  const booking = path === '/reservar' || path === '/revision';
  const { state, controller } = flow;
  const selected = !state.referenceError ? state.catalog?.opciones.find(option => option.id === state.draft.opcion) : undefined;
  const resource = selected?.recursos[0];
  return <FlowContext.Provider value={flow}>
    {booking ? <BrandPage title={path === '/revision' ? 'Revisar reserva' : 'Reserva tu turno'} className="booking-page">
      <div data-booking-flow data-booking-phase={state.phase} className="mx-auto w-full max-w-5xl">
        <div className="mb-4 flex items-center gap-4">
          {resource && <ContextMedia key={`${selected!.id}-${flow.mediaEpoch}`} resource={resource} variant="compact" className="w-28 shrink-0 md:w-40" onReady={(_, ready) => controller.setMediaReady(ready)} onDispose={() => controller.setMediaReady(false)} />}
          <div className="min-w-0 flex-1"><BrandSteps current={path === '/revision' ? 'revision' : flow.step} /><p className="mt-1 text-xs text-[var(--brand-muted)]">Una silla · 60 minutos · Hora de Bogotá</p></div>
        </div>
        <RecoveryPanel />
        {state.phase === 'loading' || state.phase === 'idle' ? <p className="py-6" role="status">Preparando tu reserva privada…</p> : children}
      </div>
    </BrandPage> : children}
  </FlowContext.Provider>;
}
