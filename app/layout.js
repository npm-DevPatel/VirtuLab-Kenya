import './globals.css';

export const metadata = {
  title: {
    default: 'VirtuLab Kenya - Virtual Science Practicals for Secondary Schools',
    template: '%s | VirtuLab Kenya',
  },
  description:
    'Free, browser-based virtual science practicals for Kenyan secondary school students. KCSE-aligned experiments in Chemistry, Physics and Biology - no lab equipment needed.',
  keywords: ['KCSE', 'virtual lab', 'chemistry', 'physics', 'biology', 'Kenya', 'secondary school'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
