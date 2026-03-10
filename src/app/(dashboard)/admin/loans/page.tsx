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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Loan {
    id: number;
    requestedAmount: number;
    reason: string;
    requestedDuration: number;
    status: string;
    approvedAmount?: number;
    interestRate?: number;
    emi?: number;
    remainingBalance?: number;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    payments?: {
        id: number;
        amount: number;
        paidDate: string;
        transactionId: string;
    }[];
}

export default function AdminLoansPage() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment Dialog State
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentTransactionId, setPaymentTransactionId] = useState('');
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

    // Edit Loan State
    const [editAmountLoan, setEditAmountLoan] = useState<Loan | null>(null);
    const [editAmountValue, setEditAmountValue] = useState('');
    const [editDateValue, setEditDateValue] = useState('');
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    const fetchLoans = async () => {
        try {
            const response = await api.get('/loans');
            setLoans(response.data);
        } catch (error) {
            toast.error('Failed to load loans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

    const approveLoan = async (id: number, requestedAmount: number, duration: number) => {
        // Updated logic: 3 months 0% interest
        const interest = 0; // Starts at 0%
        const approvedAmount = requestedAmount;
        const totalRepayment = approvedAmount; // No immediate interest
        const emi = totalRepayment / duration;

        try {
            await api.put(`/loans/${id}`, {
                status: 'APPROVED',
                approvedAmount,
                interestRate: interest,
                emi,
                remainingBalance: totalRepayment
            });
            toast.success('Loan approved successfully');
            fetchLoans();
        } catch (error) {
            toast.error('Failed to update loan');
        }
    };

    const rejectLoan = async (id: number) => {
        try {
            await api.put(`/loans/${id}`, { status: 'REJECTED' });
            toast.success('Loan rejected');
            fetchLoans();
        } catch (error) {
            toast.error('Failed to update loan');
        }
    };

    const handleDeleteLoan = async (id: number) => {
        if (!confirm('Are you sure you want to delete this loan? All associated payment history will also be permanently deleted. This action cannot be undone.')) return;
        try {
            await api.delete(`/loans/${id}`);
            toast.success('Loan deleted successfully');
            fetchLoans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete loan');
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;

        try {
            setIsSubmittingPayment(true);
            await api.post(`/loans/${selectedLoan.id}/payments`, {
                amount: parseFloat(paymentAmount),
                transactionId: paymentTransactionId
            });
            toast.success('Payment recorded successfully');
            setSelectedLoan(null);
            setPaymentAmount('');
            setPaymentTransactionId('');
            fetchLoans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to record payment');
        } finally {
            setIsSubmittingPayment(false);
        }
    };

    const handleEditAmount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editAmountLoan) return;

        const newAmount = parseFloat(editAmountValue);
        if (isNaN(newAmount) || newAmount <= 0) return;

        try {
            setIsSubmittingEdit(true);
            await api.put(`/loans/${editAmountLoan.id}`, {
                status: editAmountLoan.status,
                requestedAmount: editAmountLoan.status === 'PENDING' ? newAmount : undefined,
                approvedAmount: editAmountLoan.status !== 'PENDING' ? newAmount : undefined,
                createdAt: editDateValue ? new Date(editDateValue).toISOString() : undefined,
            });
            toast.success('Loan updated successfully');
            setEditAmountLoan(null);
            fetchLoans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to modify loan');
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading applications...</div>;

    return (
        <div className="container p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Loan Applications</h1>
            </div>

            <Dialog open={!!selectedLoan} onOpenChange={(open) => !open && setSelectedLoan(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Record Loan Payment</DialogTitle>
                    </DialogHeader>
                    {selectedLoan && (
                        <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Member</Label>
                                <div className="text-sm font-medium">{selectedLoan.user.name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Remaining Balance</Label>
                                <div className="text-sm font-medium">INR {selectedLoan.remainingBalance?.toFixed(2)}</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Payment Amount (INR)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    required
                                    min="1"
                                    max={selectedLoan.remainingBalance}
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="txId">Transaction ID (Optional)</Label>
                                <Input
                                    id="txId"
                                    value={paymentTransactionId}
                                    onChange={(e) => setPaymentTransactionId(e.target.value)}
                                    placeholder="e.g. UPI Ref"
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmittingPayment}>
                                {isSubmittingPayment ? 'Recording...' : 'Record Payment'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Payment History Dialog */}
            <Dialog open={!!viewingLoan} onOpenChange={(open) => !open && setViewingLoan(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Loan Payment History</DialogTitle>
                    </DialogHeader>
                    {viewingLoan && (
                        <div className="space-y-4 mt-4">
                            <div className="flex justify-between text-sm">
                                <div><span className="text-muted-foreground">Original Loan:</span> INR {viewingLoan.approvedAmount?.toFixed(2) || viewingLoan.requestedAmount.toFixed(2)}</div>
                                <div><span className="text-muted-foreground">Remaining:</span> INR {viewingLoan.remainingBalance?.toFixed(2) || 0}</div>
                            </div>

                            {!viewingLoan.payments || viewingLoan.payments.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground border rounded-md">No payments recorded yet.</div>
                            ) : (
                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Txn ID</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {viewingLoan.payments.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{new Date(payment.paidDate).toLocaleDateString()}</TableCell>
                                                    <TableCell className="font-medium text-green-600">INR {payment.amount.toFixed(2)}</TableCell>
                                                    <TableCell className="text-xs">{payment.transactionId || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Loan Dialog */}
            <Dialog open={!!editAmountLoan} onOpenChange={(open) => !open && setEditAmountLoan(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Loan Details</DialogTitle>
                    </DialogHeader>
                    {editAmountLoan && (
                        <form onSubmit={handleEditAmount} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Member</Label>
                                <div className="text-sm font-medium">{editAmountLoan.user.name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label>Current Status</Label>
                                <div className="text-sm font-medium">{editAmountLoan.status}</div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="editDate">Loan Request Date</Label>
                                <Input
                                    id="editDate"
                                    type="date"
                                    required
                                    value={editDateValue}
                                    onChange={(e) => setEditDateValue(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newAmount">New Loan Amount (INR)</Label>
                                <Input
                                    id="newAmount"
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    value={editAmountValue}
                                    onChange={(e) => setEditAmountValue(e.target.value)}
                                    placeholder="e.g. 5000"
                                />
                                {editAmountLoan.status === 'APPROVED' && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Modifying an active loan will instantly subtract or add the difference to the member's remaining balance.
                                    </p>
                                )}
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmittingEdit}>
                                {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead className="text-right">Requested</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loans.map((loan) => (
                                <TableRow key={loan.id}>
                                    <TableCell className="font-medium">
                                        {loan.user.name}
                                        <div className="text-xs text-muted-foreground">{loan.user.email}</div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                        INR {loan.requestedAmount.toFixed(2)}
                                        {loan.approvedAmount && <div className="text-xs text-green-600 font-normal">Apprv: INR {loan.approvedAmount}</div>}
                                    </TableCell>
                                    <TableCell>{loan.requestedDuration} mos</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{loan.reason || 'N/A'}</TableCell>
                                    <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={loan.status === 'APPROVED' ? 'default' : loan.status === 'REJECTED' ? 'destructive' : 'secondary'}
                                            className={loan.status === 'APPROVED' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}>
                                            {loan.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {loan.status === 'PENDING' && (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => approveLoan(loan.id, loan.requestedAmount, loan.requestedDuration)} className="text-green-600 border-green-200 hover:bg-green-50">Approve</Button>
                                                    <Button variant="outline" size="sm" onClick={() => rejectLoan(loan.id)} className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    setEditAmountValue(loan.requestedAmount.toString());
                                                    setEditDateValue(new Date(loan.createdAt).toISOString().split('T')[0]);
                                                    setEditAmountLoan(loan);
                                                }} className="h-7 text-xs">
                                                    Edit Details
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLoan(loan.id)}>
                                                    Delete Loan
                                                </Button>
                                            </div>
                                        )}
                                        {(loan.status === 'APPROVED' || loan.status === 'PAID_OFF') && (
                                            <div className="flex flex-col items-end gap-2">
                                                {loan.status === 'APPROVED' && (
                                                    <div className="text-xs space-y-1 text-right">
                                                        <div>EMI: INR {loan.emi?.toFixed(2)}</div>
                                                        <div>Bal: INR {loan.remainingBalance?.toFixed(2)}</div>
                                                    </div>
                                                )}
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setViewingLoan(loan)} className="h-7 text-xs">
                                                        View Details
                                                    </Button>
                                                    {loan.remainingBalance && loan.remainingBalance > 0 ? (
                                                        <Button variant="outline" size="sm" onClick={() => setSelectedLoan(loan)} className="h-7 text-xs text-blue-600 border-blue-200 hover:bg-blue-50">
                                                            Record Pay
                                                        </Button>
                                                    ) : null}
                                                </div>
                                                {loan.status === 'APPROVED' && loan.remainingBalance && loan.remainingBalance > 0 && (
                                                    <Button variant="ghost" size="sm" onClick={() => {
                                                        setEditAmountValue((loan.approvedAmount || loan.requestedAmount).toString());
                                                        setEditDateValue(new Date(loan.createdAt).toISOString().split('T')[0]);
                                                        setEditAmountLoan(loan);
                                                    }} className="h-7 text-xs w-full justify-end pr-0">
                                                        Edit Details
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 w-full justify-end pr-0" onClick={() => handleDeleteLoan(loan.id)}>
                                                    Delete Loan
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loans.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No loan applications found.
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
