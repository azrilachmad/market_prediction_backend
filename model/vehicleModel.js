const { Sequelize, DataTypes } = require("sequelize");
const db = require("./../config/db.js");

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
    nama_mobil: {
        type: DataTypes.STRING,
        allowNull:true,
    },
    harga_atas: {
        type: DataTypes.STRING,
        allowNull:true,
    },
    harga_bawah: {
        type: DataTypes.STRING,
        allowNull:true,
    },



}, {
    tableName: 'cars',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    schema: 'cars',
    // freezeTableName: true
});

module.exports = Cars;
(async () => {
    await db.sync();
})();
