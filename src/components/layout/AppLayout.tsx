import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[260px]">
        <TopHeader />
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
