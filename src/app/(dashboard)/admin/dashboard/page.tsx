'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, Users, IndianRupee, Wallet, FileText, AlertCircle } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface AdminData {
    totalMembers: number;
    totalDeposits: number;
    activeLoansCount: number;
    totalActiveLoans: number;
    totalFund: number;
    pendingPayments: number;
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);

    // Mock data for chart since we didn't implement monthly aggregation in MVP API yet
    const chartData = [
        { name: 'Jan', total: 1200 },
        { name: 'Feb', total: 2100 },
        { name: 'Mar', total: 3200 },
        { name: 'Apr', total: 3100 },
        { name: 'May', total: 4000 },
        { name: 'Jun', total: 4800 },
    ];

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
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <div className="space-x-2">
                    <Link href="/admin/members">
                        <Button variant="outline">Manage Members</Button>
                    </Link>
                    <Link href="/reports">
                        <Button>Generate Reports</Button>
                    </Link>
                </div>
            </div>



            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card className="glass relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total MAQASIDFund</CardTitle>
                        <Wallet className="h-4 w-4 text-primary-foreground/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            INR {data?.totalFund?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">Available balance</p>
                    </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            INR {data?.totalDeposits?.toFixed(2) || '0.00'}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Loans Out</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            INR {data?.totalActiveLoans?.toFixed(2) || '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Currently distributed</p>
                    </CardContent>
                </Card>

                <Card className="glass relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{data?.totalMembers || 0}</div>
                    </CardContent>
                </Card>

                <Card className={`glass relative overflow-hidden group ${data?.pendingPayments ? "border-red-500/30 bg-red-500/5" : ""}`}>
                    {data?.pendingPayments ? (
                         <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : null}
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className={`text-sm font-medium ${data?.pendingPayments ? 'text-red-800 dark:text-red-200' : ''}`}>
                            Pending Payments
                        </CardTitle>
                        <AlertCircle className={`h-4 w-4 ${data?.pendingPayments ? 'text-red-600' : 'text-muted-foreground'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${data?.pendingPayments ? 'text-red-700 dark:text-red-300' : ''}`}>
                            {data?.pendingPayments || 0}
                        </div>
                        {!!data?.pendingPayments && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                Requires review or chasing
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="glass col-span-1 lg:col-span-4 flex flex-col">
                    <CardHeader>
                        <CardTitle>Monthly Contribution Growth</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tickFormatter={(value) => value} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `INR ${value}`} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="glass col-span-1 lg:col-span-3 flex flex-col">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <Link href="/admin/members/add" className="w-full block">
                            <Button className="w-full justify-start rounded-xl font-medium" variant="outline" size="lg">Add New Member</Button>
                        </Link>
                        <Link href="/admin/deposits" className="w-full block">
                            <Button className="w-full justify-start rounded-xl font-medium" variant="outline" size="lg">Verify Pending Deposits</Button>
                        </Link>
                        <Link href="/admin/loans" className="w-full block">
                            <Button className="w-full justify-start rounded-xl font-medium" variant="outline" size="lg">Review Loan Applications</Button>
                        </Link>
                        <Button className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950/50" variant="outline">
                            Send Monthly Reminders (Email)
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
