import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Serviço" };

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Termos de Serviço</h1>
            <p className="text-muted-foreground">Última actualização: {new Date().toLocaleDateString("pt")}</p>
          </div>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">Ao criar uma conta ou usar o MOZ VENDAS, concorda com estes termos de serviço. Se não concordar, não deve usar a plataforma.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Responsabilidades do Utilizador</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer informações verdadeiras e actualizadas no registo</li>
              <li>Publicar apenas produtos que possui e pode vender legalmente</li>
              <li>Não enganar outros utilizadores sobre a qualidade ou estado dos produtos</li>
              <li>Tratar outros utilizadores com respeito</li>
              <li>Não usar a plataforma para actividades ilegais</li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. Actividades Proibidas</h2>
            <div className="bg-muted rounded-lg p-4">
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Venda de produtos falsificados ou ilegais</li>
                <li>Fraude, engano ou representação falsa</li>
                <li>Assédio ou comportamento abusivo</li>
                <li>Spam ou comunicações não solicitadas em massa</li>
                <li>Tentar aceder a contas de outros utilizadores</li>
                <li>Publicar conteúdo ofensivo, discriminatório ou ilegal</li>
              </ul>
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Direitos de Administração</h2>
            <p className="text-muted-foreground">O MOZ VENDAS reserva-se o direito de remover conteúdo e banir utilizadores que violem estes termos, sem aviso prévio.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground">O MOZ VENDAS é uma plataforma de intermediação. Não somos responsáveis pelas transacções entre compradores e vendedores. Recomendamos precaução em todas as transacções.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
