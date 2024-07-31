import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import Vehicle from "../model/vehicleModel.js";
import { Op } from "sequelize";
import Cars from "../model/vehicleModel.js";
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


        const marketPredictionPrompt = `Berikan Average Market Price untuk ${jenis_kendaraan} Bekas ${nama_kendaraan}, Tahun kendaraan ${tahun_kendaraan} jarak tempuh kendaraan ${jarak_tempuh_kendaraan} km, transmisi kendaraan ${transmisi_kendaraan}, bahan bakar ${bahan_bakar}, wilayah kendaraan ${wilayah_kendaraan} dengan format json sebagai berikut:
        {"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi, "link_sumber_analisa: [link1, link2, link3, link4]}. uat tanpa catatan, tidak boleh ada \n tidak boleh juga ada backslash tidak boleh ada tulisan json, hanya hasil sesuai format`
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
        const vehicles = await Cars.findAndCountAll({ limit: limitAsNumber, offset: page === 1 ? 0 : (pageAsNumber - 1) * limitAsNumber, order: [['updated_at', 'DESC']] })
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

export const updateVehicleData = async (req, res) => {
    const { vehicles } = req.body;
    try {

        const promise = vehicles.map((vehicle) => {
            const { id, desciption, harga_bawah, harga_atas} = vehicle;
            return Vehicle.update({ desciption, harga_bawah, harga_atas, updated_at: Date.now() }, { where: { id } });
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