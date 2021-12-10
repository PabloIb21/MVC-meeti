const Sequelize = require('sequelize');
const db = require('../config/db');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Grupos = db.define('grupos', {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false
    },
    nombre: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {	
            notEmpty: {
                msg: "El nombre del grupo es requerido"
            }
        }
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "La descripción del grupo es requerida"
            }
        }
    },
    url: Sequelize.TEXT,
    imagen: Sequelize.TEXT
});

Grupos.belongsTo(Categorias);
Grupos.belongsTo(Usuarios);

module.exports = Grupos;