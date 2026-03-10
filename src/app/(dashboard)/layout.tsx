import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex w-full min-h-screen pt-24 pb-4 px-4 gap-4">
            <Sidebar />
            <div className="flex-1 w-full lg:pl-72 transition-all duration-300">
                <div className="rounded-3xl border border-primary/10 glass min-h-full p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
