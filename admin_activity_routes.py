from flask import Blueprint, render_template, request, jsonify
import os, json
from datetime import datetime

admin_activity_bp = Blueprint("admin_activity", __name__)
LOGS_DIR = "logs"  # Cambialo si tu carpeta se llama distinto

@admin_activity_bp.route("/admin/activity")
def admin_activity():
    return render_template("admin_activity.html")

@admin_activity_bp.route("/admin/activity/data")
def fetch_activity_data():
    start = request.args.get("start")
    end = request.args.get("end")
    selected_agent = request.args.get("agent", "all").lower()

    entries = []

    for agent_name in os.listdir(LOGS_DIR):
        if selected_agent != "all" and agent_name.lower() != selected_agent:
            continue

        agent_folder = os.path.join(LOGS_DIR, agent_name)
        if not os.path.isdir(agent_folder):
            continue

        for filename in os.listdir(agent_folder):
            if not filename.endswith(".json"):
                continue

            date_str = filename.replace(".json", "")
            try:
                file_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                if start and end:
                    if not (start <= file_date.isoformat() <= end):
                        continue
            except:
                continue  # Ignora archivos con nombres raros

            file_path = os.path.join(agent_folder, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    claims = json.load(f)
                entries.append({
                    "agent": agent_name,
                    "date": date_str,
                    "claims": claims
                })
            except Exception as e:
                print(f"❌ Error leyendo {file_path}: {e}")

    return jsonify(entries)

@admin_activity_bp.route("/admin/activity/agents")
def get_agents():
    try:
        agents = sorted([
            name for name in os.listdir("logs")
            if os.path.isdir(os.path.join("logs", name))
        ])
        return jsonify(agents)
    except Exception as e:
        print("Error leyendo agentes:", e)
        return jsonify([]), 500