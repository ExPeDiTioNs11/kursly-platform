import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  Check,
  Code2,
  GraduationCap,
  Infinity as InfinityIcon,
  LineChart,
  Megaphone,
  Palette,
  PlayCircle,
  Quote,
  Search,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from 'lucide-react';
import type { CategoryNode, FeaturedReview, PlatformStats } from '@kursly/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CountUp, Marquee, Reveal } from '@/components/landing/motion';

/* ──────────────────  Shared bits  ────────────────── */

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="inline-block rounded-full bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-muted-foreground">{desc}</p>}
    </div>
  );
}

/* ─────────────────────────  HERO  ───────────────────────── */

const heroTopics = [
  'React',
  'TypeScript',
  'Python',
  'UI/UX Tasarım',
  'Next.js',
  'Veri Analizi',
  'Dijital Pazarlama',
  'Figma',
  'Node.js',
  'Docker',
  'SEO',
  'Flutter',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/50 via-background to-background">
      {/* Aurora blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 animate-aurora rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 animate-float-slow rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-aurora rounded-full bg-sky-400/20 blur-3xl [animation-delay:3s]" />
      </div>
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="container relative py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            Türkiye’nin online eğitim platformu
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Yeni bir şey öğrenmek için{' '}
            <span className="animate-gradient bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              en doğru zaman
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Alanında uzman eğitmenlerden hazırlanan video kurslarla yazılım, tasarım, pazarlama ve
            daha fazlasını kendi hızında öğren.
          </p>

          {/* Arama çubuğu — kurslar sayfasına yönlendirir */}
          <form
            action="/courses"
            className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border bg-background/90 p-2 shadow-lg shadow-indigo-500/5 backdrop-blur transition focus-within:ring-2 focus-within:ring-indigo-500/40"
          >
            <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              name="search"
              placeholder="Ne öğrenmek istersin? (örn. TypeScript, UI tasarımı)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Kurs ara"
            />
            <Button
              type="submit"
              className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md transition hover:brightness-110"
            >
              Ara
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              4.8/5 ortalama puan
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              50.000+ mutlu öğrenci
            </span>
          </div>
        </Reveal>

        {/* Kayan konu şeridi */}
        <Reveal delay={150} className="mt-12">
          <Marquee>
            {heroTopics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border bg-background/70 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur"
              >
                {topic}
              </span>
            ))}
          </Marquee>
        </Reveal>
      </div>
    </section>
  );
}

/* ─────────────────────────  STATS  ───────────────────────── */

export function Stats({ stats }: { stats: PlatformStats }) {
  const items = [
    { value: stats.courses, label: 'Video kurs', color: 'from-indigo-600 to-violet-600' },
    { value: stats.students, label: 'Öğrenci', color: 'from-sky-500 to-cyan-500' },
    { value: stats.instructors, label: 'Eğitmen', color: 'from-fuchsia-600 to-pink-600' },
    { value: stats.enrollments, label: 'Toplam kayıt', color: 'from-emerald-500 to-teal-500' },
  ];
  return (
    <section className="border-b bg-background">
      <div className="container grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 100} className="text-center">
            <div
              className={`bg-gradient-to-r ${stat.color} bg-clip-text text-4xl font-bold text-transparent sm:text-5xl`}
            >
              <CountUp value={stat.value} />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">{stat.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  KATEGORİLER  ───────────────────────── */

const CATEGORY_META: Record<string, { icon: typeof Code2; gradient: string }> = {
  'web-development': { icon: Code2, gradient: 'from-indigo-500 to-violet-500' },
  design: { icon: Palette, gradient: 'from-rose-500 to-pink-500' },
  'data-science': { icon: LineChart, gradient: 'from-sky-500 to-cyan-500' },
  marketing: { icon: Megaphone, gradient: 'from-amber-500 to-orange-500' },
  business: { icon: Briefcase, gradient: 'from-emerald-500 to-teal-500' },
  mobile: { icon: Smartphone, gradient: 'from-cyan-500 to-blue-500' },
  'personal-development': { icon: BarChart3, gradient: 'from-fuchsia-500 to-purple-500' },
};
const CATEGORY_FALLBACK = { icon: GraduationCap, gradient: 'from-slate-500 to-slate-600' };
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

export function Categories({ categories }: { categories: CategoryNode[] }) {
  const shown = [...categories]
    .sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.slug);
      const ib = CATEGORY_ORDER.indexOf(b.slug);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .slice(0, 6);

  return (
    <section id="kategoriler" className="scroll-mt-20 bg-background py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Kategoriler"
          title="Popüler kategoriler"
          desc="İlgi alanına uygun kategoriyi seç, öğrenmeye hemen başla."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {shown.map((cat, i) => {
            const meta = CATEGORY_META[cat.slug] ?? CATEGORY_FALLBACK;
            const Icon = meta.icon;
            return (
              <Reveal key={cat.id} delay={i * 70}>
                <Link href={`/courses?category=${cat.slug}`}>
                  <Card className="group h-full overflow-hidden border-transparent bg-secondary/40 transition-all duration-300 hover:-translate-y-1.5 hover:bg-background hover:shadow-xl hover:shadow-indigo-500/5">
                    <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                      <span
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="h-7 w-7" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{cat.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {cat.children.length > 0
                            ? `${cat.children.length} alt kategori`
                            : 'Keşfet'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  NEDEN KURSLY  ───────────────────────── */

const features = [
  {
    icon: InfinityIcon,
    title: 'Sınırsız erişim',
    desc: 'Satın aldığın kurslara ömür boyu, dilediğin cihazdan eriş.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: UserCheck,
    title: 'Uzman eğitmenler',
    desc: 'Sektörde aktif çalışan, alanında deneyimli eğitmenlerden öğren.',
    gradient: 'from-sky-500 to-cyan-500',
  },
  {
    icon: PlayCircle,
    title: 'Kendi hızında',
    desc: 'İstediğin zaman izle, durdur, tekrar et. Program tamamen sana göre.',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
  {
    icon: Award,
    title: 'Tamamlama sertifikası',
    desc: 'Bitirdiğin her kurs için dijital sertifika kazan, profilini güçlendir.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function Features() {
  return (
    <section id="neden-kursly" className="scroll-mt-20 border-y bg-secondary/30 py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Neden Biz"
          title="Neden Kursly?"
          desc="Öğrenmeyi kolay, esnek ve keyifli hale getiriyoruz."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 90}>
              <Card className="group relative h-full overflow-hidden border-none bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <span
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                />
                <CardContent className="p-6">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  NASIL ÇALIŞIR  ───────────────────────── */

const steps = [
  {
    num: '1',
    title: 'Hesap oluştur',
    desc: 'Saniyeler içinde ücretsiz kaydol, hemen başla.',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    num: '2',
    title: 'Kursunu seç',
    desc: 'Binlerce kurs arasından sana uygun olanı bul.',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
  {
    num: '3',
    title: 'Öğrenmeye başla',
    desc: 'Kendi hızında izle, uygula ve sertifikanı kazan.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 bg-background py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Adımlar"
          title="Nasıl çalışır?"
          desc="Üç basit adımda öğrenmeye başla."
        />
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Bağlantı çizgisi */}
          <div
            aria-hidden
            className="absolute left-1/2 top-7 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-border to-transparent md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 120} className="relative text-center">
              <span
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} text-xl font-bold text-white shadow-lg`}
              >
                {step.num}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  YORUMLAR  ───────────────────────── */

const TESTIMONIAL_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-fuchsia-500 to-pink-500',
  'from-emerald-500 to-teal-500',
];

export function Testimonials({ reviews }: { reviews: FeaturedReview[] }) {
  if (reviews.length === 0) return null;
  const shown = reviews.slice(0, 3);

  return (
    <section className="border-y bg-secondary/30 py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Yorumlar"
          title="Öğrencilerimiz ne diyor?"
          desc="Gerçek öğrencilerin kurslar hakkındaki değerlendirmeleri."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {shown.map((r, i) => (
            <Reveal key={r.id} delay={i * 100}>
              <Card className="h-full bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <CardContent className="flex h-full flex-col p-6">
                  <Quote className="h-8 w-8 text-indigo-500/30" />
                  <p className="mt-3 flex-1 text-sm leading-relaxed">{r.comment}</p>
                  <div className="mt-1 flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s < r.rating ? 'fill-current' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${TESTIMONIAL_GRADIENTS[i % 3]} font-semibold text-white`}
                    >
                      {r.user.name.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{r.user.name}</div>
                      <div className="text-xs text-muted-foreground">{r.courseTitle}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  KARİYER YOLLARI  ───────────────────────── */

const paths = [
  {
    icon: Code2,
    title: 'Web Geliştirici Ol',
    desc: 'Sıfırdan modern web uygulamaları geliştirmeyi öğren.',
    skills: ['HTML & CSS', 'JavaScript', 'React & Next.js'],
    meta: '12 kurs · 48 saat',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    icon: LineChart,
    title: 'Veri Analisti Ol',
    desc: 'Veriyi anlamlandır, kararları rakamlarla destekle.',
    skills: ['Excel & SQL', 'Python', 'Veri Görselleştirme'],
    meta: '9 kurs · 36 saat',
    gradient: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Palette,
    title: 'UI/UX Tasarımcı Ol',
    desc: 'Kullanıcı dostu, etkileyici arayüzler tasarla.',
    skills: ['Tasarım İlkeleri', 'Figma', 'Prototipleme'],
    meta: '8 kurs · 30 saat',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
];

export function LearningPaths() {
  return (
    <section id="yollar" className="scroll-mt-20 bg-background py-20">
      <div className="container">
        <SectionHeading
          eyebrow="Kariyer Yolları"
          title="Hedefine giden yolu seç"
          desc="Dağınık kurslar yerine, sıfırdan ileri seviyeye adım adım ilerleyen öğrenme yolları."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {paths.map((path, i) => (
            <Reveal key={path.title} delay={i * 100}>
              <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
                <div className={`bg-gradient-to-br ${path.gradient} p-6 text-white`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur transition-transform duration-300 group-hover:scale-110">
                    <path.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{path.title}</h3>
                  <p className="mt-1 text-sm text-white/85">{path.desc}</p>
                </div>
                <CardContent className="flex flex-1 flex-col p-6">
                  <ul className="flex-1 space-y-2.5">
                    {path.skills.map((skill) => (
                      <li key={skill} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                        {skill}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <span className="text-xs font-medium text-muted-foreground">{path.meta}</span>
                    <Link href="/courses">
                      <Button variant="ghost" size="sm" className="group/btn -mr-2">
                        Yolu İncele
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  SON CTA  ───────────────────────── */

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="container relative py-20 text-center">
        <Reveal>
          <h2 className="text-3xl font-bold sm:text-4xl">Hemen öğrenmeye başla</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Ücretsiz hesap oluştur, ilk kursunu bugün keşfet. Hiçbir taahhüt yok.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="shadow-lg">
                Ücretsiz Kaydol
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Kursları Keşfet
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
