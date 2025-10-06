from flask import Blueprint, request, jsonify
from db_utils import get_config_db_connection

config_bp = Blueprint("config", __name__)

@config_bp.route("/configurations", methods=["GET", "POST"])
def configurations():
    conn = get_config_db_connection()
    if request.method == "POST":  # Actualizar configuraciones dinámicas
        try:
            data = request.json
            if not data or "lessThanOneYearPercentage" not in data or "moreThanOneYearPercentage" not in data:
                print("Datos incompletos recibidos del frontend:", data)
                return jsonify({"error": "Incomplete data provided"}), 400

            less_than_one_year = float(data["lessThanOneYearPercentage"])
            more_than_one_year = float(data["moreThanOneYearPercentage"])

            conn.execute("""
                UPDATE configurations SET value = ? WHERE key = 'lessThanOneYearPercentage'
            """, (less_than_one_year,))
            conn.execute("""
                UPDATE configurations SET value = ? WHERE key = 'moreThanOneYearPercentage'
            """, (more_than_one_year,))
            conn.commit()

            print("Valores actualizados exitosamente en configurations.")
            return jsonify({"message": "Configuration updated successfully!"}), 200
        except Exception as e:
            print(f"Error al actualizar la configuración en configurations: {e}")
            return jsonify({"error": "Failed to save configuration"}), 500
        finally:
            conn.close()

    elif request.method == "GET":  # Obtener configuraciones dinámicas
        try:
            config = conn.execute("""
                SELECT key, value
                FROM configurations
                WHERE key IN ('lessThanOneYearPercentage', 'moreThanOneYearPercentage')
            """).fetchall()
            conn.close()

            response_data = {row["key"]: float(row["value"]) for row in config}
            print("Datos enviados al frontend desde configurations:", response_data)
            return jsonify(response_data), 200
        except Exception as e:
            print(f"Error al obtener configuraciones desde configurations: {e}")
            return jsonify({"error": "Failed to fetch configurations"}), 500

@config_bp.route("/config/svc_markup_tolerance", methods=["GET", "POST"])
def svc_markup_tolerance():
    conn = get_config_db_connection()
    if request.method == "GET":  # Manejo de solicitudes GET
        try:
            tolerance = conn.execute("""
                SELECT value FROM settings WHERE key = 'svc_markup_tolerance'
            """).fetchone()
            conn.close()
            if tolerance:
                return jsonify({"svc_markup_tolerance": float(tolerance["value"])}), 200
            else:
                print("Tolerancia SVC no encontrada en settings.")
                return jsonify({"error": "SVC Markup Tolerance not found"}), 404
        except Exception as e:
            print(f"Error al obtener SVC Markup Tolerance: {e}")
            return jsonify({"error": "An error occurred while fetching SVC Markup Tolerance"}), 500

    elif request.method == "POST":  # Manejo de solicitudes POST
        try:
            data = request.json
            if not data or "svc_markup_tolerance" not in data:
                print("Datos incompletos recibidos en POST:", data)
                return jsonify({"error": "Invalid or missing data provided"}), 400

            new_tolerance = float(data["svc_markup_tolerance"])

            conn.execute("""
                UPDATE settings SET value = ? WHERE key = 'svc_markup_tolerance'
            """, (new_tolerance,))
            conn.commit()
            conn.close()

            print(f"SVC Markup Tolerance actualizado a {new_tolerance}.")
            return jsonify({"message": "SVC Markup Tolerance updated successfully"}), 200
        except Exception as e:
            print(f"Error al actualizar SVC Markup Tolerance: {e}")
            return jsonify({"error": "An error occurred while updating SVC Markup Tolerance"}), 500