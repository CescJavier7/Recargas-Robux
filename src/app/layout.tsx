import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

// IMPORTACIONES CORRECTAS
import FloatingCart from "@/components/FloatingCart"; // Importación por default (sin llaves)
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

export const metadata: Metadata = {
  title: "Nexus TopUp | Robux Ecuador",
  description: "Recargas digitales a la velocidad de la luz, sin intermediarios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${orbitron.variable} font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col transition-colors duration-300`}>
        
        <ThemeProvider>
          
          {/* Fondo Global */}
          <div className="fixed inset-0 z-[-1] bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 dark:opacity-100 transition-opacity duration-300"></div>
          
          <Navbar />

          {/* Renderizado de páginas */}
          <div className="flex-grow">
            {children}
          </div>

          <Footer />

          {/* EL NUEVO CARRITO FLOTANTE */}
          <FloatingCart />

        </ThemeProvider>

      </body>
    </html>
  );
}