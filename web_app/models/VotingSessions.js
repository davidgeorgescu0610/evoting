module.exports = (sequelize, DataTypes) => {
    const VotingSession = sequelize.define("voting_sessions", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: true
        },
        date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        terminated: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    VotingSession.associate = (models) => {
        VotingSession.hasMany(models.candidates, {
          foreignKey: "voting_session_id",
          as: "candidates",
        });
      };

    return VotingSession;
}