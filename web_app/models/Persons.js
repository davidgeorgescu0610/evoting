module.exports = (sequelize, DataTypes) => {
    const Person = sequelize.define("persons", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        cnp: {
            type: DataTypes.CHAR(64),
            allowNull: false
        },
        pass: {
            type: DataTypes.CHAR(64),
            allowNull: false
        },
        address: {
            type: DataTypes.CHAR(42),
            allowNull: true
        },
        refresh_token: {
            type: DataTypes.STRING,
            allowNull: true          
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mail: {
            type: DataTypes.STRING,
            allowNull: false
        },
        admin: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: false
    });

    Person.associate = (models) => {
        Person.hasMany(models.candidates, {
          foreignKey: "person_id",
          as: "candidates",
        });
    };

    Person.associate = (models) => {
        Person.hasMany(models.email_tokens, {
            foreignKey: "person_id",
            as: "email_tokens",
        });
    };

    return Person;
}