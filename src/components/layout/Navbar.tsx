'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER' | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Re-check auth state when path changes
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token) {
            setIsLoggedIn(true);
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role);
                } catch (e) {
                    console.error("Error parsing user from localStorage");
                }
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
        }
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        setIsMobileMenuOpen(false);
        router.push('/login');
    };

    // Close mobile menu when navigating
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <nav className={`glass w-full max-w-5xl rounded-3xl border border-primary/20 bg-background/60 shadow-lg shadow-primary/5 pointer-events-auto backdrop-blur-xl transition-all duration-300 hover:shadow-primary/10 hover:border-primary/30 ${isMobileMenuOpen ? 'pb-4' : ''}`}>
                <div className="flex h-16 items-center justify-between px-6">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-br from-primary to-secondary group-hover:scale-105 transition-transform duration-300 shadow-md">
                            <span className="text-primary-foreground font-bold text-lg leading-none">M</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary group-hover:opacity-80 transition-opacity">
                            MAQASIDFund
                        </span>
                    </Link>

                    {/* Desktop Navigation Actions */}
                    <div className="hidden lg:flex items-center space-x-2 md:space-x-4">
                        {isLoggedIn ? (
                            <>
                                <Link href={userRole === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'}>
                                    <Button variant="ghost" className="rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="rounded-full border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-medium"
                                >
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="rounded-full font-medium hover:bg-primary/10 hover:text-primary transition-all">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-0.5 border-0 font-semibold">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden flex items-center">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                        >
                            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden flex flex-col items-center space-y-3 px-6 pb-2 pt-2 border-t border-primary/10 animate-in slide-in-from-top-4 duration-300">
                        {isLoggedIn ? (
                            <>
                                {userRole === 'ADMIN' && (
                                    <>
                                        <Link href="/admin/dashboard" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Dashboard</Button>
                                        </Link>
                                        <Link href="/admin/members" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Members</Button>
                                        </Link>
                                        <Link href="/admin/deposits" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Deposits</Button>
                                        </Link>
                                        <Link href="/admin/loans" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Loans</Button>
                                        </Link>
                                        <Link href="/reports" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Reports</Button>
                                        </Link>
                                    </>
                                )}
                                {userRole === 'MEMBER' && (
                                    <>
                                        <Link href="/member/dashboard" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Dashboard</Button>
                                        </Link>
                                        <Link href="/member/deposits" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">My Deposits</Button>
                                        </Link>
                                        <Link href="/member/loans/apply" className="w-full">
                                            <Button variant="ghost" className="w-full rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">Apply Loan</Button>
                                        </Link>
                                    </>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="w-full rounded-full border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all font-medium mt-2"
                                >
                                    Log out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full rounded-full font-medium hover:bg-primary/10 hover:text-primary transition-all">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register" className="w-full">
                                    <Button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all border-0 font-semibold">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
}
