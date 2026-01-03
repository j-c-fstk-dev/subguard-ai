#!/usr/bin/env python3
"""
Script para diagnosticar e corrigir problema do bcrypt
"""
import sys
import subprocess

print("🔧 Diagnosticando problema do bcrypt...")

# Verificar bcrypt
try:
    import bcrypt
    print(f"✅ bcrypt importado: {bcrypt.__version__}")
except Exception as e:
    print(f"❌ Erro ao importar bcrypt: {e}")

# Verificar passlib
try:
    import passlib
    from passlib.context import CryptContext
    print(f"✅ passlib importado: {passlib.__version__}")
except Exception as e:
    print(f"❌ Erro ao importar passlib: {e}")

# Testar hash simples
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    # Testar com senha curta (evitar erro de 72 bytes)
    test_password = "test123"
    hashed = pwd_context.hash(test_password)
    print(f"✅ Hash test bem-sucedido")
    print(f"   Senha: {test_password}")
    print(f"   Hash: {hashed[:50]}...")
    
    # Testar verificação
    verify_result = pwd_context.verify(test_password, hashed)
    print(f"✅ Verificação: {verify_result}")
    
except Exception as e:
    print(f"❌ Erro no teste de hash: {e}")
    import traceback
    traceback.print_exc()
