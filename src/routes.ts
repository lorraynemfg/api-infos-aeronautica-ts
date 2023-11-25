import express from 'express';
import axios from 'axios';
import Airport  from './dto/Airport'
import WeatherData  from './dto/Weather';
import {translateWeather}  from './dto/Weather';
import { apiKey, apiKey1 } from './apiKeys';
import {Request, Response} from 'express'

const routes = express();

routes.get('/info-aeroportos/:aeroporto', async (req: Request, res: Response): Promise<Response> => {
    const airport = req.params.aeroporto;

    try {
        const response = await axios.get(`https://api-redemet.decea.mil.br/aerodromos/?api_key=${apiKey}&pais=${airport}`);
        const array = response.data.data;

        if (array.length < 1) {
            return res.json({mensagem:"aeroporto não encontrado."});
        }

        const airports = array.map(({ nome, cidade, cod }: { nome: string, cidade: string, cod: string }) => new Airport(nome, cidade, cod));

        const holeAnswer = {
            totalDeAeroportosEncontrados: array.length,
            Aeroportos: airports,
        };

        return res.json(holeAnswer);
    } catch (error) {
       return res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
    
});

routes.get('/info-meteorologica/:cod', async (req: Request, res: Response): Promise<Response> => {
    const cod = req.params.cod;

    try {
        const responseMens = await axios.get(`https://api-redemet.decea.mil.br/mensagens/metar/${cod}?api_key=${apiKey}`);
        const responseStatus = await axios.get(`https://api-redemet.decea.mil.br/aerodromos/status/localidades/${cod}?api_key=${apiKey}`)
        const status = responseStatus.data.data[0][4]

        delete responseMens.data.data.data[0].id_localidade
        delete responseMens.data.data.data[0].validade_inicial

        const mensTraduzida: WeatherData = translateWeather(responseMens.data.data.data[0]);
        if (status == 'g') {
            responseMens.data.data.data[0].mensagem = { ...mensTraduzida, status: 'great' };
        }
        if (status == 'y') {
            responseMens.data.data.data[0].mensagem = { ...mensTraduzida, status: 'yellow' };
        }
        if (status == 'r') {
            responseMens.data.data.data[0].mensagem = { ...mensTraduzida, status: 'red' };
        }

        return res.json(responseMens.data.data.data[0]);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao obter informações meteorológicas.' });
    }
});

routes.get(`/pesquisa`,async (req: Request, res: Response): Promise<Response>=>{
    const{state, key_word, data}= req.body
   try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=${state}${' '}${key_word}&from=${data}&sortBy=publishedAt&apiKey=${apiKey1}`);
    const newsData = response.data.articles;

    const dataDescription: string[] = newsData.map((i: { description: string }) => {
        return i.description;
    });
        const dataAuthor: string[] = newsData.map((i: {author: string}) => {
            return i.author
        })
        const dataUrl: string[] = newsData.map((i: {url: string}) => {
            return i.url
        })
        const objet={
            dataAuthor,
            dataDescription,
            url: dataUrl
        }
    return res.json(objet)
   } catch (error) {
    return res.status(500).json({mensagem:"erro interno do servidor"})
   }
 
})

module.exports = routes;
