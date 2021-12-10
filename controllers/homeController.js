const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');
const Meetis = require('../models/Meetis');
const Usuarios = require('../models/Usuarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.home = async (req, res) => {
    const consultas = [];
    consultas.push(Categorias.findAll({}));
    consultas.push(Meetis.findAll({ 
        attributes: ['slug', 'titulo', 'fecha', 'hora'],
        where: {
            fecha: {
                [Op.gte]: moment(new Date()).format('YYYY-MM-DD')
            }
        },
        limit: 3,
        order: [['fecha', 'ASC']],
        include: [{
            model: Grupos,
            attributes: ['imagen']
        }, {
            model: Usuarios,
            attributes: ['nombre', 'imagen']
        }]
    }));

    const [ categorias, meetis ] = await Promise.all(consultas);

    res.render('home', {
        nombrePagina: 'Inicio',
        categorias,
        meetis,
        moment
    });
}
