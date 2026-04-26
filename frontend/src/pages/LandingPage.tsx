import { Link } from 'react-router-dom'
import { Car, CheckCircle2, CalendarDays, GraduationCap, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'

const FEATURES = [
  { icon: <GraduationCap size={24} />, title: 'Instrutores experientes', desc: 'Profissionais certificados com anos de experiência no trânsito.' },
  { icon: <Car size={24} />, title: 'Frota moderna', desc: 'Veículos novos, com câmbio automático e manual, para todas as categorias.' },
  { icon: <CalendarDays size={24} />, title: 'Agendamento online', desc: 'Marque, remarque ou cancele suas aulas pelo nosso portal 24h por dia.' },
  { icon: <CheckCircle2 size={24} />, title: 'Alta taxa de aprovação', desc: 'Metodologia comprovada com foco na prática real de direção.' },
]

const STEPS = [
  { n: '01', title: 'Faça sua matrícula', desc: 'Cadastre-se online em poucos minutos com seu CPF.' },
  { n: '02', title: 'Aulas teóricas', desc: 'Conteúdo completo para a prova do Detran com simulados.' },
  { n: '03', title: 'Aulas práticas', desc: 'Agende seus horários com o instrutor de sua preferência.' },
  { n: '04', title: 'Tire sua CNH', desc: 'Suporte em todas as etapas até a habilitação.' },
]

const CATS = [
  { cat: 'A', label: 'Motos', color: 'bg-red-50 text-red-700 border-red-200' },
  { cat: 'B', label: 'Carros', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { cat: 'C', label: 'Caminhões', color: 'bg-green-50 text-green-700 border-green-200' },
  { cat: 'D', label: 'Ônibus', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { cat: 'E', label: 'Carreta', color: 'bg-orange-50 text-orange-700 border-orange-200' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Car size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base">AutoEscola dos Brothers</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-500 font-medium">
            <a href="#categorias" className="hover:text-slate-900 transition">Categorias</a>
            <a href="#como-funciona" className="hover:text-slate-900 transition">Como funciona</a>
            <a href="#contato" className="hover:text-slate-900 transition">Contato</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/entrar" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition">
              Entrar
            </Link>
            <Link to="/cadastro" className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Matricule-se
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)', backgroundSize: '100px 100px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-36">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-blue-400 text-sm font-semibold mb-4 bg-blue-400/10 px-3 py-1 rounded-full">
              <Star size={13} fill="currentColor" />
              +500 motoristas formados
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Sua carteira de motorista começa aqui
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              Aulas teóricas e práticas com instrutores experientes, frota moderna e agendamento 100% online.
              Tudo que você precisa para conquistar sua CNH.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/cadastro"
                className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                Começar agora
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/entrar"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categorias ──────────────────────────────────────────────────── */}
      <section id="categorias" className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Habilitações disponíveis</h2>
          <p className="text-slate-500 text-center mb-10">Trabalhamos com todas as categorias do Detran</p>
          <div className="flex flex-wrap justify-center gap-4">
            {CATS.map(c => (
              <div key={c.cat} className={`flex flex-col items-center gap-2 px-8 py-5 rounded-2xl border-2 ${c.color}`}>
                <span className="text-3xl font-black">{c.cat}</span>
                <span className="text-sm font-semibold">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Por que nos escolher?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Como funciona ────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-4 p-5 bg-white rounded-2xl border border-slate-200">
                <span className="text-3xl font-black text-blue-100 shrink-0 leading-none">{s.n}</span>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-2xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Pronto para começar?</h2>
          <p className="text-blue-100 mb-8">Crie sua conta gratuitamente e dê o primeiro passo rumo à sua CNH.</p>
          <Link
            to="/cadastro"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition"
          >
            Criar conta grátis
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Contato ─────────────────────────────────────────────────────── */}
      <section id="contato" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Entre em contato</h2>
          <div className="flex flex-wrap justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-3">
              <Phone size={18} className="text-blue-600 shrink-0" />
              <span>(11) 99999-9999</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-blue-600 shrink-0" />
              <span>contato@autoescoladosbrothers.com.br</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-blue-600 shrink-0" />
              <span>Av. Paulista, 1000 — São Paulo, SP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} AutoEscola dos Brothers. Todos os direitos reservados.
        <span className="mx-3">·</span>
        <Link to="/admin" className="hover:text-slate-600 transition">Área administrativa</Link>
      </footer>
    </div>
  )
}
