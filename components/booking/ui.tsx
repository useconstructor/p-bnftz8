'use client';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
export const focusStyle = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-accent)]';
export const buttonStyle = `inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-primary)] bg-[var(--brand-primary)] px-5 py-3 text-base font-semibold text-[var(--brand-background)] transition-colors hover:bg-[var(--brand-text)] active:translate-y-px disabled:cursor-wait disabled:opacity-55 ${focusStyle}`;
export const secondaryStyle = `inline-flex min-h-11 items-center justify-center gap-2 border border-[var(--brand-primary)] bg-transparent px-4 py-2 text-base font-semibold text-[var(--brand-text)] hover:bg-[var(--brand-surface)] disabled:opacity-55 ${focusStyle}`;
export const fieldStyle = `min-h-11 w-full min-w-0 rounded-none border border-[var(--brand-muted)] bg-[var(--brand-background)] px-3 py-2 text-base text-[var(--brand-text)] aria-invalid:border-[var(--brand-accent)] ${focusStyle}`;
export const headingStyle = 'font-[family-name:var(--brand-font-heading)] font-semibold tracking-tight';
export function Action(props: ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) { const { secondary, className = '', ...rest } = props; return <button {...rest} className={`${secondary ? secondaryStyle : buttonStyle} ${className}`} />; }
export function RouteAction({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) { return <Link href={href} className={secondary ? secondaryStyle : buttonStyle}>{children}</Link>; }
export function InlineError({ id, children }: { id: string; children?: ReactNode }) { return children ? <p id={id} className="mt-2 text-sm font-medium text-[var(--brand-accent)]">{children}</p> : null; }
