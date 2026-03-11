'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
    DialogDescription,
} from "@/components/ui/dialog";

interface Member {
    id: number;
    name: string;
    email: string;
    mobile: string;
    address: string;
    monthlyAmount: number;
    joinDate: string;
    status: string;
    role: string;
}

export default function AdminMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingMember, setViewingMember] = useState<any | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const fetchMembers = async () => {
        try {
            const response = await api.get('/members');
            setMembers(response.data);
        } catch (error) {
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const toggleStatus = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await api.put(`/members/${id}`, { status: newStatus });
            toast.success(`Member marked as ${newStatus}`);
            fetchMembers();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to permanently delete this member? All their data (deposits, loans, etc.) will be lost. This action cannot be undone.")) {
            return;
        }
        try {
            setLoading(true);
            await api.delete(`/members/${id}`);
            toast.success('Member permanently deleted');
            fetchMembers();
        } catch (error) {
            toast.error('Failed to delete member');
            setLoading(false);
        }
    };

    const handleViewProfile = async (id: number) => {
        try {
            setProfileLoading(true);
            const response = await api.get(`/members/${id}`);
            setViewingMember(response.data);
        } catch (error) {
            toast.error('Failed to fetch member details');
        } finally {
            setProfileLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading members...</div>;

    return (
        <div className="container p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Manage Members</h1>
                <Link href="/admin/members/add">
                    <Button>Add New Member</Button>
                </Link>
            </div>

            <Card className="glass overflow-hidden border-primary/10 shadow-lg shadow-primary/5">
                <CardContent className="p-0 sm:p-2">
                    <div className="rounded-xl overflow-hidden border border-border/50 bg-background/50">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead className="text-right">Monthly Dues</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                        {member.name}
                                        {member.role === 'ADMIN' && (
                                            <Badge variant="outline" className="ml-2 text-[10px] py-0">Admin</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{member.email}</div>
                                        <div className="text-xs text-muted-foreground">{member.mobile}</div>
                                    </TableCell>
                                    <TableCell className="text-right">INR {(member.monthlyAmount || 0).toFixed(2)}</TableCell>
                                    <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                                            className={member.status === 'ACTIVE' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : ''}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 whitespace-nowrap">
                                        <Button variant="outline" size="sm" className="rounded-full shadow-sm" onClick={() => handleViewProfile(member.id)} disabled={profileLoading}>
                                            View
                                        </Button>
                                        <Link href={`/admin/members/${member.id}/edit`}>
                                            <Button variant="outline" size="sm" className="rounded-full shadow-sm">Edit</Button>
                                        </Link>
                                        {member.role !== 'ADMIN' && (
                                            <>
                                                <Button
                                                    variant={member.status === 'ACTIVE' ? "destructive" : "outline"}
                                                    size="sm"
                                                    className="rounded-full shadow-sm"
                                                    onClick={() => toggleStatus(member.id, member.status)}
                                                >
                                                    {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="rounded-full shadow-sm"
                                                    onClick={() => handleDelete(member.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {members.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            {/* View Profile Dialog */}
            <Dialog open={!!viewingMember} onOpenChange={(open) => !open && setViewingMember(null)}>
                <DialogContent className="sm:max-w-[550px] glass p-0 overflow-hidden border-primary/20">
                    <div className="p-6 bg-gradient-to-br from-background/80 to-muted/80 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Member Profile</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Overview of the member's details and contributions.
                        </DialogDescription>
                    </DialogHeader>
                    {viewingMember && (
                        <div className="space-y-6 mt-2">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Full Name</span>
                                    <span className="font-semibold text-base">{viewingMember.name}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Status</span>
                                    <Badge variant={viewingMember.status === 'ACTIVE' ? 'default' : 'secondary'}
                                           className={viewingMember.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : ''}>
                                        {viewingMember.status}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Email Address</span>
                                    <span className="font-medium">{viewingMember.email}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Mobile Number</span>
                                    <span className="font-medium">{viewingMember.mobile}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Join Date</span>
                                    <span className="font-medium">{new Date(viewingMember.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">System Role</span>
                                    <span className="font-medium">{viewingMember.role}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground block text-xs tracking-wider uppercase mb-1">Residential Address</span>
                                    <span className="font-medium">{viewingMember.address || 'Not provided'}</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-border/50 pt-5">
                                <h4 className="text-sm font-semibold mb-4 text-foreground/80 tracking-tight">Financial Overview</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card className="glass relative overflow-hidden group">
                                         <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardContent className="p-4 flex flex-col justify-center">
                                            <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">Total Deposited</div>
                                            <div className="text-3xl font-bold text-primary">
                                                INR {(viewingMember.totalDeposits || 0).toFixed(2)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <CardContent className="p-4 flex flex-col justify-center">
                                            <div className="text-xs font-semibold text-secondary-foreground/70 uppercase tracking-wider mb-1">Monthly Target</div>
                                            <div className="text-3xl font-bold text-secondary-foreground">
                                                INR {(viewingMember.monthlyAmount || 0).toFixed(2)}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
