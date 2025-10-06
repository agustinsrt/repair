from werkzeug.security import generate_password_hash
import sqlite3

# Establece una nueva contraseña para "admin"
new_password = "agent123"  # Cambia esta contraseña según lo desees
hashed_password = generate_password_hash(new_password)

# Conecta a la base de datos y actualiza la contraseña
conn = sqlite3.connect('config.db')
conn.execute("UPDATE users SET password = ? WHERE username = ?", (hashed_password, 'agent'))
conn.commit()
conn.close()

print(f"Nuevo password para 'agent': {new_password}")