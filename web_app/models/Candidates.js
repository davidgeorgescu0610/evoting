module.exports = (sequelize, DataTypes) => {
    const Candidate = sequelize.define("candidates", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        person_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        voting_session_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
      timestamps: false
    });

    Candidate.associate = (models) => {
        Candidate.belongsTo(models.persons, {
          foreignKey: "person_id",
          as: "person",
        });
      };
    
      Candidate.associate = (models) => {
        Candidate.belongsTo(models.voting_sessions, {
          foreignKey: "voting_session_id",
          as: "voting_session",
        });
      };

    return Candidate;
}