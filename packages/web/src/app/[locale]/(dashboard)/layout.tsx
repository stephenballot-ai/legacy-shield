'use client';

import { useState, type ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  Users,
  AlertTriangle,
  X,
} from 'lucide-react';

import { authApi } from '@/lib/api/auth';

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/documents',         label: 'Documents',        icon: FileText },
  { href: '/emergency-access',  label: 'Emergency access', icon: ShieldAlert },
  { href: '/settings?tab=referrals', label: 'Refer friends', icon: Users },
  { href: '/settings',          label: 'Settings',         icon: Settings },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'color-mix(in oklab, var(--ls-ink-deep) 55%, transparent)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-bg-raised transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ borderRight: '1px solid var(--line)' }}
      >
        <div
          className="flex h-16 items-center justify-between px-[var(--s-7)]"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <Link href="/dashboard" className="no-underline">
            <Logo size="sm" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-fg-subtle hover:text-fg"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-[var(--s-7)] pt-[var(--s-7)] pb-[var(--s-3)]">
          <span className="t-eyebrow text-fg-subtle">§ Custody</span>
        </div>

        <nav className="flex-1 px-[var(--s-5)] space-y-[2px]">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href as any}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-[var(--s-5)] rounded-[var(--r-sm)] px-[var(--s-5)] py-[var(--s-4)] text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-bg-sunken text-fg'
                    : 'text-fg-muted hover:bg-bg-sunken hover:text-fg'
                )}
                style={
                  active
                    ? { boxShadow: 'inset 2px 0 0 var(--accent)' }
                    : undefined
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div
          className="p-[var(--s-5)]"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center gap-[var(--s-5)] rounded-[var(--r-sm)] px-[var(--s-5)] py-[var(--s-4)] text-[13px] font-medium text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleResend = async () => {
    setResending(true);
    setResendStatus('idle');
    try {
      await authApi.resendVerification();
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bg text-fg">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          {!user?.emailVerified && (
            <div
              className="flex items-center justify-center gap-[var(--s-4)] px-[var(--s-6)] py-[var(--s-3)] text-[12px]"
              style={{
                background: 'var(--warn-bg)',
                color: 'var(--warn)',
                borderBottom: '1px solid color-mix(in oklab, var(--warn) 25%, transparent)',
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />
              {resendStatus === 'sent' ? (
                <span style={{ color: 'var(--ok)' }}>Verification link sent. Check your inbox.</span>
              ) : resendStatus === 'error' ? (
                <>
                  <span style={{ color: 'var(--danger)' }}>Failed to send.</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="underline-offset-4 hover:underline"
                  >
                    Try again
                  </button>
                </>
              ) : (
                <>
                  <span>Please verify your email to enable emergency access.</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    {resending ? 'Sending…' : 'Resend link'}
                  </button>
                </>
              )}
            </div>
          )}

          <header
            className="flex h-16 items-center justify-between bg-bg-raised px-[var(--s-6)] lg:px-[var(--s-8)]"
            style={{ borderBottom: '1px solid var(--line)' }}
          >
            <div className="flex items-center gap-[var(--s-5)]">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="text-fg-subtle hover:text-fg lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.6} />
              </button>
              <div className="lg:hidden">
                <Link href="/dashboard" className="no-underline">
                  <Logo size="sm" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-[var(--s-5)]">
              <span className="ls-status hidden md:inline-flex">
                <span className="pulse" />
                Vault online · Frankfurt
              </span>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-[var(--s-4)] hover:opacity-80"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="hidden font-mono text-[12px] text-fg-subtle sm:block">
                    {user?.email}
                  </span>
                  <span
                    className="grid h-8 w-8 place-items-center rounded-[var(--r-sm)] text-[13px] font-medium"
                    style={{
                      background: 'var(--ls-ink-deep)',
                      color: 'var(--ls-bone-soft)',
                      boxShadow: 'inset 0 0 0 1px var(--ls-gold-soft)',
                    }}
                  >
                    {user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div
                      className="absolute right-0 top-full z-40 mt-2 w-52 overflow-hidden bg-bg-raised py-1"
                      style={{
                        border: '1px solid var(--line)',
                        borderRadius: 'var(--r-md)',
                        boxShadow: 'var(--shadow-3)',
                      }}
                    >
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-[var(--s-4)] px-[var(--s-6)] py-[var(--s-4)] text-[13px] text-fg-muted no-underline transition-colors hover:bg-bg-sunken hover:text-fg"
                      >
                        <Settings className="h-4 w-4" strokeWidth={1.6} />
                        Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-[var(--s-4)] px-[var(--s-6)] py-[var(--s-4)] text-[13px] text-fg-muted transition-colors hover:bg-bg-sunken hover:text-fg"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.6} />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 px-[var(--s-6)] py-[var(--s-7)] lg:px-[var(--s-9)] lg:py-[var(--s-9)]">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
