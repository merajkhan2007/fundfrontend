'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Deposit {
    id: number;
    month: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'LATE';
    date: string;
    paymentMethod: string | null;
}

export default function MemberDepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    // Filter states
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [yearFilter, setYearFilter] = useState('ALL');

    // Form state
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Online');
    const [notes, setNotes] = useState('');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const response = await api.get('/deposits');
            setDeposits(response.data);
        } catch (error) {
            console.error('Error fetching deposits', error);
            toast.error('Failed to load deposits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const handleSubmitDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/deposits', {
                month: `${selectedMonth} ${selectedYear}`,
                amount: parseFloat(amount),
                paymentMethod,
                notes,
                date: new Date().toISOString()
            });
            toast.success('Deposit request submitted successfully');
            setOpen(false);
            fetchDeposits();
            // Reset form
            setAmount('');
            setNotes('');
            setPaymentMethod('Online');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to submit deposit');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading deposits...</div>;
    }

    const uniqueYears = Array.from(new Set(deposits.map(d => {
        const match = d.month.match(/\d{4}/);
        return match ? match[0] : '';
    }).filter(Boolean)));

    const filteredDeposits = deposits.filter(deposit => {
        const matchesStatus = statusFilter === 'ALL' || deposit.status === statusFilter;
        let matchesYear = true;
        if (yearFilter !== 'ALL') {
            matchesYear = deposit.month.includes(yearFilter);
        }
        return matchesStatus && matchesYear;
    });

    return (
        <div className="container p-4 md:p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Deposits</h1>
                    <p className="text-muted-foreground mt-1 font-medium">View your contribution history and submit new payments.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>
                        <Button className="rounded-full shadow-sm px-6 font-semibold tracking-wide">Record New Deposit</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] glass border-primary/20 overflow-hidden p-0">
                        <div className="p-6 bg-gradient-to-br from-background/80 to-muted/80 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Submit Contribution</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitDeposit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Month</Label>
                                    <Select value={selectedMonth} onValueChange={(val) => val && setSelectedMonth(val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Select value={selectedYear} onValueChange={(val) => val && setSelectedYear(val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map(y => (
                                                <SelectItem key={y} value={y}>{y}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount (INR)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    required
                                    min="1"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Online">Online</SelectItem>
                                        <SelectItem value="Cash">Cash</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes / UTR Ref</Label>
                                <Input
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Optional notes or UTR / UPI Ref if Online"
                                />
                            </div>
                            <Button type="submit" className="w-full rounded-full shadow-md font-semibold mt-6" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Deposit'}
                            </Button>
                        </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="glass overflow-hidden border-primary/10 shadow-lg shadow-primary/5">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0 border-b border-border/50 pb-4">
                    <CardTitle className="text-xl">Deposit History</CardTitle>
                    <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                            <SelectTrigger className="w-[140px] rounded-full bg-background/50">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="glass">
                                <SelectItem value="ALL">All Statuses</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PAID">Paid</SelectItem>
                                <SelectItem value="LATE">Late</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={yearFilter} onValueChange={(val) => val && setYearFilter(val)}>
                            <SelectTrigger className="w-[120px] rounded-full bg-background/50">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="glass">
                                <SelectItem value="ALL">All Years</SelectItem>
                                {uniqueYears.map(year => (
                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-2">
                    {!filteredDeposits.length ? (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                            <div className="bg-muted/30 p-4 rounded-full mb-3">
                                <svg className="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <p className="font-medium text-foreground">No deposits found matching the filters.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl overflow-hidden border border-border/50 bg-background/50 m-2">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDeposits.map((deposit) => (
                                    <TableRow key={deposit.id}>
                                        <TableCell>{deposit.date ? new Date(deposit.date).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="font-medium">{deposit.month}</TableCell>
                                        <TableCell>INR {deposit.amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {deposit.paymentMethod || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={deposit.status === 'PAID' ? 'default' : deposit.status === 'PENDING' ? 'secondary' : 'destructive'}
                                                className={`font-semibold ${deposit.status === 'PAID' ? 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20 dark:text-green-400' : ''}`}>
                                                {deposit.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
