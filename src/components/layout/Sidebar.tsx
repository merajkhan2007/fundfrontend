'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    Banknote,
    CreditCard,
    FileText
} from 'lucide-react';

const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Deposits', href: '/admin/deposits', icon: Banknote },
    { name: 'Loans', href: '/admin/loans', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: FileText },
];

const memberLinks = [
    { name: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Deposits', href: '/member/deposits', icon: Banknote },
    { name: 'Apply Loan', href: '/member/loans/apply', icon: CreditCard },
];

export function Sidebar() {
    const pathname = usePathname();

    // Determine context based on URL route.
    const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/reports');
    // If we're on a strictly member route, use member links, else fallback to something safe
    const isMember = pathname?.startsWith('/member');

    // Only render sidebar content if we are distinctly in admin or member area
    if (!isAdmin && !isMember) return null;

    const links = isAdmin ? adminLinks : memberLinks;

    return (
        <aside className="hidden lg:flex flex-col w-64 glass-sidebar fixed left-4 top-24 bottom-4 z-40 overflow-y-auto rounded-3xl border border-primary/20 shadow-lg shadow-primary/5 backdrop-blur-xl transition-all duration-300">
            <div className="flex-1 py-6 px-4">
                <div className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-primary/70">
                    {isAdmin ? 'Admin Menu' : 'Member Menu'}
                </div>
                <nav className="space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;

                        // Exact match for dashboard to prevent matching nested routes falsely
                        const isDashboard = link.href.endsWith('/dashboard');
                        const isActive = isDashboard
                            ? pathname === link.href
                            : pathname?.startsWith(link.href);

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 translate-x-1"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", isActive ? "animate-pulse" : "")} />
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}
