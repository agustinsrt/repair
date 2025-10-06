import os
import json
from flask import session

# Resoluciones que se consideran pendientes
PENDING_DECISIONS = {
    "PENDING INFORMATION",
    "PENDING OTL REVIEW",
    "REQUESTED COMP QUOTE"
}

def get_active_cases():
    agent_name = session.get("username")
    if not agent_name:
        print("⚠️ No hay agente en sesión.")
        return []

    agent_folder = os.path.join("logs", agent_name)
    if not os.path.exists(agent_folder):
        print(f"⚠️ Carpeta no encontrada para el agente: {agent_folder}")
        return []

    active_cases = []
    total_entries_checked = 0
    files_processed = 0

    for filename in os.listdir(agent_folder):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(agent_folder, filename)

        try:
            with open(file_path, "r") as f:
                entries = json.load(f)
                files_processed += 1
        except Exception as e:
            print(f"⚠️ Error leyendo {file_path}: {e}")
            continue

        print(f"📁 Procesando {filename}: {len(entries)} entradas")

        for entry in entries:
            total_entries_checked += 1

            # ← Fallback: usa 'status' si existe, o 'decision'
            resolution = entry.get("status") or entry.get("decision", "")
            resolution = resolution.strip().upper()
            done = entry.get("done")

            print(f"   └─ Resolución: {resolution} | Done: {done}")

            if not done and resolution in PENDING_DECISIONS:
                active_cases.append({
                    "auth_number": entry.get("authNumber", "UNKNOWN"),
                    "comment": entry.get("comment", ""),
                    "status": resolution,
                    "date": entry.get("date") or filename.replace(".json", "")
                })

    print(f"🔍 Archivos procesados: {files_processed}")
    print(f"🔢 Entradas revisadas: {total_entries_checked}")
    print(f"📌 Casos pendientes encontrados: {len(active_cases)}")

    return active_cases