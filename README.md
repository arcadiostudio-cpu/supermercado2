# Super Mercado Rocha - Sistema de Delivery

Sistema completo de delivery para supermercado com interface mobile-first e painel administrativo.

## 🚀 Deploy no Netlify

### Pré-requisitos
1. Conta no [Netlify](https://netlify.com)
2. Conta no [Supabase](https://supabase.com)
3. Repositório no GitHub

### Passo a Passo

#### 1. Configurar o Supabase
1. Crie um novo projeto no Supabase
2. Execute os scripts SQL na ordem:
   - `scripts/01-create-tables.sql`
   - `scripts/02-seed-data.sql`
3. Anote as credenciais:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 2. Preparar o Repositório
\`\`\`bash
# Clone ou faça fork do repositório
git clone [seu-repositorio]
cd supermercado-rocha

# Instale as dependências
npm install

# Teste localmente
npm run dev
\`\`\`

#### 3. Deploy no Netlify

**Opção A: Via GitHub (Recomendado)**
1. Faça push do código para o GitHub
2. Acesse [Netlify](https://app.netlify.com)
3. Clique em "New site from Git"
4. Conecte seu repositório GitHub
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
6. Adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Clique em "Deploy site"

**Opção B: Via Netlify CLI**
\`\`\`bash
# Instale o Netlify CLI
npm install -g netlify-cli

# Faça login
netlify login

# Build do projeto
npm run build

# Deploy
netlify deploy --prod --dir=out
\`\`\`

#### 4. Configurar Domínio Personalizado (Opcional)
1. No painel do Netlify, vá em "Domain settings"
2. Clique em "Add custom domain"
3. Digite seu domínio (ex: `supermercadorocha.com.br`)
4. Configure o DNS conforme instruções

#### 5. Configurar HTTPS e SSL
- O Netlify configura HTTPS automaticamente
- Certificado SSL gratuito via Let's Encrypt

### 🔧 Configurações Importantes

#### Variáveis de Ambiente no Netlify
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
\`\`\`

#### Configurações de Build
- **Node.js Version**: 18.x
- **Build Command**: `npm run build`
- **Publish Directory**: `out`

### 📱 Funcionalidades

#### Página Principal (Cliente)
- ✅ Catálogo de produtos responsivo
- ✅ Carrinho de compras
- ✅ Finalização de pedidos
- ✅ Design mobile-first
- ✅ Cores azul e vermelho

#### Painel Administrativo
- ✅ Login seguro
- ✅ Gestão de produtos (CRUD)
- ✅ Gestão de pedidos
- ✅ Dashboard com estatísticas
- ✅ Controle de estoque

### 🔐 Criar Usuário Admin

Execute no console do Supabase:
\`\`\`javascript
// No console do navegador, na página do Supabase
const { data, error } = await supabase.auth.signUp({
  email: 'admin@supermercadorocha.com',
  password: 'senha-segura-123'
})
\`\`\`

### 📊 Monitoramento

#### Analytics (Opcional)
Adicione Google Analytics no `app/layout.tsx`:
\`\`\`javascript
// Google Analytics
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
\`\`\`

#### Performance
- ✅ Imagens otimizadas
- ✅ Cache configurado
- ✅ Compressão automática
- ✅ CDN global do Netlify

### 🛠️ Comandos Úteis

\`\`\`bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Preview do build
npm run start

# Deploy manual
netlify deploy --prod --dir=out

# Ver logs do Netlify
netlify logs
\`\`\`

### 🔄 CI/CD Automático

O Netlify fará deploy automático a cada push no branch principal:
1. Detecta mudanças no GitHub
2. Executa `npm run build`
3. Publica na CDN global
4. Notifica por email/Slack

### 📞 Suporte

- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### 🎯 URLs Importantes

Após o deploy:
- **Loja**: `https://seu-site.netlify.app`
- **Admin**: `https://seu-site.netlify.app/admin/login`

---

## 🚀 Status do Deploy

[![Netlify Status](https://api.netlify.com/api/v1/badges/[BADGE-ID]/deploy-status)](https://app.netlify.com/sites/[SITE-NAME]/deploys)
