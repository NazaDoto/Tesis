#drop database sgts;
CREATE DATABASE sgts;
use sgts;

CREATE TABLE USUARIO (
id INT PRIMARY KEY AUTO_INCREMENT,
dni INT UNIQUE,
usuario VARCHAR(50) UNIQUE,
contraseña VARCHAR(255),
fecha_registro DATE,
correo VARCHAR(100),
rol tinyint default 0
);
CREATE TABLE DEPARTAMENTO (
	id INT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

CREATE TABLE LOCALIDAD (
	id INT PRIMARY KEY,
    descripcion VARCHAR(255),
    id_dpto INT,
    FOREIGN KEY (id_dpto) REFERENCES DEPARTAMENTO(id)
);

CREATE TABLE BARRIO (
    id INT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    id_loc INT,
    FOREIGN KEY (id_loc) REFERENCES LOCALIDAD(id)
);

CREATE TABLE BENEFICIARIO (
	id int primary key auto_increment,
    dni INT,
    cuil varchar(20),
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo CHAR(1),
    id_dpto INT null,
    id_loc INT null,
    id_barrio INT null,
    domicilio VARCHAR(200),
    fecha_registro DATE,
    hora_registro TIME,
    estado CHAR(1),
    fecha_modificacion DATE,
    hora_modificacion TIME,
    cant_parientes INT DEFAULT 0,
    archivo_adjunto VARCHAR(100),
    telefono VARCHAR(100),
    id_usuario INT,
    FOREIGN KEY (id_dpto) REFERENCES DEPARTAMENTO(id),
    FOREIGN KEY (id_loc) REFERENCES LOCALIDAD(id),
    FOREIGN KEY (id_barrio) REFERENCES BARRIO(id),
    FOREIGN KEY (id_usuario) REFERENCES USUARIO(id)
);

CREATE TABLE ARCHIVO_BENEFICIARIO(
id int primary key auto_increment,
id_beneficiario int,
dni INT,
id_archivo INT,
path VARCHAR(100),
FOREIGN KEY (id_beneficiario) REFERENCES BENEFICIARIO(id)
);

CREATE TABLE PARIENTE (
	id int  primary key auto_increment,
    id_beneficiario int,
    dni_titular INT,
    dni_pariente INT,
    nombre_pariente VARCHAR(100),
    fecha_nacimiento DATE,
    sexo CHAR(1),
    fecha_registro DATE,
    fecha_modificacion DATE,
    FOREIGN KEY (id_beneficiario) REFERENCES BENEFICIARIO(id)
);

CREATE TABLE TARJETA_SOC (
	id int primary key auto_increment,
    id_beneficiario int,
    dni INT,
    num_cuenta VARCHAR(20),
    num_tarjeta VARCHAR(20),
    fecha_registro DATE,
    estado VARCHAR(30),
    fecha_modificacion DATE,
    importe_acreditado DECIMAL(10, 2),
    FOREIGN KEY (id_beneficiario) REFERENCES BENEFICIARIO(id)
);

CREATE TABLE HISTORIAL_MOV (
	id int primary key auto_increment,
    id_beneficiario int,
    dni INT,
    observaciones VARCHAR(255),
    fecha DATE,
    FOREIGN KEY (id_beneficiario) REFERENCES BENEFICIARIO(id)
);

CREATE TABLE SOLICITUD (
	id INT PRIMARY KEY AUTO_INCREMENT,
    id_beneficiario int,
	dni INT,
    fecha_solicitud DATE,
    path_dni VARCHAR(100),
    path_historial_medico VARCHAR(100),
    FOREIGN KEY (id_beneficiario) REFERENCES BENEFICIARIO(id)
);

CREATE TABLE NOTICIA (
id INT PRIMARY KEY AUTO_INCREMENT,
titulo VARCHAR(255),
fecha Date,
contenido TEXT,
usuario INT,
foreign key (usuario) references usuario(id)
);

CREATE TABLE NOTICIA_IMAGEN (
id INT PRIMARY KEY AUTO_INCREMENT,
path VARCHAR(255),
id_noticia INT,
FOREIGN KEY (id_noticia) REFERENCES NOTICIA(id)
);

CREATE TABLE log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50),
  actividad VARCHAR(255),
  detalles TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  foreign key (usuario) references usuario(usuario)
);
