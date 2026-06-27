'use client';

import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold">Bir şeyler ters gitti</h1>
      <p className="max-w-md text-muted-foreground">
        Beklenmedik bir hata oluştu. Tekrar deneyebilir ya da ana sayfaya dönebilirsin.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110"
        >
          <RotateCw className="h-4 w-4" />
          Tekrar dene
        </Button>
        <Link href="/">
          <Button variant="outline">Ana sayfa</Button>
        </Link>
      </div>
    </div>
  );
}
