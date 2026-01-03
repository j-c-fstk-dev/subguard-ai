#!/bin/bash

echo "🚀 SUBGUARD AI - LAUNCH SCRIPT"
echo "================================"

# Função para matar processos
kill_port() {
    echo "🔍 Verificando porta $1..."
    PID=$(sudo lsof -ti:$1 2>/dev/null || true)
    if [ ! -z "$PID" ]; then
        echo "⚠️ Matando processo na porta $1: $PID"
        kill -9 $PID 2>/dev/null || true
        sleep 2
    fi
}

# Matar processos existentes
kill_port 8000  # Backend
kill_port 3000  # Frontend

# Iniciar Backend
echo ""
echo "1. 🐍 INICIANDO BACKEND..."
cd backend

# Ativar venv
if [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
    echo "✅ Ambiente virtual ativado"
fi

# Iniciar em background
echo "🌐 Iniciando FastAPI na porta 8000..."
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Aguardar backend iniciar
echo "⏳ Aguardando backend (5 segundos)..."
sleep 5

# Testar backend
echo "🧪 Testando backend..."
curl -s http://localhost:8000/health && echo "✅ Backend OK" || echo "⚠️ Backend não responde"

# Iniciar Frontend
echo ""
echo "2. ⚛️ INICIANDO FRONTEND..."
cd ../frontend

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Iniciar em background
echo "�� Iniciando Next.js na porta 3000..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Aguardar frontend iniciar
echo "⏳ Aguardando frontend (5 segundos)..."
sleep 5

# Testar frontend
echo "�� Testando frontend..."
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend OK" || echo "⚠️ Frontend não responde"

echo ""
echo "========================================"
echo "🎉 SUBGUARD AI INICIADO COM SUCESSO!"
echo ""
echo "🌐 Backend API:  http://localhost:8000"
echo "📚 API Docs:     http://localhost:8000/docs"
echo "🖥️  Frontend:     http://localhost:3000"
echo "👤 Login:        http://localhost:3000/login"
echo ""
echo "🔧 Credenciais de teste:"
echo "   Email: usuario@teste.com"
echo "   Senha: senha123"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"
echo "========================================"

# Manter script rodando
echo ""
echo "Pressione CTRL+C para parar todos os serviços..."
wait
