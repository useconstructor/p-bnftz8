import type { Resource } from '@/lib/client/booking/types';
export const filoPhoto: Resource = { id: 'booking-context-1', version: 1, url: '/images/booking-context-1-v1.jpg', sha256: '8028c381299bc3da7fc4ea7ba5e5cdbb9548815b3b0d0c238faf3a8f8f5ccee5', alt: 'Sillones rojos y cromados, espejos y herramientas en Winn’s Barber Shop: fotografía real de Visitor7, representativa y ajena a Filo Azul.', width: 5472, height: 3648 };
export const filoServices = [
 { id: 'corte-clasico', nombre: 'Corte clásico', descripcion: 'Forma y contornos para el corte. Servicio de demostración.', precio: 45000 },
 { id: 'corte-y-barba', nombre: 'Corte y barba', descripcion: 'Una propuesta de corte y definición de barba en el mismo turno. Servicio de demostración.', precio: 65000 },
 { id: 'arreglo-de-barba', nombre: 'Arreglo de barba', descripcion: 'Definición de forma y contornos de la barba. Servicio de demostración.', precio: 30000 },
 { id: 'afeitado', nombre: 'Afeitado', descripcion: 'Una propuesta de afeitado y acabado. Servicio de demostración.', precio: 40000 },
] as const;
