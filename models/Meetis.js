const Sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');
const Usuarios = require('./Usuarios');
const Grupos = require('./Grupos');

const Meetis = db.define('meeti', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El título es requerido'
            }
        }
    },
    slug: Sequelize.STRING,
    invitado: Sequelize.STRING,
    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La descripción es requerida'
            }
        }
    },
    fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La fecha es requerida'
            }
        }
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La hora es requerida'
            }
        }
    },
    direccion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La dirección es requerida'
            }
        }
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'La ciudad es requerida'
            }
        }
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El estado es requerido'
            }
        }
    },
    pais: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El país es requerido'
            }
        }
    },
    ubicacion: {
        type: Sequelize.GEOMETRY('POINT'),
    },
    interesados: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    }
}, {
    hooks: {
        async beforeCreate(meeti) {
            const url = slug(meeti.titulo).toLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`;
        }
    }
});
Meetis.belongsTo(Usuarios);
Meetis.belongsTo(Grupos);

module.exports = Meetis;
