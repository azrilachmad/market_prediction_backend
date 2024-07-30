import { Sequelize, DataTypes } from "sequelize";
import db from "./../config/db.js";

const Cars = db.define('Cars', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }, 
    tanggal_jual: {
        type: DataTypes.DATE,
    },
    lokasi: {
        type: DataTypes.STRING,
    },
    desciption: {
        type: DataTypes.STRING,
    },
    jenismobil: {
        type: DataTypes.STRING,
    },
    transmisi: {
        type: DataTypes.STRING,
    },
    year: {
        type: DataTypes.INTEGER,
    },
    umurmobil: {
        type: DataTypes.INTEGER,
    },
    color: {
        type: DataTypes.STRING,
    },
    nopol: {
        type: DataTypes.STRING,
    },
    pajak: {
        type: DataTypes.DATE,
    },
    stnk: {
        type: DataTypes.DATE,
    },
    grade_all: {
        type: DataTypes.STRING,
        underscored: true,
    },
    gradeinterior: {
        type: DataTypes.STRING,
    },
    gradebody: {
        type: DataTypes.STRING,
    },
    grademesin: {
        type: DataTypes.STRING,
    },
    km: {
        type: DataTypes.INTEGER,
    },
    bottom_price: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.STRING,
    },
    harga_terbentuk: {
        type: DataTypes.INTEGER,
        underscored: true
    },

}, {
    tableName: 'cars',
    timestamps: false,
    schema: 'cars',
    // freezeTableName: true
});

export default Cars;
(async () => {
    await db.sync();
})();
