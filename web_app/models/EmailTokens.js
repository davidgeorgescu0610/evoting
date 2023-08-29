const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const EmailTokens = sequelize.define("email_tokens", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        person_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE(1),
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE(1),
            allowNull: false
        }
    }, {
        timestamps: false
    });

    EmailTokens.associate = (models) => {
        EmailTokens.belongsTo(models.persons, {
          foreignKey: "person_id",
          as: "person",
        });
      };

    return EmailTokens;
}