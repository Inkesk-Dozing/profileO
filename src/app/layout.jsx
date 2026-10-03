import './globals.css';

export const metadata = {
  title: 'Harsh Dev Jha · Systems Architect & AI Engineer',
  description: 'Autonomous AI Systems, Embedded Intelligence, and Performant Architectures by Harsh Dev Jha (Inkesk-Dozing).'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="js">
      <body>
        <div id="app">
          {children}
        </div>
      </body>
    </html>
  );
}
