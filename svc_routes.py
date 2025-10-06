from flask import Blueprint, request, jsonify, session, render_template, redirect, url_for
from db_utils import get_svc_db_connection

svc_bp = Blueprint("svc", __name__)

@svc_bp.route("/svc", methods=["GET"])
def search_svc_by_name():
    query = request.args.get("query", "").lower()
    conn = get_svc_db_connection()
    try:
        svc_list = conn.execute("""
            SELECT * FROM svc
            WHERE LOWER(svc_name) LIKE ?
        """, (f"%{query}%",)).fetchall()

        if not svc_list:
            svc_list = conn.execute("SELECT * FROM svc").fetchall()  # Devuelve todos los SVC si no hay coincidencias

        conn.close()
        return jsonify([dict(svc) for svc in svc_list])  # Devuelve resultados, incluso si es la lista completa
    except Exception as e:
        print(f"Error searching SVCs: {e}")
        return jsonify({"error": "An error occurred while searching for SVCs."}), 500

@svc_bp.route("/svc", methods=["POST"])
def add_svc():
    data = request.json
    conn = get_svc_db_connection()
    try:
        conn.execute("""
            INSERT INTO svc (svc_code, svc_name, preauthorization_amount, diagnostic_fee, labor, major_sealed_system_labor, shipping_address)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data["svc_code"],
            data["svc_name"],
            data["preauthorization_amount"],
            data["diagnostic_fee"],
            data["labor"],
            data["major_sealed_system_labor"],
            data["shipping_address"]
        ))
        conn.commit()
        return jsonify({"message": "SVC added successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "SVC Code already exists"}), 400
    finally:
        conn.close()

@svc_bp.route("/svc/<svc_code>", methods=["PUT"])
def update_svc(svc_code):
    data = request.json
    conn = get_svc_db_connection()
    conn.execute("""
        UPDATE svc
        SET svc_name = ?, preauthorization_amount = ?, diagnostic_fee = ?, labor = ?, major_sealed_system_labor = ?, shipping_address = ?
        WHERE svc_code = ?
    """, (
        data["svc_name"],
        data["preauthorization_amount"],
        data["diagnostic_fee"],
        data["labor"],
        data["major_sealed_system_labor"],
        data["shipping_address"],
        svc_code
    ))
    conn.commit()
    conn.close()
    return jsonify({"message": "SVC updated successfully"})

@svc_bp.route("/svc/<svc_code>", methods=["DELETE"])
def delete_svc(svc_code):
    conn = get_svc_db_connection()
    conn.execute("DELETE FROM svc WHERE svc_code = ?", (svc_code,))
    conn.commit()
    conn.close()
    return jsonify({"message": "SVC deleted successfully"})

@svc_bp.route("/svc/<svc_code>", methods=["GET"])
def get_svc_details(svc_code):
    conn = get_svc_db_connection()
    try:
        svc = conn.execute("SELECT * FROM svc WHERE svc_code = ?", (svc_code,)).fetchone()
        conn.close()

        if svc:
            return jsonify(dict(svc))  # Devuelve los detalles del SVC en formato JSON
        else:
            return jsonify({"error": "SVC not found"}), 404  # Error si no existe el código
    except sqlite3.Error as e:
        print(f"Error fetching SVC details: {e}")
        return jsonify({"error": "An error occurred while fetching SVC details"}), 500

@svc_bp.route("/admin/manage_svc")
def manage_svc():
    if "role" in session and session["role"] == "admin":
        return render_template("manage_svc.html")
    else:
        return redirect(url_for("auth.login"))