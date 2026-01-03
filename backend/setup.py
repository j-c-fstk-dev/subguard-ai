#!/usr/bin/env python3
import subprocess
import os

def install_deps():
    """Instala dependências mínimas"""
    print("Instalando dependências mínimas...")
    subprocess.run([
        "pip", "install", "-r", "requirements_minimal.txt"
    ], check=True)

def create_env():
    """Cria arquivo .env"""
    print("Criando arquivo .env...")
    env_content = """GEMINI_API_KEY=your_api_key_here
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=sqlite+aiosqlite:///./subguard.db
"""
    
    with open(".env", "w") as f:
        f.write(env_content)
    print("Arquivo .env criado. Edite com sua chave Gemini!")

def create_tables():
    """Cria tabelas no banco de dados"""
    print("Criando tabelas...")
    subprocess.run([
        "python", "-c",
        """
import asyncio
from app.core.database import Base, engine

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Tabelas criadas com sucesso!')

asyncio.run(main())
        """
    ], check=True)

def run_dev():
    """Inicia servidor de desenvolvimento"""
    print("Iniciando servidor de desenvolvimento...")
    subprocess.run([
        "uvicorn", "app.main:app", 
        "--reload", 
        "--host", "0.0.0.0", 
        "--port", "8000"
    ], check=True)

if __name__ == "__main__":
    print("=== SETUP SUBGUARD AI BACKEND ===")
    install_deps()
    create_env()
    create_tables()
    print("\n✅ Setup completo!")
    print("Para iniciar o servidor:")
    print("  python setup.py run")