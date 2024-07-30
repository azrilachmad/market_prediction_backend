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
        console.log(correctionResponse.text());
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
        console.log("response error", error);
    }

}

export const createBulkPredict = async (req, res) => {
    try {
        const newData = []
        for (let i = 0; i < req.body.data.length; i++) {
            const vehicleCorrectionPrompt = `Koreksi nama unit ini dengan nama yang benar dan singkat, anda bisa cari di internet. berikan response langsung nama nya tanpa perlu Nama unit yang benar adalah : ${req.body.data[i].nama_kendaraan}. tidak boleh ada \n.`;
            const correctionResult = await geminiModel.generateContent(vehicleCorrectionPrompt);
            const vehicleCorrection = correctionResult.response;

            const marketPredictionPrompt = `Berikan Average Market Price untuk mobil Bekas ${req.body.data[i].nama_kendaraan}, jarak tempuh kendaraan ${req.body.data[i].jarak_tempuh_kendaraan} km, transmisi kendaraan ${req.body.data[i].transmisi_kendaraan}, bahan bakar ${req.body.data[i].bahan_bakar}, wilayah kendaraan ${req.body.data[i].wilayah_kendaraan} dengan format json sebagai berikut:{"harga_terendah": Harga Terendah, "harga_tertinggi": Harga Tertinggi, "link_sumber_analisa: [link1, link2, link3, link4]}. uat tanpa catatan, tidak boleh ada \n tidak boleh juga ada backslash tidak boleh ada tulisan json, hanya hasil sesuai format`
            const predictionResult = await geminiModel.generateContent(marketPredictionPrompt)
            const predictionResponse = await predictionResult.response
            const marketPrediction = JSON.parse(predictionResponse.text())
            newData.push({
                // ...req.body,
                id: 1,
                tanggal_jual: "1/4/2023",
                wilayah_kendaraan: "PEKANBARU",
                "nama_kendaraan": vehicleCorrection.text().replace('\n', ''),
                tahun_kendaraan: '2015',
                warna_kendaraan: 'PUTIH',
                nomor_kendaraan: 'BXXXXTFR',
                pajak_kendaraan: null,
                stnk: null,
                grade_all: 'D',
                grade_interior: 'D',
                grade_body: 'D',
                grade_mesin: 'D',
                jarak_tempuh_kendaraan: '150595',
                "harga_tertinggi": marketPrediction.harga_tertinggi,
                "harga_terendah": marketPrediction.harga_terendah,
                status: 'SOLD',
                harga_terbentuk: '64000000',
                transmisi_kendaraan: "Manual",
                bahan_bakar: "Bensin",
            })
        }

        const responseData = {
            data: newData,
            error: false,
            status_code: 200,
        }
        res.status(200).send(responseData)
    } catch (error) {
        console.log("response error", error);
    }

}


export const getVehicleList = async (req, res) => {
    const pageAsNumber = parseInt(req.query.page);
    const limitAsNumber = parseInt(req.query.limit);
    const order = req.query.order;

    let page = 0;
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
        page = pageAsNumber;
    }

    let limit = 10;
    if(!Number.isNaN(limitAsNumber) && limitAsNumber > 0) {
        page = limitAsNumber;
    }

    try {
        const vehicles = await Cars.findAndCountAll({limit: limit, offset: pageAsNumber * limitAsNumber})
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
        res.status(500).json({error: "Internal Server Error"})
    }

}