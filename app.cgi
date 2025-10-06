from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import sqlite3
import os
from datetime import timedelta  # Corrección: Importar timedelta

# Función para conectarse a config.db (Usuarios, contraseñas, configuraciones generales)
def get_config_db_connection():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "config.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    except sqlite3.Error as e:
        print(f"Error al conectar a config.db: {e}")
        return None
    

# Función para conectarse a svc.db (Gestión de SVCs)
def get_svc_db_connection():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "svc.db")
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    except sqlite3.Error as e:
        print(f"Error al conectar a svc.db: {e}")
        return None

# Función para inicializar las tablas en las bases de datos
def init_svc_db():
    conn = get_svc_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS svc (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            svc_code TEXT NOT NULL UNIQUE,
            svc_name TEXT NOT NULL,
            preauthorization_amount REAL NOT NULL,
            diagnostic_fee REAL NOT NULL,
            labor REAL NOT NULL,
            major_sealed_system_labor REAL NOT NULL,
            shipping_address TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def init_config_db():
    conn = get_config_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

# Inicializa las bases de datos al iniciar la app
init_svc_db()
init_config_db()

# Crear instancia de Flask
app = Flask(__name__)
app.secret_key = "your_secret_key"
CORS(app)
app.permanent_session_lifetime = timedelta(hours=1)  # Expira después de 1 hora

app.config['APPLICATION_ROOT'] = '/'


@app.route('/configurations', methods=['GET', 'POST'])
def configurations():
    conn = get_config_db_connection()  # Conexión a la base de datos
    if request.method == 'POST':  # Actualizar configuraciones dinámicas
        try:
            # Verificar que los datos se reciban correctamente desde el frontend
            data = request.json
            if not data or 'lessThanOneYearPercentage' not in data or 'moreThanOneYearPercentage' not in data:
                print("Datos incompletos recibidos del frontend:", data)
                return jsonify({"error": "Incomplete data provided"}), 400
            
            less_than_one_year = data['lessThanOneYearPercentage']
            more_than_one_year = data['moreThanOneYearPercentage']

            print(f"Actualizando valores: lessThanOneYearPercentage={less_than_one_year}, moreThanOneYearPercentage={more_than_one_year}")

            # Validar que los valores sean números antes de actualizar
            try:
                less_than_one_year = float(less_than_one_year)
                more_than_one_year = float(more_than_one_year)
            except ValueError:
                print("Valores no válidos recibidos:", {
                    "lessThanOneYearPercentage": less_than_one_year,
                    "moreThanOneYearPercentage": more_than_one_year
                })
                return jsonify({"error": "Invalid values provided"}), 400

            # Actualizar los valores en la tabla configurations
            conn.execute("""
                UPDATE configurations SET value = ? WHERE key = 'lessThanOneYearPercentage'
            """, (less_than_one_year,))
            conn.execute("""
                UPDATE configurations SET value = ? WHERE key = 'moreThanOneYearPercentage'
            """, (more_than_one_year,))
            conn.commit()

            print("Valores actualizados exitosamente en configurations.")  # Log para depuración
            return jsonify({"message": "Configuration updated successfully!"}), 200
        except Exception as e:
            print(f"Error al actualizar la configuración en configurations: {e}")
            return jsonify({"error": "Failed to save configuration"}), 500
        finally:
            conn.close()

    elif request.method == 'GET':  # Obtener configuraciones dinámicas
        try:
            # Recuperar los valores desde la tabla configurations
            config = conn.execute("""
                SELECT key, value
                FROM configurations
                WHERE key IN ('lessThanOneYearPercentage', 'moreThanOneYearPercentage')
            """).fetchall()

            conn.close()

            # Construir un diccionario con las claves y valores
            response_data = {row['key']: float(row['value']) for row in config}
            print("Datos enviados al frontend desde configurations:", response_data)
            return jsonify(response_data), 200
        except Exception as e:
            print(f"Error al obtener configuraciones desde configurations: {e}")
            return jsonify({"error": "Failed to fetch configurations"}), 500
        
# Ruta raíz para redirigir a /login
@app.route('/')
def root():
    return redirect(url_for('login'))

# Ruta para el login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        conn = get_config_db_connection()
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            session['role'] = user['role']

            if user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('repair_evaluator'))
        else:
            return render_template('login.html', error_message="Invalid username or password")

    return render_template('login.html')

# Ruta para el dashboard de admin
@app.route('/admin')
def admin_dashboard():
    if 'role' in session and session['role'] == 'admin':
        return render_template('admin.html', username=session['username'])
    else:
        return redirect(url_for('login'))

# Ruta para el evaluador de reparación
@app.route('/repair')
def repair_evaluator():
    if 'role' in session and session['role'] == 'agent':
        return render_template('index.html', username=session['username'])
    else:
        return redirect(url_for('login'))

# Endpoint para obtener la lista de usuarios
@app.route('/get_users', methods=['GET'])
def get_users():
    try:
        conn = get_config_db_connection()
        users = conn.execute("SELECT username FROM users").fetchall()
        conn.close()
        return jsonify([user['username'] for user in users]), 200
    except sqlite3.Error as e:
        print(f"Error fetching users: {e}")
        return jsonify({"error": "Failed to fetch users"}), 500

# Endpoint para obtener información del agente activo
@app.route('/get_agent_info', methods=['GET'])
def get_agent_info():
    if 'username' in session:
        return jsonify({"name": session['username']})
    else:
        return jsonify({"name": "Unknown Agent"}), 404
    
    # Rutas para manejo de SVC
@app.route("/svc", methods=["GET"])
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
    
@app.route("/svc", methods=["POST"])
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

@app.route("/svc/<svc_code>", methods=["PUT"])
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

@app.route("/svc/<svc_code>", methods=["DELETE"])
def delete_svc(svc_code):
    conn = get_svc_db_connection()
    conn.execute("DELETE FROM svc WHERE svc_code = ?", (svc_code,))
    conn.commit()
    conn.close()
    return jsonify({"message": "SVC deleted successfully"})

@app.route('/admin/manage_svc')
def manage_svc():
    if 'role' in session and session['role'] == 'admin':
        return render_template('manage_svc.html')
    else:
        return redirect(url_for('login'))
    
@app.route("/svc/<svc_code>", methods=["GET"])
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
    
@app.route('/tax_exemptions')   
def tax_exemptions():
    return render_template('tax_exemptions.html')

@app.route('/parts_resources')
def tax_exemptions():
    return render_template('parts_resources.html')

@app.route('/extended_coverage')
def extended_coverage():
    return render_template('extended_coverage.html')

@app.route('/email_templates')
def email_templates():
    return render_template('email_templates.html')

@app.route('/phone_directory')
def phone_directory():
    return render_template('phone_directory.html')

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')


    
@app.route('/config/svc_markup_tolerance', methods=['GET', 'POST']) 
def svc_markup_tolerance():
    conn = get_config_db_connection()
    if request.method == 'GET':  # Manejo de solicitudes GET
        try:
            # Consultar el valor de 'svc_markup_tolerance' en la tabla settings
            tolerance = conn.execute("""
                SELECT value FROM settings WHERE key = 'svc_markup_tolerance'
            """).fetchone()
            conn.close()
            if tolerance:
                return jsonify({"svc_markup_tolerance": float(tolerance['value'])}), 200
            else:
                print("Tolerancia SVC no encontrada en settings.")
                return jsonify({"error": "SVC Markup Tolerance not found"}), 404
        except Exception as e:
            print(f"Error al obtener SVC Markup Tolerance: {e}")
            return jsonify({"error": "An error occurred while fetching SVC Markup Tolerance"}), 500

    elif request.method == 'POST':  # Manejo de solicitudes POST
        try:
            data = request.json
            if not data or 'svc_markup_tolerance' not in data:
                print("Datos incompletos recibidos en POST:", data)
                return jsonify({"error": "Invalid or missing data provided"}), 400
            
            new_tolerance = data['svc_markup_tolerance']
            try:
                new_tolerance = float(new_tolerance)  # Validar que el valor sea un número
            except ValueError:
                print(f"Valor inválido recibido para svc_markup_tolerance: {new_tolerance}")
                return jsonify({"error": "Invalid tolerance value provided"}), 400

            # Actualizar el valor de 'svc_markup_tolerance' en la tabla settings
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
    
# Iniciar servidor
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(host="0.0.0.0", port=5000, debug=True)