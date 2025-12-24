const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Board = require("./board");
const Note = require("./note");
const Category = require("./category");

const BoardMemberships = sequelize.define("BoardMemberships", {
    owns_board: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});

const Invite = sequelize.define("Invites", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

User.hasMany(Invite);
Invite.belongsTo(User);

Board.hasMany(Invite);
Invite.belongsTo(Board);

User.belongsToMany(Board, { through: BoardMemberships });
Board.belongsToMany(User, { through: BoardMemberships });

Board.hasMany(Category);
Category.belongsTo(Board);

Category.hasMany(Note);
Note.belongsTo(Category);

module.exports = {
    User,
    Board,
    Note,
    Category,
    Invite,
};
