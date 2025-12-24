const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Board = sequelize.define("Board", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
});

module.exports = Board;
