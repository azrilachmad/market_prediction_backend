const { Sequelize, DataTypes } = require("sequelize");
const db = require("./../config/db.js");
require('dotenv').config()


const Cars = db.define('Cars', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    agreement_no: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    asset_desc: {
        type: DataTypes.STRING,
        underscored: true,
    },
    ai_nama_mobil: {
        type: DataTypes.STRING,
        underscored: true,
    },
    tahun: {
        type: DataTypes.INTEGER,
    },
    nopol: {
        type: DataTypes.STRING,
    },
    umur: {
        type: DataTypes.INTEGER,
    },
    noka: {
        type: DataTypes.INTEGER,
    },
    nosin: {
        type: DataTypes.INTEGER,
    },
    warna: {
        type: DataTypes.INTEGER,
    },
    lokasi_unit: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    kota: {
        type: DataTypes.INTEGER,
    },
    provinsi: {
        type: DataTypes.INTEGER,
    },
    receive_date: {
        type: DataTypes.DATE,
        underscored: true,
    },
    inspection_date: {
        type: DataTypes.DATE,
        underscored: true,
    },
    approval_date: {
        type: DataTypes.DATE,
        underscored: true,
    },
    qc_date: {
        type: DataTypes.DATE,
        underscored: true,
    },
    grade_interior: {
        type: DataTypes.STRING,
        underscored: true,
    },
    grade_body: {
        type: DataTypes.STRING,
        underscored: true,
    },
    grade_mesin: {
        type: DataTypes.STRING,
        underscored: true,
    },
    overall_grade: {
        type: DataTypes.STRING,
        underscored: true,
    },
    masa_berlaku_pajak: {
        type: DataTypes.DATE,
        underscored: true,
    },
    masa_berlaku_stnk: {
        type: DataTypes.DATE,
        underscored: true,
    },
    final_status: {
        type: DataTypes.STRING,
        underscored: true,
    },
    vehicle_brand: {
        type: DataTypes.STRING,
        underscored: true,
    },
    vehicle_transmission: {
        type: DataTypes.STRING,
        underscored: true,
    },
    vehicle_cc: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    vehicle_type: {
        type: DataTypes.STRING,
        underscored: true,
    },
    vehicle_model: {
        type: DataTypes.STRING,
        underscored: true,
    },
    harga_history: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    harga_atas: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    harga_bawah: {
        type: DataTypes.INTEGER,
        underscored: true,
    },
    hit_count: {
        type: DataTypes.INTEGER,
        underscored: true,
    },



    tanggal_jual: {
        type: DataTypes.DATE,
    },
    lokasi: {
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
        allowNull: true,
    },
    harga_atas: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    harga_bawah: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    hit_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },



}, {
    tableName: 'vehicle_price_check',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: 'created_at',
    // freezeTableName: true
});

module.exports = Cars;
(async () => {
    await db.sync();
})();
