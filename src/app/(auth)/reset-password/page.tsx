'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing password reset token.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid token. Please request a new reset link.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/auth/reset-password', {
                token,
                password
            });
            setSuccess(true);
            toast.success(data.message || 'Password successfully reset!');
        } catch (err: any) {
            let errMsg = 'Failed to reset password. The link might be expired.';
            if (err.response?.data?.error) {
                if (Array.isArray(err.response.data.error)) {
                    errMsg = err.response.data.error.map((e: any) => `${e.path?.join('.') || 'Error'}: ${e.message}`).join(', ');
                } else {
                    errMsg = err.response.data.error;
                }
            }
            toast.error(typeof errMsg === 'string' ? errMsg : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center p-4">
                <Card className="glass w-full max-w-md shadow-lg border-primary/20 text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight text-green-600 dark:text-green-400">Password Reset Complete</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Your password has been successfully updated. You can now use your new password to log in.</p>
                        <Link href="/login" className="w-full">
                            <Button className="w-full">Go to Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="glass w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Set New Password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!token ? (
                        <div className="text-center text-red-500 font-medium py-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                            Missing reset token. Please use the link sent to your email.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Saving...' : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex min-h-[80vh] items-center justify-center text-muted-foreground p-8">Loading password reset...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
