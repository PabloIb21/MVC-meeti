const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const uuid = require('uuid').v4;
const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + '/../public/uploads/grupos/');
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

exports.formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();
    res.render('nuevo-grupo', {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    });
}

exports.crearGrupo = async (req, res) => {
    const grupo = req.body;
    grupo.usuarioId = req.user.id;

    if(req.file){
        grupo.imagen = req.file.filename;
    }

    grupo.id = uuid();

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Grupo creado con exito');
        res.redirect('/administracion');
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);

        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findByPk(req.params.grupoId));
    consultas.push(Categorias.findAll());

    const [ grupo, categorias ] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
}

exports.editarGrupo = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo){
        req.flash('error', 'No tienes permisos para editar este grupo');
        res.redirect('/administracion');
        return;
    }

    const { nombre, descripcion, categoriaId, url } = req.body;

    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.url = url;

    await grupo.save();
    req.flash('exito', 'Grupo editado con exito');
    res.redirect('/administracion');
}

exports.formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);

    res.render('imagen-grupo', {
        nombrePagina: `Editar imagen de grupo: ${grupo.nombre}`,
        grupo
    });
}

exports.editarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo){
        req.flash('error', 'No tienes permisos para editar este grupo');
        res.redirect('/administracion');
        return;
    }

    if(req.file && grupo.imagen){
        const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnterior, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    if(req.file){
        grupo.imagen = req.file.filename;
    }

    await grupo.save();
    req.flash('exito', 'Imagen del grupo editada con exito');
    res.redirect('/administracion');
}

exports.formEliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(!grupo){
        req.flash('error', 'No tienes permisos para eliminar este grupo');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar grupo: ${grupo.nombre}`,
        grupo
    });
}

exports.eliminarGrupo = async (req, res, next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id } });

    if(grupo.imagen){
        const imagenAnterior = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;
        fs.unlink(imagenAnterior, (error) => {
            if(error){
                console.log(error);
            }
            return;
        });
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    req.flash('exito', 'Grupo eliminado con exito');
    res.redirect('/administracion');
}
