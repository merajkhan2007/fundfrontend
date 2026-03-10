'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
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
    status: string;
    paymentMethod: string;
    transactionId: string;
    date: string;
    user: {
        name: string;
        email: string;
    }
}

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [members, setMembers] = useState<{ id: number, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [monthFilter, setMonthFilter] = useState('ALL');

    // Form state
    const [userId, setUserId] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Manual/Cash');
    const [notes, setNotes] = useState('');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    const fetchData = async () => {
        try {
            const [depositsRes, membersRes] = await Promise.all([
                api.get('/deposits'),
                api.get('/members')
            ]);
            setDeposits(depositsRes.data);
            setMembers(membersRes.data.filter((m: any) => m.role === 'MEMBER'));
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmitDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await api.post('/deposits', {
                userId: parseInt(userId),
                month: `${selectedMonth} ${selectedYear}`,
                amount: parseFloat(amount),
                paymentMethod,
                notes,
            });
            toast.success('Manual deposit recorded successfully');
            setOpen(false);
            fetchData();
            // Reset form
            setAmount('');
            setNotes('');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to submit deposit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/deposits/${id}`, { status });
            toast.success(`Deposit status updated to ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteDeposit = async (id: number) => {
        if (!confirm('Are you sure you want to delete this deposit? This action cannot be undone.')) return;
        try {
            await api.delete(`/deposits/${id}`);
            toast.success('Deposit deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete deposit');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDeposit) return;

        try {
            setIsSubmitting(true);
            await api.put(`/deposits/${editingDeposit.id}`, {
                month: editingDeposit.month,
                amount: parseFloat(editingDeposit.amount.toString()),
                paymentMethod: editingDeposit.paymentMethod,
                transactionId: editingDeposit.transactionId,
                status: editingDeposit.status
            });
            toast.success('Deposit updated successfully');
            setEditOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to update deposit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (deposit: Deposit) => {
        setEditingDeposit({ ...deposit });
        setEditOpen(true);
    };

    const uniqueMonths = Array.from(new Set(deposits.map(d => d.month)));

    const filteredDeposits = deposits.filter(deposit => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
            deposit.user.name.toLowerCase().includes(query) ||
            deposit.user.email.toLowerCase().includes(query) ||
            (deposit.transactionId && deposit.transactionId.toLowerCase().includes(query));

        const matchesStatus = statusFilter === 'ALL' || deposit.status === statusFilter;
        const matchesMonth = monthFilter === 'ALL' || deposit.month === monthFilter;

        return matchesSearch && matchesStatus && matchesMonth;
    });

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading deposits...</div>;

    return (
        <div className="container p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Deposit Approvals</h1>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger>
                        <Button type="button">Record Manual Deposit</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Record Manual Deposit</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitDeposit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="member">Select Member</Label>
                                <select
                                    id="member"
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                >
                                    <option value="" disabled>Select a member...</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
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
                                <Label htmlFor="paymentMethod">Payment Method</Label>
                                <Input
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting || !userId}>
                                {isSubmitting ? 'Recording...' : 'Record Deposit'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Deposit Dialog */}
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Edit Deposit</DialogTitle>
                        </DialogHeader>
                        {editingDeposit && (
                            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Member</Label>
                                    <Input disabled value={editingDeposit.user.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editMonth">Month</Label>
                                    <Input
                                        id="editMonth"
                                        required
                                        value={editingDeposit.month}
                                        onChange={(e) => setEditingDeposit({ ...editingDeposit, month: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editAmount">Amount (INR)</Label>
                                    <Input
                                        id="editAmount"
                                        type="number"
                                        required
                                        min="1"
                                        value={editingDeposit.amount}
                                        onChange={(e) => setEditingDeposit({ ...editingDeposit, amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editPaymentMethod">Payment Method</Label>
                                    <Input
                                        id="editPaymentMethod"
                                        value={editingDeposit.paymentMethod || ''}
                                        onChange={(e) => setEditingDeposit({ ...editingDeposit, paymentMethod: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editTxn">Transaction ID</Label>
                                    <Input
                                        id="editTxn"
                                        value={editingDeposit.transactionId || ''}
                                        onChange={(e) => setEditingDeposit({ ...editingDeposit, transactionId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="editStatus">Status</Label>
                                    <select
                                        id="editStatus"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editingDeposit.status}
                                        onChange={(e) => setEditingDeposit({ ...editingDeposit, status: e.target.value })}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PAID">PAID</option>
                                        <option value="LATE">LATE</option>
                                    </select>
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Search by name, email or Txn ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sm:max-w-xs"
                />
                <select
                    className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="LATE">Late</option>
                </select>
                <select
                    className="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                >
                    <option value="ALL">All Months</option>
                    {uniqueMonths.map(month => (
                        <option key={month} value={month}>{month}</option>
                    ))}
                </select>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Month</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDeposits.map((deposit) => (
                                <TableRow key={deposit.id}>
                                    <TableCell className="font-medium">
                                        {deposit.user.name}
                                        <div className="text-xs text-muted-foreground">{deposit.user.email}</div>
                                    </TableCell>
                                    <TableCell>{deposit.month}</TableCell>
                                    <TableCell className="text-right font-semibold">INR {deposit.amount.toFixed(2)}</TableCell>
                                    <TableCell>{new Date(deposit.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {deposit.paymentMethod || 'Manual'}
                                        {deposit.transactionId && <div className="text-[10px] text-muted-foreground">Tx: {deposit.transactionId}</div>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={deposit.status === 'PAID' ? 'default' : deposit.status === 'LATE' ? 'destructive' : 'secondary'}
                                            className={deposit.status === 'PAID' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : deposit.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}>
                                            {deposit.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {deposit.status !== 'PAID' && (
                                            <Button variant="outline" size="sm" onClick={() => updateStatus(deposit.id, 'PAID')} className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 mb-1">Mark Paid</Button>
                                        )}
                                        {deposit.status !== 'LATE' && deposit.status === 'PENDING' && (
                                            <Button variant="outline" size="sm" onClick={() => updateStatus(deposit.id, 'LATE')} className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 mb-1">Mark Late</Button>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(deposit)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteDeposit(deposit.id)}>Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredDeposits.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No deposits found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
