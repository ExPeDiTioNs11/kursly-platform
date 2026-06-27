export const metadata = { title: 'Gizlilik & Koşullar — Kursly' };

export default function PrivacyPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Gizlilik &amp; Kullanım Koşulları</h1>
      <div className="mt-6 space-y-6 text-muted-foreground">
        <p>
          Kursly’i kullanarak aşağıdaki temel ilkeleri kabul etmiş olursun. Bu sayfa örnek bir özet
          niteliğindedir.
        </p>
        <div>
          <h2 className="font-semibold text-foreground">Verilerin</h2>
          <p className="mt-1">
            Hesap bilgilerin ve öğrenme verilerin yalnızca hizmeti sağlamak için kullanılır, üçüncü
            taraflarla satılmaz.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">İçerik</h2>
          <p className="mt-1">
            Paylaştığın içeriklerden sen sorumlusun. Telif hakkı ihlali ve uygunsuz içerik yasaktır.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Hesabın</h2>
          <p className="mt-1">
            Hesap güvenliğin senin sorumluluğundadır. Şüpheli bir durumda destek ekibiyle iletişime
            geç.
          </p>
        </div>
      </div>
    </div>
  );
}
