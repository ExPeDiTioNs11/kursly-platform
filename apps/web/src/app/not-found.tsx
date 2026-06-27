import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Aradığın sayfayı bulamadık.</p>
      <Link href="/" className={buttonVariants()}>
        Ana sayfaya dön
      </Link>
    </div>
  );
}
