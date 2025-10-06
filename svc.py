import sqlite3

# Crear la base de datos y la tabla SVC si no existe
def init_db():
    conn = sqlite3.connect("svc.db")
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

# Inicializa la base de datos
init_db()