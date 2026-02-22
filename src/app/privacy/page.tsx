import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última actualização: {new Date().toLocaleDateString("pt")}</p>
          </div>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Informações que Recolhemos</h2>
            <p className="text-muted-foreground">Recolhemos informações que nos fornece directamente, incluindo nome, endereço de email, número de telemóvel e província quando cria uma conta. Também recolhemos informações sobre os produtos que publica e as mensagens que envia através da plataforma.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Como Usamos as suas Informações</h2>
            <p className="text-muted-foreground">As suas informações são utilizadas para fornecer e melhorar os nossos serviços, processar transacções, enviar comunicações relacionadas com o serviço, e cumprir obrigações legais. Nunca vendemos os seus dados a terceiros.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Segurança dos Dados</h2>
            <p className="text-muted-foreground">Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações pessoais. As senhas são encriptadas com bcrypt. As comunicações são protegidas por HTTPS.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Os seus Direitos</h2>
            <p className="text-muted-foreground">Tem o direito de aceder, corrigir ou eliminar os seus dados pessoais. Para exercer estes direitos, contacte-nos através do email de suporte.</p>
          </section>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Aviso Anti-Fraude</h3>
                <p className="text-sm text-muted-foreground">O MOZ VENDAS não solicita transferências bancárias antecipadas. Nunca partilhe dados bancários com desconhecidos. Prefira transacções presenciais em locais seguros.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
