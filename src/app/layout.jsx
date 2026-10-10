import './globals.css';

export const metadata = {
  title: 'Harsh Dev Jha · Systems Architect & AI Engineer',
  description: 'Autonomous AI Systems, Embedded Intelligence, and Performant Architectures by Harsh Dev Jha (Inkesk-Dozing).',
  openGraph: {
    title: 'Harsh Dev Jha · Systems Architect & AI Engineer',
    description: 'Autonomous AI Systems, Embedded Intelligence, and Performant Architectures by Harsh Dev Jha (Inkesk-Dozing).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harsh Dev Jha · Systems Architect & AI Engineer',
    description: 'Autonomous AI Systems, Embedded Intelligence, and Performant Architectures by Harsh Dev Jha (Inkesk-Dozing).',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,700;1,400&display=swap"
          media="print"
          onLoad="this.media='all'"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}