#drop database sgts;
create database sgts;
use sgts;

create table usuario (
  id int primary key auto_increment,
  dni int unique,
  usuario varchar(50) unique,
  contraseña varchar(255),
  fecha_registro date,
  correo varchar(100),
  rol tinyint default 0
);

create table departamento (
  id int primary key,
  descripcion varchar(100) not null
);

create table localidad (
  id int primary key,
  descripcion varchar(255),
  id_dpto int,
  foreign key (id_dpto) references departamento(id)
);

create table barrio (
  id int primary key,
  descripcion varchar(100) not null,
  id_loc int,
  foreign key (id_loc) references localidad(id)
);

create table beneficiario (
  id int primary key auto_increment,
  dni int,
  cuil varchar(20),
  nombre varchar(100) not null,
  fecha_nacimiento date,
  sexo char(1),
  id_dpto int null,
  id_loc int null,
  id_barrio int null,
  domicilio varchar(200),
  fecha_registro date,
  hora_registro time,
  estado char(1),
  fecha_modificacion date,
  hora_modificacion time,
  cant_parientes int default 0,
  archivo_adjunto varchar(100),
  telefono varchar(100),
  id_usuario int,
  foreign key (id_dpto) references departamento(id),
  foreign key (id_loc) references localidad(id),
  foreign key (id_barrio) references barrio(id),
  foreign key (id_usuario) references usuario(id)
);

create table archivo_beneficiario (
  id int primary key auto_increment,
  id_beneficiario int,
  dni int,
  id_archivo int,
  path varchar(100),
  foreign key (id_beneficiario) references beneficiario(id)
);

create table pariente (
  id int primary key auto_increment,
  id_beneficiario int,
  dni_titular int,
  dni_pariente int,
  nombre_pariente varchar(100),
  fecha_nacimiento date,
  sexo char(1),
  fecha_registro date,
  fecha_modificacion date,
  foreign key (id_beneficiario) references beneficiario(id)
);

create table tarjeta_soc (
  id int primary key auto_increment,
  id_beneficiario int,
  dni int,
  num_cuenta varchar(20),
  num_tarjeta varchar(20),
  fecha_registro date,
  estado varchar(30),
  fecha_modificacion date,
  importe_acreditado decimal(10, 2),
  foreign key (id_beneficiario) references beneficiario(id)
);

create table historial_mov (
  id int primary key auto_increment,
  id_beneficiario int,
  dni int,
  observaciones varchar(255),
  fecha date,
  foreign key (id_beneficiario) references beneficiario(id)
);

create table solicitud (
  id int primary key auto_increment,
  id_beneficiario int,
  dni int,
  fecha_solicitud date,
  path_dni varchar(100),
  path_historial_medico varchar(100),
  foreign key (id_beneficiario) references beneficiario(id)
);

create table noticia (
  id int primary key auto_increment,
  titulo varchar(255),
  fecha date,
  contenido text,
  usuario int,
  foreign key (usuario) references usuario(id)
);

create table noticia_imagen (
  id int primary key auto_increment,
  path varchar(255),
  id_noticia int,
  foreign key (id_noticia) references noticia(id)
);

create table log (
  id int auto_increment primary key,
  usuario varchar(50),
  actividad varchar(255),
  detalles text,
  fecha timestamp default current_timestamp,
  foreign key (usuario) references usuario(usuario)
);
