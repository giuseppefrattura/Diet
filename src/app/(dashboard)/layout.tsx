import * as React from 'react';
import { Navbar } from '@/components/navbar';
import { DemoBanner } from '@/components/demo-banner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#090d16]">
      <DemoBanner />
      <div className="flex flex-1">
        <Navbar />
        <main className="flex-1 md:pl-64 w-full">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
