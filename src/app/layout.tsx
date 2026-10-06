import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { DataProvider } from '@/context/DataContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import CftModal from '@/components/cft/CftModal';
import ToastContainer from '@/components/common/ToastContainer';

export const metadata: Metadata = {
  title: 'Dhaka Timber Complex | Wood & Interior ERP',
  description:
    'Complete Wood, Sawmill, Doors, Frames, Furniture & Interior Business Management Software for Dhaka Timber Complex',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen print:bg-white print:text-black">
        <AppProvider>
          <DataProvider>
            <div className="flex min-h-screen print:block print:min-h-0">
              {/* Sidebar */}
              <Sidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all print:pl-0 print:block print:w-full">
                <Header />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12 print:p-0 print:m-0 print:max-w-none print:w-full print:pb-0">
                  {children}
                </main>
                <MobileNav />
              </div>
            </div>

            {/* Global Popups & Modals */}
            <div className="no-print">
              <CftModal />
              <ToastContainer />
            </div>
          </DataProvider>
        </AppProvider>
      </body>
    </html>
  );
}
