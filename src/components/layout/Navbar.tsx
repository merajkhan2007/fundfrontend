'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<'ADMIN' | 'MEMBER' | null>(null);

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
        router.push('/login');
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
            <nav className="glass w-full max-w-5xl rounded-full border border-primary/20 bg-background/60 shadow-lg shadow-primary/5 pointer-events-auto backdrop-blur-xl transition-all duration-300 hover:shadow-primary/10 hover:border-primary/30">
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

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        {isLoggedIn ? (
                            <>
                                <Link href={userRole === 'ADMIN' ? '/admin/dashboard' : '/member/dashboard'}>
                                    <Button variant="ghost" className="hidden sm:flex rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-all">
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
                                    <Button variant="ghost" className="rounded-full hidden sm:flex font-medium hover:bg-primary/10 hover:text-primary transition-all">
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
                </div>
            </nav>
        </div>
    );
}
