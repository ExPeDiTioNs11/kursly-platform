import { Mail, MessageSquare } from 'lucide-react';

export const metadata = { title: 'İletişim — Kursly' };

export default function ContactPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">İletişim</h1>
      <p className="mt-3 text-muted-foreground">
        Sorularını ve geri bildirimlerini bekliyoruz. Aşağıdaki kanallardan bize ulaşabilirsin.
      </p>
      <div className="mt-6 space-y-3">
        <a
          href="mailto:destek@kursly.dev"
          className="flex items-center gap-3 rounded-xl border p-4 transition hover:bg-secondary"
        >
          <Mail className="h-5 w-5 text-indigo-600" />
          <span>
            <span className="block font-medium">E-posta</span>
            <span className="text-sm text-muted-foreground">destek@kursly.dev</span>
          </span>
        </a>
        <div className="flex items-center gap-3 rounded-xl border p-4">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <span>
            <span className="block font-medium">Destek saatleri</span>
            <span className="text-sm text-muted-foreground">Hafta içi 09:00 – 18:00</span>
          </span>
        </div>
      </div>
    </div>
  );
}
