import { Outfit, Inter } from 'next/font/google';
import '../styles/globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter'
});

export const metadata = {
  title: 'MyCliniQ - Medical Center Management System',
  description: 'A modern, premium hospital management system for patient records, electronic prescriptions, pharmacy inventory, and lab results.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
