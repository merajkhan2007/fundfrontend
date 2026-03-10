'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Wallet, CalendarClock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Collection {
    id: number;
    userName?: string;
    month: string;
    amount: number;
    status: string;
    paymentMethod: string;
    date: string | null;
    user?: { name: string; mobile: string };
}

interface Loan {
    id: number;
    requestedAmount: number;
    approvedAmount: number | null;
    remainingBalance: number | null;
    status: string;
    createdAt: string;
    user?: { name: string; mobile: string };
}

export default function ReportsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [collectionsRes, loansRes] = await Promise.all([
                    api.get('/reports/collections'),
                    api.get('/reports/loans')
                ]);
                setCollections(collectionsRes.data);
                setLoans(loansRes.data);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>;
    }

    const totalCollected = collections.reduce((sum, c) => sum + (c.status === 'PAID' ? c.amount : 0), 0);
    const totalLoaned = loans.reduce((sum, l) => sum + (l.status === 'APPROVED' || l.status === 'PAID_OFF' ? (l.approvedAmount || l.requestedAmount) : 0), 0);
    const activeLoanCount = loans.filter(l => l.status === 'APPROVED').length;

    return (
        <div className="container p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Financial Reports
                </h1>
                <p className="text-muted-foreground mt-1">View collections and loan distributions.</p>
            </div>

            {/* Global Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                        <Wallet className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            ₹{totalCollected.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Successfully paid deposits</p>
                    </CardContent>
                </Card>

                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Loaned</CardTitle>
                        <IndianRupee className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">
                            ₹{totalLoaned.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Approved & Disbursed</p>
                    </CardContent>
                </Card>

                <Card className="glass hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {activeLoanCount}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Currently being repaid</p>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Tabs */}
            <Tabs defaultValue="collections" className="space-y-6">
                <TabsList className="glass bg-muted/30 border border-border/50 p-1">
                    <TabsTrigger value="collections" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                        Collections Report
                    </TabsTrigger>
                    <TabsTrigger value="loans" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
                        Loans Report
                    </TabsTrigger>
                </TabsList>

                {/* Collections Tab */}
                <TabsContent value="collections" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Recent Deposits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Date Paid</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {collections.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                                    No collections found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            collections.map((col) => (
                                                <TableRow key={col.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell>
                                                        <div className="font-medium">{col.user?.name || col.userName || 'Unknown'}</div>
                                                        <div className="text-xs text-muted-foreground">{col.user?.mobile}</div>
                                                    </TableCell>
                                                    <TableCell>{col.month}</TableCell>
                                                    <TableCell>{col.date ? format(new Date(col.date), 'PP') : '-'}</TableCell>
                                                    <TableCell>{col.paymentMethod || '-'}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                            ${col.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                col.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {col.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                                        ₹{col.amount.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Loans Tab */}
                <TabsContent value="loans" className="space-y-4 animate-in fade-in duration-300">
                    <Card className="glass">
                        <CardHeader>
                            <CardTitle>Loan Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
                                <Table>
                                    <TableHeader className="bg-muted/40">
                                        <TableRow>
                                            <TableHead>Member</TableHead>
                                            <TableHead>Applied Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Approved Amount</TableHead>
                                            <TableHead className="text-right">Remaining Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loans.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                                    No loans found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            loans.map((loan) => (
                                                <TableRow key={loan.id} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell>
                                                        <div className="font-medium">{loan.user?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-muted-foreground">{loan.user?.mobile}</div>
                                                    </TableCell>
                                                    <TableCell>{format(new Date(loan.createdAt), 'PP')}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                            ${loan.status === 'APPROVED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                                loan.status === 'PAID_OFF' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                                    loan.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                            {loan.status.replace('_', ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        ₹{(loan.approvedAmount || loan.requestedAmount).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-orange-600 dark:text-orange-400">
                                                        {loan.remainingBalance !== null ? `₹${loan.remainingBalance.toFixed(2)}` : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
