#!/bin/bash

# Script de deploy para o Netlify
echo "🚀 Iniciando deploy do Super Mercado Rocha..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL não configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada"
    exit 1
fi

echo "✅ Variáveis de ambiente configuradas"

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📁 Arquivos gerados em: ./out"
    echo "🌐 Pronto para deploy no Netlify!"
else
    echo "❌ Erro no build"
    exit 1
fi
