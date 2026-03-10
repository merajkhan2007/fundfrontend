'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AddMemberPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [status, setStatus] = useState('ACTIVE');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/members', {
                name,
                email,
                mobile,
                password,
                address,
                monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : 0,
                role,
                status
            });
            toast.success('Member created successfully');
            router.push('/admin/members');
        } catch (error: any) {
            let errMsg = 'Failed to create member';
            if (error.response?.data?.error) {
                if (Array.isArray(error.response.data.error)) {
                    errMsg = error.response.data.error.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
                } else {
                    errMsg = error.response.data.error;
                }
            }
            toast.error(errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" className="mb-4">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Add New Member</h1>
                <p className="text-muted-foreground">Manually register a new member to the MAQASIDFund pool.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Details</CardTitle>
                    <CardDescription>Fill in the required information to create a new profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address (Optional)</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyAmount">Target Monthly Contribution (INR)</Label>
                            <Input
                                id="monthlyAmount"
                                type="number"
                                min="0"
                                value={monthlyAmount}
                                onChange={(e) => setMonthlyAmount(e.target.value)}
                                placeholder="e.g. 5000"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Initial Status</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Member...' : 'Create Member'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
