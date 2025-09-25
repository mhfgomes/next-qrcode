import Logo from '@/components/qrickscan/Logo';
import QRCodeGenerator from '@/components/qrickscan/QRCodeGenerator';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12">
        <div className="inline-block">
          <Logo />
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Create and personalize your QR codes in seconds. Input text or a URL, add a logo, customize colors, and download your unique QR code instantly.
        </p>
      </header>
      <QRCodeGenerator />
    </main>
  );
}
