import './globals.css';

export const metadata = {
  title: 'Rural Electrification Fund Dashboard',
  description: 'On-Chain Power Generation & Tokenization Hub',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
