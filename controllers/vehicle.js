import { GoogleGenerativeAI } from "@google/generative-ai";
import Vehicle from "../model/vehicleModel.js";
import { DataTypes, Op, Sequelize } from "sequelize";
import Cars from "../model/vehicleModel.js";
import dotenv from "dotenv";
import CarsType from "../model/vehicleType.js";
import sequelize from "../config/db.js";
import { convDate } from "../helper/index.js";
import fs from 'fs';
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
dotenv.config();

const gemini_api_key = process.env.GEMINI_API_KEY;
const googleAI = new GoogleGenerativeAI(gemini_api_key);
const geminiConfig = {
    temperature: 1,
    topP: 1,
    topK: 1,
    maxOutputTokens: 4096,
};

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    geminiConfig,
});

export const createSinglePredict = async (req, res) => {

    const {
        jenis_kendaraan,
        nama_kendaraan,
        tahun_kendaraan,
        jarak_tempuh_kendaraan,
        transmisi_kendaraan,
        bahan_bakar,
        wilayah_kendaraan,
    } = req.body

    try {
        const vehicleCorrectionPrompt = `Koreksi nama unit ini dengan nama yang benar dan singkat, anda bisa cari di internet. berikan response langsung nama nya tanpa perlu Nama unit yang benar adalah : ${req.body.nama_kendaraan}. tidak boleh ada \n.`;
        const correctionResult = await geminiModel.generateContent(vehicleCorrectionPrompt);
        const correctionResponse = correctionResult.response;


        const marketPredictionPrompt = `Berikan Average Market Price untuk ${jenis_kendaraan} Bekas ${nama_kendaraan}, Tahun kendaraan ${tahun_kendaraan} jarak tempuh kendaraan ${jarak_tempuh_kendaraan} km, transmisi kendaraan ${transmisi_kendaraan}, bahan bakar ${bahan_bakar}, wilayah kendaraan ${wilayah_kendaraan} dan tanggal iklan dibuat paling terbaru dengan format json sebagai berikut:
        {"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi, "link_sumber_analisa: [link1 (https://www.facebook.com/marketplace/bandung/search/?query=xxxxxx), link2 (https://www.facebook.com/marketplace/bandung/search/?query=xxxxx), link3 (https://www.facebook.com/marketplace/bandung/search/?query=xxxxx), link4 (https://www.facebook.com/marketplace/bandung/search/?query=xxxxx))], "tanggal_posting": Tanggal dibuat iklan terbaru}. buat tanpa catatan, tidak boleh ada \n tidak boleh juga ada backslash tidak boleh ada tulisan json, hanya hasil sesuai format`
        const predictionResult = await geminiModel.generateContent(marketPredictionPrompt)
        const predictionResponse = await predictionResult.response
        const responseData = {
            "data": {
                "nama_kendaraan": correctionResponse.text().replace('\n', ''),
                "market_prediction": JSON.parse(predictionResponse.text())
            },
            error: false,
            status_code: 200,
        }
        res.status(200).send(responseData)
    } catch (error) {
        return res.status(400).send({
            message: 'An error occured!'
        });
    }

}

export const createBulkPredict = async (req, res) => {
    const newData = []
    try {
        for (let i = 0; i < req.body.data.length; i++) {
            const vehicleCorrectionPrompt = `Koreksi nama unit ini dengan nama yang benar dan singkat, anda bisa cari di internet. berikan response langsung nama nya tanpa perlu Nama unit yang benar adalah : ${req.body.data[i].desciption}. tidak boleh ada \n ataupun simbol apapun.`;
            const correctionResult = await geminiModel.generateContent(vehicleCorrectionPrompt);
            const vehicleCorrection = correctionResult.response;
            const transmisi = req.body.data[i].transmisi === 'AT' ? 'Automatic' : req.body.data[i].transmisi === 'MT' ? 'Manual' : 'Tidak Diketahui'

            const marketPredictionPrompt = `Berikan Average Market Price untuk mobil Bekas ${vehicleCorrection.text().replace('\n', '')}, jarak tempuh kendaraan ${req.body.data[i].km} km, transmisi kendaraan ${transmisi}, wilayah kendaraan ${req.body.data[i].lokasi}.generate dalam bentuk JSON dengan format sebagai berikut:{"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi, "link_sumber_analisa: [link1, link2, link3, link4]}. bbuat tanpa catatan, tidak boleh ada \n tidak boleh juga ada backslash tidak boleh ada tulisan json, hanya hasil sesuai format`
            const predictionResult = await geminiModel.generateContent(marketPredictionPrompt)
            const predictionResponse = predictionResult.response
            const marketPrediction = JSON.parse(predictionResponse.text())
            // console.log(marketPrediction.harga_terendah)
            // console.log(marketPrediction.harga_tertinggi)
            newData.push({
                id: req.body.data[i].id ? req.body.data[i].id : null,
                tanggal_jual: req.body.data[i].tanggal_jual ? req.body.data[i].tanggal_jual : null,
                lokasi: req.body.data[i].lokasi ? req.body.data[i].lokasi : null,
                desciption: vehicleCorrection.text().replace('\n', ''),
                jenismobil: req.body.data[i].jenismobil ? req.body.data[i].jenismobil : null,
                transmisi: req.body.data[i].transmisi ? req.body.data[i].transmisi : null,
                year: req.body.data[i].year ? req.body.data[i].year : null,
                umurmobil: req.body.data[i].umurmobil ? req.body.data[i].umurmobil : null,
                color: req.body.data[i].color ? req.body.data[i].color : null,
                nopol: req.body.data[i].nopol ? req.body.data[i].nopol : null,
                pajak: req.body.data[i].pajak ? req.body.data[i].pajak : null,
                stnk: req.body.data[i].stnk ? req.body.data[i].stnk : null,
                grade_all: req.body.data[i].grade_all ? req.body.data[i].grade_all : null,
                gradeinterior: req.body.data[i].gradeinterior,
                gradebody: req.body.data[i].gradebody,
                grademesin: req.body.data[i].grademesin,
                km: req.body.data[i].km,
                bottom_price: marketPrediction.harga_terendah !== null ? marketPrediction.harga_terendah : req.body.data[i].bottom_price,
                status: req.body.data[i].status,
                harga_terbentuk: req.body.data[i].harga_terbentuk,
                nama_mobil: vehicleCorrection.text().replace('\n', ''),
                harga_atas: marketPrediction.harga_tertinggi,
                harga_bawah: marketPrediction.harga_terendah,
            })
        }

        const responseData = {
            data: newData,
            error: false,
            message: "OK - The request was successfull",
            meta: {
                page: 1,
                perPage: 100,
                total: newData.length,
                totalPages: Math.ceil(newData.length / 10),
            },
            status: 200,
        }
        res.status(200).send(responseData)
    } catch (error) {
        console.log("response error", error);
    }

}


export const getVehicleList = async (req, res) => {
    const pageAsNumber = parseInt(req.query.page) || 1;
    const limitAsNumber = parseInt(req.query.limit) || 10;
    const order = req.query.order;

    let page = 0;
    if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    let limit = 10;
    if (!Number.isNaN(limitAsNumber) && limitAsNumber > 0) {
        page = limitAsNumber;
    }


    try {
        const vehicles = await Cars.findAndCountAll({ limit: limitAsNumber, offset: page === 1 ? 0 : (pageAsNumber - 1) * limitAsNumber, order: [['updated_at', 'ASC']] })
        res.json({
            data: vehicles.rows,
            error: false,
            message: "OK - The request was successfull",
            meta: {
                page: req.query.page,
                perPage: limit.toString(),
                total: vehicles.count,
                totalPages: Math.ceil(vehicles.count / limit)
            }
            // totalRows: totalRows,
            // totalPage: totalPage
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getChart = async (req, res) => {
    const width = 400; //px
    const height = 400; //px
    const backgroundColour = 'white'; // Uses https://www.w3schools.com/tags/canvas_fillstyle.asp
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });

    const {chartType} = req.query

    const configuration = {
        type: chartType,   // for line chart
        data: {
            labels: [2018, 2019, 2020, 2021],
            datasets: [{
                label: "Sample 1",
                data: [10, 15, 20, 15],
                fill: false,
                borderColor: ['rgb(51, 204, 204)'],
                borderWidth: 1,
                xAxisID: 'xAxis1' //define top or bottom axis ,modifies on scale
            },
            {
                label: "Sample 2",
                data: [10, 30, 20, 10],
                fill: false,
                borderColor: ['rgb(255, 102, 255)'],
                borderWidth: 1,
                xAxisID: 'xAxis1'
            },
            ],
        },
        options: {
            scales: {
                y: {
                    suggestedMin: 0,
                }
            }
        }
    }
    const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
    const base64Image = dataUrl
    var base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    fs.writeFile("out.png", base64Data, 'base64', function (err) {
        if (err) {
            console.log(err);
        }
    });

    try {
        res.json({
            data: dataUrl,
            message: "OK - The request was successfull",
            // totalRows: totalRows,
            // totalPage: totalPage
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const updateVehicleData = async (req, res) => {
    const { vehicles } = req.body;
    try {

        const promise = vehicles.map((vehicle) => {
            const { id, desciption, harga_bawah, harga_atas } = vehicle;
            Vehicle.update({ desciption, harga_bawah, harga_atas, nama_mobil: desciption, updated_at: Date.now() }, { where: { id } });
        })
        await Promise.all(promise)
        res.json({
            error: false,
            message: "OK - The request was successfull",
            status: 200,
        });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const getVehicleType = async (req, res) => {

    try {
        const vehicles = await CarsType.findAndCountAll({
            attributes: ['jenismobil', [Sequelize.fn('COUNT', Sequelize.col('jenismobil')), 'value']],
            group: ['jenismobil'],
            order: [[Sequelize.col('value'), 'DESC']], // Order by jumlah_mobil DESC
            limit: 10
        })
        res.json({
            data: vehicles.rows,
            error: false,
            message: "OK - The request was successfull",
            meta: {
                total: vehicles.count,
            }
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getCarCount = async (req, res) => {

    try {
        const vehicles = await CarsType.count({})
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getCarTypeCount = async (req, res) => {

    try {
        const vehicles = await Cars.count({
            distinct: true,
            col: 'jenismobil'
        })
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getOmsetPenjualan = async (req, res) => {

    try {
        const vehicles = await Cars.sum('harga_terbentuk')
        res.json({
            data: vehicles,
            error: false,
            message: "OK - The request was successfull",
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getVehicleRank = async (req, res) => {

    try {
        const vehicles = `WITH RankedSales AS (SELECT
                jenismobil,
                TO_CHAR(DATE_TRUNC('month', tanggal_jual), 'Month') AS bulan,
                DATE_TRUNC('month', tanggal_jual) AS tanggal,
                SUM(harga_terbentuk) AS sum_harga_terbentuk,
                ROW_NUMBER() OVER (PARTITION BY TO_CHAR(DATE_TRUNC('month', tanggal_jual), 'Month') ORDER BY SUM(harga_terbentuk) DESC) AS peringkat
            FROM cars.cars
            GROUP BY jenismobil, DATE_TRUNC('month', tanggal_jual)
        )
        SELECT *
        FROM RankedSales
        WHERE peringkat <= 5
        ORDER BY TO_DATE(bulan, 'Month YYYY')`

        const result = await sequelize.query(vehicles)
        res.json({
            data: result[0].map((data) => {
                return {
                    mobil: data.jenismobil,
                    bulan: convDate(data.tanggal, 'MMMM'),
                    tanggal: convDate(data.tanggal, 'DD-MM-YYYY'),
                    harga: data.sum_harga_terbentuk * 1,
                    peringkat: data.peringkat * 1
                }
            }),
            error: false,
            message: "OK - The request was successfull",
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}


export const getVehicleTypeList = async (req, res) => {
    try {
        const vehicles = `select distinct jenismobil from cars.cars`

        const result = await sequelize.query(vehicles)
        res.json({
            data: result[0].map((ctx) => {
                return {
                    id: ctx.jenismobil,
                    name: ctx.jenismobil
                }
            }),
            error: false,
            message: "OK - The request was successfull",
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getPriceComparison = async (req, res) => {
    const jenisMobil = req.query.jenisMobil

    try {
        const vehicles = `SELECT * FROM (
    SELECT jenisMobil, 
           TO_CHAR(DATE_TRUNC('month', tanggal_jual), 'Month') AS bulan, 
           DATE_TRUNC('month', tanggal_jual) AS tanggal,
           ROUND(AVG(harga_atas)) AS avg_top_price, 
           ROUND(AVG(harga_bawah)) AS avg_bottom_price, 
           ROUND(AVG(harga_terbentuk)) AS avg_actual_sold_price
    FROM cars.cars where jenismobil like '${jenisMobil}%'
    GROUP BY jenisMobil, DATE_TRUNC('month', tanggal_jual)
) AS subquery
ORDER BY jenisMobil, tanggal;`

        const result = await sequelize.query(vehicles)
        res.json({
            data: result[0],
            error: false,
            message: "OK - The request was successfull",
            status: 200,
        });


    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Internal Server Error" })
    }
}
