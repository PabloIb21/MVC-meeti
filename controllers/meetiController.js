const Grupos = require('../models/Grupos');
const Meetis = require('../models/Meetis');

const uuid = require('uuid').v4;

exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where: { usuarioId: req.user.id } });

    res.render('nuevo-meeti', {
        nombrePagina: 'Crear nuevo Meeti',
        grupos
    });
}

exports.crearMeeti = async (req, res) => {
    const meeti = req.body;

    meeti.usuarioId = req.user.id;

    const point = { type: 'Point', coordinates: [parseFloat(req.body.lat), parseFloat(req.body.lng)] };
    meeti.ubicacion = point;

    if(req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();

    try {
        await Meetis.create(meeti);
        req.flash('exito', 'Meeti creado con éxito');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        req.flash('error', 'Hubo un error al crear el meeti, intenta de nuevo');
        res.redirect('/nuevo-meeti');
    }
}

exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push( Grupos.findAll({ where: { usuarioId: req.user.id } }) );
    consultas.push( Meetis.findByPk(req.params.id) );

    const [grupos, meeti] = await Promise.all(consultas);

    if(!grupos || !meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('editar-meeti', {
        nombrePagina: `Editar Meeti: ${meeti.titulo}`,
        grupos,
        meeti
    });
}

exports.editarMeeti = async (req, res) => {
    const meeti = await Meetis.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = req.body;

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;
    meeti.direccion = direccion;
    meeti.ciudad = ciudad;
    meeti.estado = estado;
    meeti.pais = pais;

    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)] };
    meeti.ubicacion = point;

    await meeti.save();
    req.flash('exito', 'Meeti editado con éxito');
    res.redirect('/administracion');
}

exports.formEliminarMeeti = async (req, res, next) => {
    const meeti = await Meetis.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });

    if(!meeti) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-meeti', {
        nombrePagina: `Eliminar Meeti: ${meeti.titulo}`,
        meeti
    });
}

exports.eliminarMeeti = async (req, res, next) => {
    await Meetis.destroy({ where: { id: req.params.id } });
    
    req.flash('exito', 'Meeti eliminado con éxito');
    res.redirect('/administracion');
}
