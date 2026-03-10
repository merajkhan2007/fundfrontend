'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';
import { Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ApplyLoanPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [requestedAmount, setRequestedAmount] = useState('');
    const [requestedDuration, setRequestedDuration] = useState('12');
    const [reason, setReason] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requestedAmount || parseFloat(requestedAmount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/loans', {
                requestedAmount: parseFloat(requestedAmount),
                requestedDuration: parseInt(requestedDuration),
                reason,
            });
            toast.success('Loan application submitted successfully');
            router.push('/member/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl mx-auto space-y-8">
            <Button variant="ghost" className="mb-4">
                <Link href="/member/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
                <p className="text-muted-foreground">Request funds from the MAQASIDFund community pool.</p>
            </div>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex gap-4 items-start">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm space-y-1 text-primary/90">
                        <p className="font-medium">Before you apply:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Loan approval is subject to community fund availability.</li>
                            <li>Your past contribution record will be reviewed by the admin.</li>
                            <li>Interest rates or service charges may apply as decided by the committee.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>All fields are required unless marked otherwise.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Requested Amount (INR)</Label>
                            <Input
                                id="amount"
                                type="number"
                                required
                                min="1000"
                                value={requestedAmount}
                                onChange={(e) => setRequestedAmount(e.target.value)}
                                placeholder="e.g. 50000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Repayment Duration (Months)</Label>
                            <Input
                                id="duration"
                                type="number"
                                required
                                min="1"
                                max="60"
                                value={requestedDuration}
                                onChange={(e) => setRequestedDuration(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Suggested months to repay the loan fully. Final duration will be set by admin.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Loan (Optional)</Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly describe why you are requesting this loan to help the committee process it faster."
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting Application...' : 'Submit Loan Application'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
