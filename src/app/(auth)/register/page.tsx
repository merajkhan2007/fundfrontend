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

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        address: '',
        monthlyAmount: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/register', {
                ...formData,
                monthlyAmount: formData.monthlyAmount ? parseFloat(formData.monthlyAmount) : 0
            });
            toast.success('Registration successful. Please login.');
            router.push('/login');
        } catch (err: any) {
            let errMsg = 'Failed to register';
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
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" required onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="m@example.com" required onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input id="mobile" placeholder="+1234567890" required onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" placeholder="123 Main St, City" onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="monthlyAmount">Monthly Contribution (Optional)</Label>
                            <Input id="monthlyAmount" type="number" placeholder="100.00" onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required onChange={handleChange} />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Registering...' : 'Create account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
