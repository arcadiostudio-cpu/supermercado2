# 🚀 Guia de Deploy no Netlify - Super Mercado Rocha

## ⚡ Solução Rápida para o Erro

O erro `supabaseUrl is required` acontece porque as variáveis de ambiente não estão configuradas durante o build. Siga estes passos:

### 1. 📋 Configure as Variáveis no Netlify

1. **Acesse seu site no Netlify**
2. **Vá em**: Site settings → Environment variables
3. **Adicione estas variáveis**:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
\`\`\`

### 2. 🔄 Faça um Novo Deploy

Após configurar as variáveis:
1. **Vá em**: Deploys
2. **Clique em**: "Trigger deploy" → "Deploy site"

### 3. ✅ Verificação

O site deve funcionar com:
- **Página principal**: Produtos de exemplo (se Supabase não configurado)
- **Painel admin**: Aviso de configuração necessária
- **Build**: Sem erros

## 🛠️ Configuração Completa

### Passo 1: Supabase
1. Crie projeto no [Supabase](https://supabase.com)
2. Execute os scripts SQL:
   - `scripts/01-create-tables.sql`
   - `scripts/02-seed-data.sql`
3. Copie as credenciais

### Passo 2: Netlify
1. Configure as variáveis de ambiente
2. Faça novo deploy
3. Teste o funcionamento

### Passo 3: Criar Admin
Execute no console do Supabase:
\`\`\`javascript
const { data, error } = await supabase.auth.signUp({
  email: 'admin@supermercadorocha.com',
  password: 'senha-segura-123'
})
\`\`\`

## 🎯 URLs Finais

- **🏪 Loja**: `https://seu-site.netlify.app`
- **👨‍💼 Admin**: `https://seu-site.netlify.app/admin/login`

## 🔧 Troubleshooting

### Build ainda falhando?
1. Verifique se as variáveis estão corretas
2. Tente um deploy manual
3. Verifique os logs de build

### Site carregando mas sem produtos?
1. Verifique se o Supabase está configurado
2. Execute os scripts SQL
3. Verifique as permissões RLS

### Admin não funciona?
1. Crie um usuário admin
2. Verifique as credenciais do Supabase
3. Teste o login

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Netlify
2. Teste localmente com `npm run dev`
3. Confirme que as variáveis estão corretas
