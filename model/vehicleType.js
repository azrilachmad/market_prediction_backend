import { Sequelize, DataTypes } from "sequelize";
import db from "../config/db.js";

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

export default CarsType;
(async () => {
    await db.sync();
})();
