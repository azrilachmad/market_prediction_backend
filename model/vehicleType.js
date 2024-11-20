const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/db.js");

const CarsType = db.define('Cars', {
    jenismobil: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'cars',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    schema: 'cars',
    // freezeTableName: true
});

module.export = CarsType;
(async () => {
    await db.sync();
})();
