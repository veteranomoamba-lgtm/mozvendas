"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Users, 
  TrendingUp, 
  MapPin,
  Star,
  MessageSquare,
  Package,
  Heart
} from "lucide-react";

const stats = [
  { label: "Vendedores Activos", value: "500+", icon: Users },
  { label: "Produtos Listados", value: "2.000+", icon: Package },
  { label: "Províncias Cobertas", value: "11", icon: MapPin },
  { label: "Avaliações 5 Estrelas", value: "98%", icon: Star },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Segurança em Primeiro",
    desc: "Cada transacção é protegida. Verificamos vendedores e monitoramos actividades suspeitas para garantir a tua segurança.",
  },
  {
    icon: Heart,
    title: "Feito para Moçambique",
    desc: "Construído a pensar no mercado local — suporte ao Metical, contactos +258 e categorias relevantes para a nossa realidade.",
  },
  {
    icon: Users,
    title: "Comunidade Forte",
    desc: "Conectamos compradores e vendedores de todas as províncias, criando oportunidades de negócio em todo o país.",
  },
  {
    icon: TrendingUp,
    title: "Crescimento Contínuo",
    desc: "Investimos constantemente em novas funcionalidades para tornar a tua experiência de compra e venda mais fácil.",
  },
];

const team = [
  { name: "Equipa de Produto", role: "Desenvolvimento & Design", emoji: "💻" },
  { name: "Equipa de Suporte", role: "Apoio ao Cliente", emoji: "🎧" },
  { name: "Equipa de Segurança", role: "Protecção & Confiança", emoji: "🛡️" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 pointer-events-none" />
          <div className="container mx-auto px-4 py-20 text-center relative">
            <Badge variant="outline" className="mb-4 text-sm px-4 py-1">
              🇲🇿 O Marketplace de Moçambique
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Sobre o{" "}
              <span className="text-primary">MOZ VENDAS</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Somos o marketplace seguro que conecta compradores e vendedores 
              em todo Moçambique — com confiança, transparência e simplicidade.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* História */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">A Nossa História</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <h2 className="text-3xl font-bold text-center mb-8">
              Nascemos para transformar o comércio em Moçambique
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-lg">
              <p>
                O <strong className="text-foreground">MOZ VENDAS</strong> nasceu da necessidade de criar 
                um espaço digital seguro e acessível onde qualquer moçambicano pudesse 
                comprar e vender com confiança — seja na cidade ou no interior do país.
              </p>
              <p>
                Vimos as dificuldades que as pessoas enfrentavam: falta de confiança 
                nas transacções online, dificuldade em encontrar compradores fora da 
                sua localidade, e ausência de protecção contra fraudes. Decidimos 
                mudar isso.
              </p>
              <p>
                Hoje, somos uma plataforma que oferece <strong className="text-foreground">verificação de vendedores</strong>, 
                sistema de avaliações, mensagens seguras e categorias adaptadas 
                ao mercado moçambicano — tudo pensado para a nossa realidade.
              </p>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Os Nossos Valores
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {values.map((val) => (
                <div
                  key={val.title}
                  className="flex gap-4 p-6 rounded-xl bg-background border hover:border-primary/50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <val.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{val.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Missão */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">🎯 Missão</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Democratizar o comércio electrónico em Moçambique
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A nossa missão é tornar o comércio online acessível a todos os 
                moçambicanos — desde o pequeno vendedor de bairro até à empresa 
                estabelecida — proporcionando ferramentas simples, seguras e eficazes.
              </p>
            </div>
            <div>
              <Badge variant="outline" className="mb-4">🔭 Visão</Badge>
              <h2 className="text-3xl font-bold mb-4">
                Ser a plataforma de referência em África Oriental
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Queremos que o MOZ VENDAS seja reconhecido como o marketplace 
                mais confiável e inovador de Moçambique, expandindo oportunidades 
                económicas para todos os cidadãos.
              </p>
            </div>
          </div>
        </section>

        {/* Equipa */}
        <section className="bg-muted/30 border-y">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">A Nossa Equipa</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Uma equipa dedicada a construir o melhor marketplace de Moçambique
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {team.map((member) => (
                <div key={member.name} className="p-6 rounded-xl bg-background border hover:border-primary/50 transition-colors">
                  <div className="text-4xl mb-3">{member.emoji}</div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-2xl mx-auto p-10 rounded-2xl border bg-primary/5">
            <MessageSquare className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Tens alguma dúvida?</h2>
            <p className="text-muted-foreground mb-6">
              A nossa equipa está sempre disponível para te ajudar. 
              Entra em contacto connosco a qualquer momento.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Package className="h-4 w-4" />
                Ver Produtos
              </a>
              <a
                href="mailto:suporte@mozvendas.co.mz"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border font-medium hover:bg-muted transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Contactar Suporte
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
