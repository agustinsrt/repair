from flask import Blueprint, jsonify, session
from db_utils import get_config_db_connection

user_bp = Blueprint("users", __name__)

@user_bp.route("/get_users", methods=["GET"])
def get_users():
    try:
        conn = get_config_db_connection()
        users = conn.execute("SELECT username FROM users").fetchall()
        conn.close()
        return jsonify([user["username"] for user in users]), 200
    except Exception as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500

@user_bp.route("/get_agent_info", methods=["GET"])
def get_agent_info():
    if "username" in session:
        return jsonify({"name": session["username"]}), 200
    else:
        return jsonify({"name": "Unknown Agent"}), 404