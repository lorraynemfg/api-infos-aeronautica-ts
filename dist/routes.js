"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const Airport_1 = __importDefault(require("./dto/Airport"));
const Weather_1 = require("./dto/Weather");
const apiKeys_1 = require("./apiKeys");
const routes = (0, express_1.default)();
routes.get('/info-aeroportos/:aeroporto', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const airport = req.params.aeroporto;
    try {
        const response = yield axios_1.default.get(`https://api-redemet.decea.mil.br/aerodromos/?api_key=${apiKeys_1.apiKey}&pais=${airport}`);
        const array = response.data.data;
        if (array.length < 1) {
            return res.json({ mensagem: "aeroporto não encontrado." });
        }
        const airports = array.map(({ nome, cidade, cod }) => new Airport_1.default(nome, cidade, cod));
        const holeAnswer = {
            totalDeAeroportosEncontrados: array.length,
            Aeroportos: airports,
        };
        return res.json(holeAnswer);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
}));
routes.get('/info-meteorologica/:cod', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cod = req.params.cod;
    try {
        const responseMens = yield axios_1.default.get(`https://api-redemet.decea.mil.br/mensagens/metar/${cod}?api_key=${apiKeys_1.apiKey}`);
        const responseStatus = yield axios_1.default.get(`https://api-redemet.decea.mil.br/aerodromos/status/localidades/${cod}?api_key=${apiKeys_1.apiKey}`);
        const status = responseStatus.data.data[0][4];
        delete responseMens.data.data.data[0].id_localidade;
        delete responseMens.data.data.data[0].validade_inicial;
        const mensTraduzida = (0, Weather_1.translateWeather)(responseMens.data.data.data[0]);
        if (status == 'g') {
            responseMens.data.data.data[0].mensagem = Object.assign(Object.assign({}, mensTraduzida), { status: 'great' });
        }
        if (status == 'y') {
            responseMens.data.data.data[0].mensagem = Object.assign(Object.assign({}, mensTraduzida), { status: 'yellow' });
        }
        if (status == 'r') {
            responseMens.data.data.data[0].mensagem = Object.assign(Object.assign({}, mensTraduzida), { status: 'red' });
        }
        return res.json(responseMens.data.data.data[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
}));
routes.get(`/pesquisa`, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { state, key_word, data } = req.body;
    try {
        const response = yield axios_1.default.get(`https://newsapi.org/v2/everything?q=${state}${' '}${key_word}&from=${data}&sortBy=publishedAt&apiKey=${apiKeys_1.apiKey1}`);
        const newsData = response.data.articles;
        const dataDescription = newsData.map((i) => {
            return i.description;
        });
        const dataAuthor = newsData.map((i) => {
            return i.author;
        });
        const dataUrl = newsData.map((i) => {
            return i.url;
        });
        const objet = {
            dataAuthor,
            dataDescription,
            url: dataUrl
        };
        return res.json(objet);
    }
    catch (error) {
        return res.status(500).json({ mensagem: "erro interno do servidor" });
    }
}));
module.exports = routes;
