import { QrCode } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <QrCode className="h-8 w-8 text-primary" />
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
        QRCode Generator
      </h1>
    </div>
  );
}
