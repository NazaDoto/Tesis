#drop database sgts;
CREATE DATABASE sgts;
use sgts;

CREATE TABLE USUARIOS (
id INT PRIMARY KEY AUTO_INCREMENT,
dni INT,
usuario VARCHAR(50) UNIQUE,
contraseña VARCHAR(255),
fecha_registro DATE,
correo VARCHAR(100),
rol tinyint default 0
);
CREATE TABLE DEPARTAMENTOS (
    cod_dpto INT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

insert into departamentos (cod_dpto, descripcion) values (0, 'Ninguno');


CREATE TABLE LOCALIDADES (
    cod_localidad INT,
    descripcion VARCHAR(100) NOT NULL,
    cod_dpto INT,
    FOREIGN KEY (cod_dpto) REFERENCES DEPARTAMENTOS(cod_dpto)
);

CREATE TABLE BARRIOS (
    cod_barrio INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(100) NOT NULL,
    cod_localidad INT
);

CREATE TABLE BENEFICIARIOS (
    dni INT PRIMARY KEY,
    cuil varchar(20),
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    sexo CHAR(1),
    cod_dpto INT,
    cod_localidad INT,
    cod_barrio INT,
    domicilio VARCHAR(200),
    fecha_registro DATE,
    hora_registro TIME,
    estado CHAR(1),
    fecha_modificacion DATE,
    hora_modificacion TIME,
    cant_parientes INT DEFAULT 0,
    archivo_adjunto VARCHAR(100),
    telefono VARCHAR(100),
    usuario INT,
    FOREIGN KEY (cod_dpto) REFERENCES DEPARTAMENTOS(cod_dpto),
    FOREIGN KEY (cod_barrio) REFERENCES BARRIOS(cod_barrio),
    FOREIGN KEY (usuario) REFERENCES USUARIOS(id)
);

CREATE TABLE ARCHIVO_BENEFICIARIO(
dni INT,
id_archivo INT,
path VARCHAR(100),
FOREIGN KEY (dni) REFERENCES BENEFICIARIOS(dni)
);
CREATE TABLE PARIENTES (
    dni_titular INT,
    dni_pariente INT,
    nombre_pariente VARCHAR(100),
    fecha_nacimiento DATE,
    sexo CHAR(1),
    fecha_registro DATE,
    fecha_modificacion DATE,
    FOREIGN KEY (dni_titular) REFERENCES BENEFICIARIOS(dni)
);

CREATE TABLE TARJETAS_SOC (
    dni INT,
    num_cuenta VARCHAR(20),
    num_tarjeta VARCHAR(20),
    fecha_registro DATE,
    estado VARCHAR(30),
    fecha_modificacion DATE,
    importe_acreditado DECIMAL(10, 2),
    PRIMARY KEY (dni),
    FOREIGN KEY (dni) REFERENCES BENEFICIARIOS(dni)
);

CREATE TABLE HISTORIAL_MOV (
    dni INT,
    observaciones VARCHAR(255),
    fecha DATE,
    FOREIGN KEY (dni) REFERENCES BENEFICIARIOS(dni)
);

CREATE TABLE SOLICITUDES (
	id INT PRIMARY KEY AUTO_INCREMENT,
	dni INT,
    fecha_solicitud DATE,
    path_dni VARCHAR(100),
    path_historial_medico VARCHAR(100),
    FOREIGN KEY (dni) REFERENCES BENEFICIARIOS(dni)
);

CREATE TABLE NOTICIAS (
id INT PRIMARY KEY AUTO_INCREMENT,
titulo VARCHAR(255),
contenido TEXT
);
insert into noticias(titulo,contenido) values('Prueba noticia 1', 'Prueba contenido 1');
insert into noticias(titulo,contenido) values('Prueba noticia 2', 'Prueba contenido 2');

CREATE TABLE NOTICIAS_IMAGENES (
id INT PRIMARY KEY AUTO_INCREMENT,
path VARCHAR(255),
id_noticia INT,
FOREIGN KEY (id_noticia) REFERENCES NOTICIAS(id)
);
insert into noticias_imagenes(path,id_noticia) values('/uploads/noticia1.jpg',1);
insert into noticias_imagenes(path,id_noticia) values('/uploads/noticia2.jpg',2);