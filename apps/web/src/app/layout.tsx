import "@/styles/globals.css";
// include styles from the ui package
import "@packages/ui/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-zinc-100">
      <body>{children}</body>
    </html>
  );
}
