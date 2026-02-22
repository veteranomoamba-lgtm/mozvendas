# 🇲🇿 MOZ VENDAS — Guia Completo de Publicação

## ⏱️ Tempo Total Estimado: 30–45 minutos

---

## PASSO 1 — MongoDB Atlas (Base de Dados Grátis)

1. Aceda a **[cloud.mongodb.com](https://cloud.mongodb.com)** → Clique **Try Free**
2. Crie conta e verifique o email
3. Clique **Create a cluster** → Escolha **M0 Free**
4. Região: **AWS / eu-west-1 (Ireland)** (mais próxima de Moçambique)
5. Nome do cluster: `mozvendas-cluster`
6. Aguarde ~2 minutos para o cluster ser criado

### Configurar Acesso:
- **Database Access** → **Add New Database User**:
  - Username: `mozvendas`
  - Password: (gere uma senha forte e guarde!)
  - Role: **Read and write to any database**
- **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)

### Obter a URL de Ligação:
- **Databases** → **Connect** → **Connect your application**
- Driver: **Node.js** → Versão: **5.5 or later**
- Copie a string. Ficará assim:
```
mongodb+srv://mozvendas:SUASENHA@mozvendas-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
- Adicione o nome da base de dados: substitua `/?` por `/mozvendas?`:
```
mongodb+srv://mozvendas:SUASENHA@mozvendas-cluster.xxxxx.mongodb.net/mozvendas?retryWrites=true&w=majority
```

---

## PASSO 2 — Cloudinary (Imagens Grátis — 25GB)

1. Aceda a **[cloudinary.com](https://cloudinary.com)** → **Sign Up for Free**
2. No Dashboard anote o **Cloud Name**
3. Vá a **Settings** (ícone ⚙️) → **Upload** → **Upload presets**
4. Clique **Add upload preset**:
   - Preset name: `mozvendas_uploads`
   - Signing Mode: **Unsigned** ← IMPORTANTE!
   - Folder: `mozvendas`
5. Clique **Save**

---

## PASSO 3 — Google OAuth (Login com Google — Opcional)

1. Aceda a **[console.cloud.google.com](https://console.cloud.google.com)**
2. Crie projecto: **MOZ VENDAS**
3. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs: `https://SEU-DOMINIO.vercel.app/api/auth/callback/google`
6. Copie **Client ID** e **Client Secret**

---

## PASSO 4 — Gerar NEXTAUTH_SECRET

Execute no terminal (Mac/Linux) ou use um gerador online:
```bash
openssl rand -base64 32
```
Resultado exemplo: `K7mN2xP9qR4sT6vW8yZ1aB3cD5eF7gH=`

---

## PASSO 5 — GitHub (Obrigatório para Vercel)

```bash
# 1. Instalar Git (se não tiver)
# Mac: brew install git
# Ubuntu: sudo apt install git

# 2. Na pasta do projecto:
git init
git add .
git commit -m "🇲🇿 MOZ VENDAS - Versão Inicial"

# 3. Criar repositório em github.com
# Depois:
git remote add origin https://github.com/SEU-USERNAME/mozvendas.git
git branch -M main
git push -u origin main
```

---

## PASSO 6 — Vercel (Hospedagem Grátis)

1. Aceda a **[vercel.com](https://vercel.com)** → **Sign Up** (use a conta GitHub)
2. **Add New...** → **Project**
3. **Import Git Repository** → Seleccione `mozvendas`
4. **Framework Preset**: Next.js (detectado automaticamente)
5. **ANTES de clicar Deploy**, configure as variáveis:

### Environment Variables (clique em "Environment Variables"):

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `mongodb+srv://mozvendas:SENHA@...` |
| `NEXTAUTH_SECRET` | (resultado do openssl) |
| `NEXTAUTH_URL` | `https://mozvendas.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | (do Cloudinary) |
| `CLOUDINARY_UPLOAD_PRESET` | `mozvendas_uploads` |
| `ADMIN_EMAIL` | `admin@mozvendas.co.mz` |
| `ADMIN_PASSWORD` | Senha forte (ex: `Admin@Moz2026!`) |
| `SEED_SECRET` | Qualquer string aleatória |
| `NEXT_PUBLIC_BASE_URL` | `https://mozvendas.vercel.app` |

6. Clique **Deploy** e aguarde ~3 minutos

---

## PASSO 7 — Inicializar a Base de Dados

Após o deploy estar concluído, abra no browser:
```
https://mozvendas.vercel.app/api/seed?token=SEU_SEED_SECRET
```

Deve ver:
```json
{ "message": "✅ Base de dados inicializada!", "categories": 10 }
```

Agora pode fazer **login como admin**:
- Email: o seu `ADMIN_EMAIL`
- Senha: o seu `ADMIN_PASSWORD`

> ⚠️ **Após criar o admin, pode remover `ADMIN_PASSWORD` das variáveis de ambiente por segurança extra.**

---

## PASSO 8 — Domínio Moçambicano (Opcional)

### Registar domínio .co.mz:
- Aceda a **[nic.mz](https://www.nic.mz)** (~$30/ano)
- Ou use alternativas: `.com` (~$12/ano) em namecheap.com

### Configurar no Vercel:
1. **Settings** → **Domains** → **Add Domain**
2. Digite `mozvendas.co.mz`
3. Siga as instruções para actualizar os DNS no nic.mz

---

## 🔄 Actualizações Futuras

```bash
# Edite os ficheiros, depois:
git add .
git commit -m "Nova funcionalidade: ..."
git push

# O Vercel faz o deploy automaticamente! ✨
```

---

## 🐛 Resolução de Problemas

| Erro | Solução |
|------|---------|
| `NEXTAUTH_SECRET não definido` | Adicione ao Vercel Environment Variables |
| `DATABASE_URL` inválido | Verifique a string MongoDB, incluindo `/mozvendas?` |
| Upload de imagens falha | Confirme que o preset Cloudinary é **Unsigned** |
| Login não funciona | Verifique `NEXTAUTH_URL` — deve ser o URL exacto sem `/` no final |
| Build falha com Prisma | Certifique que o `buildCommand` é `prisma generate && next build` |

---

## 🔐 Resumo de Segurança

| Feature | Status |
|---------|--------|
| Sem senhas no código | ✅ |
| NEXTAUTH_SECRET obrigatório | ✅ |
| Rate limiting (anti-brute force) | ✅ |
| Headers de segurança (XSS, CSRF, etc.) | ✅ |
| Bcrypt factor 12 para senhas | ✅ |
| Validação de inputs (Zod) | ✅ |
| HTTPS obrigatório (Vercel) | ✅ |
| Uploads via Cloudinary (sem ficheiros locais) | ✅ |
| Endpoint /api/seed protegido | ✅ |
| Admin não pode banir a si próprio | ✅ |
| Carrinho: não pode adicionar produtos próprios | ✅ |
| Moeda: Meticais (MT) | ✅ |
