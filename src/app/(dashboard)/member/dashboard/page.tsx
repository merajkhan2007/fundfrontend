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
        <div className="container p-4 md:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
                    {data?.userName && <p className="text-muted-foreground mt-1 font-medium">Welcome back, {data.userName}</p>}
                </div>
                <div className="flex w-full sm:w-auto space-x-2">
                    <Button variant="outline" className="flex-1 sm:flex-none">
                        <Link href="/member/deposits">View Deposits</Link>
                    </Button>
                    <Button className="flex-1 sm:flex-none uppercase tracking-wide font-semibold">
                        <Link href="/member/loans/apply">Apply for Loan</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Contribution</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            INR {data?.monthlyAmount?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Your set monthly target</p>
                    </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposited</CardTitle>
                        <Wallet className="h-4 w-4 text-secondary-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">INR {data?.totalDepositedAmount?.toFixed(2) || '0.00'}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Lifetime contributions</p>
                    </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{data?.activeLoans?.length || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Currently active or pending</p>
                    </CardContent>
                </Card>

                {data?.upcomingPayment ? (
                    <Card className="glass relative overflow-hidden border-orange-500/30 bg-orange-500/5 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Next EMI Due</CardTitle>
                            <CalendarClock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                INR {data?.upcomingPayment?.amount?.toFixed(2)}
                            </div>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1 font-medium">
                                Due on {data?.upcomingPayment?.dueDate ? new Date(data.upcomingPayment.dueDate).toLocaleDateString() : ''}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="glass relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next EMI Due</CardTitle>
                            <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">None</div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">No upcoming payments</p>
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
            <h2 className="text-2xl font-bold mt-10 mb-6 tracking-tight">Your Recent Loans</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data?.activeLoans && data.activeLoans.length > 0 ? (
                    data.activeLoans.map((loan) => (
                        <Card key={loan.id} className="glass group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Date Applied</div>
                                        <div className="text-sm font-medium">{new Date(loan.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        loan.status === 'APPROVED' || loan.status === 'PAID_OFF' ? 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' :
                                        loan.status === 'PENDING' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400' : 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400'
                                    }`}>
                                        {loan.status}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="text-3xl font-extrabold tracking-tight">INR {loan.requestedAmount.toFixed(2)}</div>
                                    <div className="text-sm text-muted-foreground mt-1">Requested over {loan.requestedDuration} months</div>
                                </div>
                                
                                {(loan.status === 'APPROVED' || loan.status === 'PAID_OFF') && (
                                    <Button variant="outline" size="sm" onClick={() => setViewingLoan(loan)} className="w-full rounded-full group-hover:bg-primary/5 transition-colors">
                                        View Payment History
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 px-4 rounded-3xl border border-dashed border-border/60 bg-muted/20 text-center flex flex-col items-center justify-center">
                        <FileText className="h-10 w-10 text-muted-foreground opacity-50 mb-3" />
                        <h3 className="text-lg font-medium text-foreground">No active loans found</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">When you apply for a loan and it is approved by the admin, it will appear here.</p>
                        <Link href="/member/loans/apply">
                            <Button className="mt-4 rounded-full px-6 shadow-sm">Apply Now</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
