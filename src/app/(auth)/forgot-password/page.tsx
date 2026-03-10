'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setSubmitted(true);
            toast.success(data.message || 'Reset link sent');
        } catch (err: any) {
            let errMsg = 'Failed to send reset link';
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

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="glass w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your email address to receive a password reset link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-background/50"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Sending link...' : 'Send Reset Link'}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                If an account exists with that email, we have sent a password reset link.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Please check your inbox (and spam folder) and click the link to reset your password.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center flex-col gap-2 border-t pt-4">
                    <div className="text-sm text-muted-foreground text-center">
                        Remember your password?{' '}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Back to login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
