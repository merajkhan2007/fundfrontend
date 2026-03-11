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
        <div className="container p-4 md:p-6 max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Button variant="ghost" className="mb-4 hover:bg-muted/50 rounded-full">
                <Link href="/member/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Link>
            </Button>

            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
                <p className="text-muted-foreground font-medium">Request funds from the MAQASIDFund community pool.</p>
            </div>

            <Card className="glass overflow-hidden border-primary/20 bg-primary/5 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                <CardContent className="p-5 flex gap-4 items-start relative z-10">
                    <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm space-y-2 text-foreground/90">
                        <p className="font-bold text-primary">Before you apply:</p>
                        <ul className="list-disc list-inside space-y-1.5 marker:text-primary">
                            <li>Loan approval is subject to community fund availability.</li>
                            <li>Your past contribution record will be reviewed by the admin.</li>
                            <li>Interest rates or service charges may apply as decided by the committee.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card className="glass overflow-hidden border-border/50 shadow-lg shadow-black/5">
                <CardHeader className="border-b border-border/50 bg-muted/20 pb-6">
                    <CardTitle className="text-2xl font-bold">Application Details</CardTitle>
                    <CardDescription className="text-sm">All fields are required unless marked otherwise.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2.5">
                            <Label htmlFor="amount" className="font-semibold text-foreground/80">Requested Amount (INR)</Label>
                            <Input
                                id="amount"
                                type="number"
                                required
                                min="1000"
                                value={requestedAmount}
                                onChange={(e) => setRequestedAmount(e.target.value)}
                                placeholder="e.g. 50000"
                                className="h-12 text-lg bg-background/50 border-border/80 focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="duration" className="font-semibold text-foreground/80">Repayment Duration (Months)</Label>
                            <Input
                                id="duration"
                                type="number"
                                required
                                min="1"
                                max="60"
                                value={requestedDuration}
                                onChange={(e) => setRequestedDuration(e.target.value)}
                                className="h-12 text-lg bg-background/50 border-border/80 focus:ring-primary/20"
                            />
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-2">
                                <Info className="w-3 h-3" />
                                Suggested months to repay the loan fully. Final duration will be set by admin.
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            <Label htmlFor="reason" className="font-semibold text-foreground/80">Reason for Loan <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                            <Textarea
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Briefly describe why you are requesting this loan to help the committee process it faster."
                                className="min-h-[120px] resize-y bg-background/50 border-border/80 text-base focus:ring-primary/20 p-3"
                            />
                        </div>

                        <Button type="submit" size="lg" className="w-full h-12 rounded-full font-bold text-base shadow-md mt-8" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting Application...' : 'Submit Loan Application'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
