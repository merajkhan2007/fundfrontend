'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IndianRupee, Wallet, FileText, CalendarClock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardData {
    totalDepositedAmount: number;
    activeLoans: any[];
    upcomingPayment: any | null;
    monthlyAmount: number;
    userName: string;
}

export default function MemberDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewingLoan, setViewingLoan] = useState<any | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
    }

    return (
        <div className="container p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
                    {data?.userName && <p className="text-muted-foreground mt-1">Welcome back, {data.userName}</p>}
                </div>
                <div className="space-x-2">
                    <Button variant="outline">
                        <Link href="/member/deposits">View Deposits</Link>
                    </Button>
                    <Button>
                        <Link href="/member/loans/apply">Apply for Loan</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Contribution</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            INR {data?.monthlyAmount?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Your set monthly target</p>
                    </CardContent>
                </Card>

                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">INR {data?.totalDepositedAmount?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground mt-1">Lifetime contributions</p>
                    </CardContent>
                </Card>

                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{data?.activeLoans?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Currently active or pending</p>
                    </CardContent>
                </Card>

                {data?.upcomingPayment ? (
                    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Next EMI Due</CardTitle>
                            <CalendarClock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                INR {data.upcomingPayment.amount.toFixed(2)}
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                Due on {new Date(data.upcomingPayment.dueDate).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next EMI Due</CardTitle>
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">None</div>
                            <p className="text-xs text-muted-foreground">No upcoming payments</p>
                        </CardContent>
                    </Card>
                )}
            </div>

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
                                            {viewingLoan.payments.map((payment: any) => (
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

            {/* Active Loans List */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Your Recent Loans</h2>
            <div className="space-y-4">
                {data?.activeLoans && data.activeLoans.length > 0 ? (
                    data.activeLoans.map((loan) => (
                        <Card key={loan.id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="font-semibold text-lg">INR {loan.requestedAmount.toFixed(2)}</div>
                                <div className="text-sm text-muted-foreground">Requested for {loan.requestedDuration} months</div>
                                <div className="text-xs text-muted-foreground mt-1">Date: {new Date(loan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${loan.status === 'APPROVED' || loan.status === 'PAID_OFF' ? 'bg-green-100 text-green-700' :
                                    loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {loan.status}
                                </div>
                                {(loan.status === 'APPROVED' || loan.status === 'PAID_OFF') && (
                                    <Button variant="outline" size="sm" onClick={() => setViewingLoan(loan)} className="h-7 text-xs">
                                        View Details
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="text-sm text-muted-foreground border p-8 rounded-lg text-center bg-card">
                        No active loans found.
                    </div>
                )}
            </div>
        </div>
    );
}
