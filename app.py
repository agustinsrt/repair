from flask import Flask, jsonify
from flask_cors import CORS
from datetime import timedelta

from db_utils import init_config_db, init_svc_db
from auth_routes import auth_bp
from user_routes import user_bp
from config_routes import config_bp
from svc_routes import svc_bp
from static_views import static_bp
from logs_routes import logs_bp
from coverage_routes import coverage_bp
from admin_activity_routes import admin_activity_bp
from pending_cases import get_active_cases

app = Flask(__name__)
app.secret_key = "your_secret_key"
app.permanent_session_lifetime = timedelta(hours=8)
CORS(app)

# Inicialización de base de datos
init_config_db()
init_svc_db()

# Registro de Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(config_bp)
app.register_blueprint(svc_bp)
app.register_blueprint(static_bp)
app.register_blueprint(logs_bp)
app.register_blueprint(coverage_bp)
app.register_blueprint(admin_activity_bp)

# API para casos pendientes
@app.route("/api/pending-cases", methods=["GET"])
def api_get_pending_cases():
    return jsonify(get_active_cases())

if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000, debug=True)