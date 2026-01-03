print("Verificando arquivo de login...")
with open('app/login/page.tsx', 'r') as f:
    content = f.read()
    
if 'localStorage.setItem' in content:
    print("✅ localStorage está sendo usado")
else:
    print("❌ localStorage NÃO está sendo usado")
    
# Verificar onde o token é armazenado
lines = content.split('\n')
for i, line in enumerate(lines):
    if 'token' in line.lower() or 'access_token' in line:
        print(f"Linha {i+1}: {line.strip()}")
