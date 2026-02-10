"""
Seed Script - Exporta dados atuais e cria demo database
"""

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
import sys
import os

def export_current_database(db_path="../subguard.db"):
    """Exporta dados do banco atual para um arquivo JSON"""
    
    full_path = Path(__file__).parent.parent.parent / db_path
    
    if not full_path.exists():
        print(f"❌ Banco não encontrado em {full_path}")
        print(f"   Procurando em alternativas...")
        
        # Tenta alternativas
        alternatives = [
            Path(__file__).parent.parent.parent / "subguard.db",
            Path(__file__).parent.parent / "subguard.db",
            Path("subguard.db"),
        ]
        
        for alt in alternatives:
            if alt.exists():
                full_path = alt
                print(f"✅ Encontrado em: {full_path}")
                break
        else:
            return None
    
    print(f"📂 Lendo banco de: {full_path}")
    
    conn = sqlite3.connect(str(full_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    data = {
        "users": [],
        "subscriptions": [],
        "optimizations": [],
        "negotiations": [],
        "activities": [],
    }
    
    try:
        # Users
        cursor.execute("SELECT * FROM user")
        for row in cursor.fetchall():
            user_dict = dict(row)
            print(f"  👤 User: {user_dict.get('email')}")
            data["users"].append(user_dict)
        
        # Subscriptions
        cursor.execute("SELECT * FROM subscription")
        for row in cursor.fetchall():
            sub_dict = dict(row)
            print(f"  📱 Subscription: {sub_dict.get('name')} - R${sub_dict.get('cost')}")
            data["subscriptions"].append(sub_dict)
        
        # Optimizations
        cursor.execute("SELECT * FROM optimization")
        for row in cursor.fetchall():
            data["optimizations"].append(dict(row))
        
        if data["optimizations"]:
            print(f"  💡 Optimizations: {len(data['optimizations'])}")
        
        # Negotiations
        cursor.execute("SELECT * FROM negotiation")
        for row in cursor.fetchall():
            data["negotiations"].append(dict(row))
        
        if data["negotiations"]:
            print(f"  🤝 Negotiations: {len(data['negotiations'])}")
        
        # Activities
        cursor.execute("SELECT * FROM activity")
        for row in cursor.fetchall():
            data["activities"].append(dict(row))
        
        if data["activities"]:
            print(f"  📝 Activities: {len(data['activities'])}")
        
        conn.close()
        
        # Salva em JSON
        output_path = Path(__file__).parent / "demo_data.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, default=str)
        
        print(f"\n✅ Dados exportados para {output_path}")
        
        return data
        
    except Exception as e:
        print(f"❌ Erro ao exportar: {e}")
        import traceback
        traceback.print_exc()
        conn.close()
        return None


if __name__ == "__main__":
    print("📤 Exportando banco atual...\n")
    data = export_current_database()
    
    if data:
        print(f"\n✅ RESUMO:")
        print(f"   - {len(data['users'])} usuário(s)")
        print(f"   - {len(data['subscriptions'])} subscription(s)")
        print(f"   - {len(data['optimizations'])} optimization(s)")
        print(f"   - {len(data['negotiations'])} negotiation(s)")
        print(f"   - {len(data['activities'])} activity(ies)")
