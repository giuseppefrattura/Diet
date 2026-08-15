import * as React from 'react';
import { Navbar } from '@/components/navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-[#090d16]">
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
