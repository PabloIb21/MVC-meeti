const Usuarios = require('../models/Usuarios');
const { body, validationResult } = require('express-validator');
const enviarEmail = require('../handler/email');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/perfiles/');
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, next){
        if(!file.mimetype.includes('image')){
            return next(new Error('El archivo no es una imagen'), false);
        }
        next(null, true);
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === 'LIMIT_FILE_SIZE'){
                    req.flash('error', 'El archivo es muy grande');
                } else{
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')){
                req.flash('error', error.message);
            }
            res.redirect('back');
            return;
        } else {
            next();
        }
    });
}

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crear tu cuenta'
    });
}

exports.crearCuenta = async (req, res) => {
    const usuario = req.body;

    const rules = [
        body('confirmar', 'La confirmación de password no puede ir vacia').notEmpty(),
        body('confirmar', 'La confirmación no coincide').equals(req.body.password)
    ];

    await Promise.all(rules.map(validation => validation.run(req)))
    const erroresExpress = validationResult(req);

    try {
        await Usuarios.create(usuario);

        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confima tu cuenta de Meeti',
            archivo: 'confirmar-cuenta'
        });

        req.flash('exito', 'Hemos enviado un E-mail, confirma tu cuenta');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        const errExpr = erroresExpress.array().map(err => err.msg);

        const listaErrores = [...erroresSequelize, ...errExpr];

        req.flash('error', listaErrores);
        res.redirect('/crear-cuenta');
    }
}

exports.confirmarCuenta = async (req, res) => {
    const usuario = await Usuarios.findOne({
        where: {
            email: req.params.correo
        }
    });

    if (!usuario) {
        req.flash('error', 'No existe una cuenta con ese correo');
        res.redirect('/crear-cuenta');
        return next();
    }

    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'Cuenta activada');
    res.redirect('/iniciar-sesion');
}

exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión'
    });
}

exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    });
}

exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    const { nombre, descripcion, email } = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();

    req.flash('exito', 'Perfil actualizado');
    res.redirect('/administracion');
}

exports.formCambiarPassword = (req, res) => {
    res.render('cambiar-password', {
        nombrePagina: 'Cambiar Password'
    });
}

exports.cambiarPassword = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password actual no es correcto');
        res.redirect('/administracion');
        return next();
    }

    const hash = usuario.hashPassword(req.body.nuevo);

    usuario.password = hash;

    await usuario.save();

    req.logout();
    req.flash('exito', 'Password actualizado, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');
}

exports.formSubirImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-perfil', {
        nombrePagina: 'Subir Imagen de Perfil',
        usuario
    });
}

exports.guardarImagenPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if(req.file && usuario.imagen){
        const imagenAnterior = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`;
        fs.unlink(imagenAnterior, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    req.flash('exito', 'Imagen de perfil actualizada');
    res.redirect('/administracion');
}