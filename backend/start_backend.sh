#!/bin/bash
echo "🚀 Iniciando SubGuard AI Backend..."

# Matar processo na porta 8000 se existir
echo "🔍 Verificando porta 8000..."
PID=$(lsof -ti:8000 2>/dev/null || true)
if [ ! -z "$PID" ]; then
    echo "⚠️ Matando processo existente: $PID"
    kill -9 $PID 2>/dev/null || true
    sleep 2
fi

# Iniciar backend
cd /workspaces/subguard-ai/backend
echo "📁 Diretório: $(pwd)"

# Ativar venv se existir
if [ -f "venv/bin/activate" ]; then
    echo "🐍 Ativando ambiente virtual..."
    source venv/bin/activate
fi

# Verificar dependências
echo "🔧 Verificando dependências..."
python -c "import fastapi; import sqlalchemy; import passlib; print('✅ Dependências OK')" || {
    echo "❌ Falta dependências. Instalando..."
    pip install -r requirements.txt
}

# Criar usuário de teste se não existir
echo "👤 Verificando usuário de teste..."
python create_test_user.py 2>/dev/null || echo "⚠️ Não foi possível criar usuário"

# Iniciar servidor
echo "🌐 Iniciando servidor na porta 8000..."
exec uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
