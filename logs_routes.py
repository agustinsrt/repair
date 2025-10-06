from flask import Blueprint, request, jsonify
import os, json
from datetime import datetime

logs_bp = Blueprint("logs", __name__, url_prefix="/logs")
BASE_LOG_DIR = "logs"

@logs_bp.route("/<agent_id>/add", methods=["POST"])
def add_log(agent_id):
    data = request.get_json()

    auth = data.get("authNumber")
    status = data.get("status") or data.get("decision")

    if not auth or not status:
        return jsonify({"error": "Missing required fields"}), 400

    data["done"] = False  # Asegurás el campo aunque no venga desde el frontend

    today = datetime.utcnow().strftime("%Y-%m-%d")
    agent_folder = os.path.join(BASE_LOG_DIR, agent_id)
    os.makedirs(agent_folder, exist_ok=True)

    log_path = os.path.join(agent_folder, f"{today}.json")
    logs = []

    if os.path.exists(log_path):
        with open(log_path, "r") as f:
            try:
                logs = json.load(f)
            except Exception as e:
                print(f"⚠️ Error leyendo {log_path}: {e}")

    logs.append(data)

    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)

    print(f"✅ Log agregado: {auth} | {status} | Comment: {data.get('comment', '')}")
    return jsonify(success=True)

    logs.append(log_entry)

    with open(log_path, "w") as f:
        json.dump(logs, f, indent=2)

    print(f"✅ Log agregado: {auth} | {status} | Comment: {comment}")
    return jsonify(success=True)


@logs_bp.route("/<agent_id>/<date>.json", methods=["GET"])
def get_logs_for_date(agent_id, date):
    log_path = os.path.join(BASE_LOG_DIR, agent_id, f"{date}.json")
    if not os.path.exists(log_path):
        return jsonify([])

    with open(log_path, "r") as f:
        return jsonify(json.load(f))


@logs_bp.route("/<agent_id>/", methods=["GET"])
def list_dates_for_agent(agent_id):
    folder = os.path.join(BASE_LOG_DIR, agent_id)
    if not os.path.exists(folder):
        return jsonify([])

    files = [f.replace(".json", "") for f in os.listdir(folder) if f.endswith(".json")]
    return jsonify(sorted(files, reverse=True))

@logs_bp.route("/<agent_id>/all.json", methods=["GET"])
def get_all_logs_for_agent(agent_id):
    agent_folder = os.path.join(BASE_LOG_DIR, agent_id)
    if not os.path.isdir(agent_folder):
        return jsonify([])

    entries = []
    for filename in os.listdir(agent_folder):
        if filename.endswith(".json"):
            date_str = filename.replace(".json", "")
            file_path = os.path.join(agent_folder, filename)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    claims = json.load(f)
                entries.append({
                    "agent": agent_id,
                    "date": date_str,
                    "claims": claims
                })
            except Exception as e:
                print(f"❌ Error leyendo {file_path}: {e}")

    return jsonify(entries)