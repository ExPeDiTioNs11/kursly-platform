export const metadata = { title: 'Yardım Merkezi — Kursly' };

export default function HelpPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold">Yardım Merkezi</h1>
      <div className="mt-6 space-y-6 text-muted-foreground">
        <div>
          <h2 className="font-semibold text-foreground">Bir kursa nasıl kaydolurum?</h2>
          <p className="mt-1">
            İlgilendiğin kursun sayfasına git ve “Kursa Kayıt Ol” butonuna tıkla. Kayıt olduktan
            sonra dersleri izleyebilir ve ilerlemeni takip edebilirsin.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Eğitmen nasıl olurum?</h2>
          <p className="mt-1">
            Eğitmen hesabıyla giriş yaptıktan sonra menüden “Eğitmen Paneli”ne girip yeni kurs
            oluşturabilirsin.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-foreground">Şifremi unuttum</h2>
          <p className="mt-1">
            Şu an otomatik şifre sıfırlama mevcut değil. Lütfen destek ekibiyle iletişime geç.
          </p>
        </div>
      </div>
    </div>
  );
}
