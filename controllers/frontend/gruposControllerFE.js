const Grupos = require('../../models/Grupos');
const Meetis = require('../../models/Meetis');
const moment = require('moment');

exports.mostrarGrupo = async (req, res, next) => {
    const consultas = [];

    consultas.push(Grupos.findOne({ where: { id: req.params.id } }));
    consultas.push(Meetis.findAll({
        where: { grupoId: req.params.id },
        order: [
            ['fecha', 'ASC']
        ]
    }));

    const [grupo, meetis] = await Promise.all(consultas);

    res.render('mostrar-grupo', {
        nombrePagina: `Información Grupo: ${grupo.nombre}`,
        grupo,
        meetis,
        moment
    });
}