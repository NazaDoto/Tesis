import pandas as pd

# Archivos corregidos
localidades_file = "localidades_corregidas.xlsx"
barrios_file = "barrios_corregidos.xlsx"

# Leer archivos
localidades = pd.read_excel(localidades_file)
barrios = pd.read_excel(barrios_file)

# Normalizar nombres de columnas a minúsculas
localidades.columns = [c.lower().strip() for c in localidades.columns]
barrios.columns = [c.lower().strip() for c in barrios.columns]

# === 1. Generar script CREATE TABLE para localidades ===
sql_localidades = """
DROP TABLE IF EXISTS localidad;
CREATE TABLE localidad (
    id INT PRIMARY KEY,
    descripcion VARCHAR(255),
    id_dpto INT
);
"""

# Insert de localidades
for _, row in localidades.iterrows():
    id_ = row["id"]
    descripcion = str(row["descripcion"]).replace("'", "''")  # escapar comillas simples
    id_dpto = row["id_dpto"]
    sql_localidades += f"INSERT INTO localidad (id, descripcion, id_dpto) VALUES ({id_}, '{descripcion}', {id_dpto});\n"

# Guardar archivo SQL
with open("localidad.sql", "w", encoding="utf-8") as f:
    f.write(sql_localidades)

# === 2. Generar script CREATE TABLE para barrios ===
sql_barrios = """
DROP TABLE IF EXISTS barrio;
CREATE TABLE barrio (
    id INT PRIMARY KEY,
    descripcion VARCHAR(255),
    id_loc INT,
    FOREIGN KEY (id_loc) REFERENCES localidad(id)
);
"""

# Insert de barrios
for _, row in barrios.iterrows():
    id_ = row["id"]
    descripcion = str(row["descripcion"]).replace("'", "''")
    id_loc = row["id_loc"]
    sql_barrios += f"INSERT INTO barrio (id, descripcion, id_loc) VALUES ({id_}, '{descripcion}', {id_loc});\n"

# Guardar archivo SQL
with open("barrio.sql", "w", encoding="utf-8") as f:
    f.write(sql_barrios)

print("✅ Scripts SQL generados:")
print(" - localidad.sql")
print(" - barrio.sql")
