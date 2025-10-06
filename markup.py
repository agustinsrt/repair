from app import get_config_db_connection  # Importa la función desde el archivo principal

def init_config_db():
    conn = get_config_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL
        )
    """)
    cursor.execute("""
        INSERT OR IGNORE INTO settings (key, value) VALUES ('svc_markup_tolerance', '35')
    """)
    conn.commit()
    conn.close()

# Ejecuta la función para inicializar la base de datos
if __name__ == "__main__":
    init_config_db()
    print("Tabla settings creada exitosamente.")