'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditMemberPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params?.id;

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [monthlyAmount, setMonthlyAmount] = useState('');
    const [role, setRole] = useState('MEMBER');
    const [status, setStatus] = useState('ACTIVE');

    useEffect(() => {
        if (!memberId) return;

        const fetchMember = async () => {
            try {
                const response = await api.get(`/members/${memberId}`);
                const data = response.data;
                setName(data.name || '');
                setMobile(data.mobile || '');
                setAddress(data.address || '');
                setMonthlyAmount(data.monthlyAmount?.toString() || '0');
                setRole(data.role || 'MEMBER');
                setStatus(data.status || 'ACTIVE');
            } catch (error) {
                toast.error('Failed to load member details');
                router.push('/admin/members');
            } finally {
                setLoading(false);
            }
        };

        fetchMember();
    }, [memberId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.put(`/members/${memberId}`, {
                name,
                mobile,
                address,
                monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : 0,
                role,
                status
            });
            toast.success('Member updated successfully');
            router.push('/admin/members');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update member');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading member...</div>;
    }

    return (
        <div className="container p-6 max-w-2xl mx-auto space-y-8">
            <Link href="/admin/members" className="inline-block mb-4">
                <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
                </Button>
            </Link>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
                <p className="text-muted-foreground">Update profile information and permissions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Details</CardTitle>
                    <CardDescription>Modify the required information.</CardDescription>
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
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
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
                                <Label htmlFor="status">Status</Label>
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
                            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
