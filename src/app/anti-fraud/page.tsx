import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AlertTriangle, Shield, Eye, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política Anti-Fraude" };

export default function AntiFraudPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-8 w-8" /> Política Anti-Fraude
            </h1>
            <p className="text-muted-foreground">O MOZ VENDAS tem tolerância zero para fraudes. Leia atentamente para se proteger.</p>
          </div>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Eye className="h-5 w-5" /> O que Constitui Fraude</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Produtos Falsificados", desc: "Vender produtos como originais quando são imitações." },
                { title: "Não Entrega", desc: "Receber pagamento e não entregar o produto." },
                { title: "Descrição Falsa", desc: "Descrever produtos com defeitos como perfeitos." },
                { title: "Phishing", desc: "Enviar links falsos para roubar dados de utilizadores." },
              ].map(item => (
                <div key={item.title} className="bg-muted rounded-lg p-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="h-5 w-5" /> Como se Proteger</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Prefira transacções presenciais em locais públicos e seguros",
                "Nunca pague antes de ver e verificar o produto",
                "Desconfie de preços muito abaixo do mercado",
                "Use as mensagens da plataforma — não partilhe o seu email pessoal",
                "Não clique em links externos enviados por desconhecidos",
                "Reporte imediatamente qualquer comportamento suspeito",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Consequências</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="outline">1ª Infracção</Badge>
                <span className="text-muted-foreground text-sm">Aviso formal e remoção do anúncio</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge variant="destructive">Casos Graves</Badge>
                <span className="text-muted-foreground text-sm">Ban permanente e participação às autoridades competentes</span>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
