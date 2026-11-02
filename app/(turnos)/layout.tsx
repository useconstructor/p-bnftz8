import type { ReactNode } from 'react';
import { FlowProvider } from '@/components/booking/flow-provider';
export default function BookingLayout({ children }: { children: ReactNode }) { return <FlowProvider>{children}</FlowProvider>; }
