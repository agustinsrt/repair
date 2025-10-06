import sqlite3
from werkzeug.security import generate_password_hash

# Crear base de datos y conexión
conn = sqlite3.connect('config.db')

# Crear tabla de configuraciones
conn.execute('''
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
)
''')

# Insertar valores en configuraciones
conn.execute('INSERT INTO configurations (id, key, value) VALUES (?, ?, ?)', (2, 'lessThanOneYearPercentage', '20'))
conn.execute('INSERT INTO configurations (id, key, value) VALUES (?, ?, ?)', (3, 'moreThanOneYearPercentage', '50'))

# Crear tabla de usuarios
conn.execute('''
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
)
''')

# Generar hashes para las contraseñas
admin_password_hash = generate_password_hash('admin123')
agent_password_hash = generate_password_hash('agent123')

# Insertar usuarios en la tabla
conn.execute('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', (1, 'admin', admin_password_hash, 'admin'))
conn.execute('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)', (2, 'agent', agent_password_hash, 'agent'))

# Guardar cambios y cerrar conexión
conn.commit()
conn.close()

print("Base de datos creada exitosamente con configuraciones y usuarios iniciales.")