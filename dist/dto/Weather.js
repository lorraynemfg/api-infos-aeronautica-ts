"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateWeather = void 0;
function translateWeather(metarObj) {
    const { mens } = metarObj;
    const pressaoAtmosfericaRegex = /Q(\d{4})/;
    const direcaoVentoRegex = /(\d{3})\d{2}KT/;
    const temperaturaRegex = /(\d{2})\/(\d{2})/;
    const nuvensRegex = /(?:FEW|SCT|BKN|OVC|CAVOK)/;
    const visibilidadeRegex = /(\d{4})/;
    function translateWindDirection(degrees) {
        const cardinalDirections = ['Norte', 'Nordeste', 'Leste', 'Sudeste', 'Sul', 'Sudoeste', 'Oeste', 'Noroeste'];
        const index = Math.round(degrees / 45) % 8;
        return cardinalDirections[index];
    }
    function translateCloudConditions(cloudConditions) {
        switch (cloudConditions) {
            case 'FEW':
                return 'Poucas nuvens';
            case 'SCT':
                return 'Nuvens dispersas';
            case 'BKN':
                return 'Nuvens quebradas';
            case 'OVC':
                return 'Nublado';
            case 'CAVOK':
                return 'Condições meteorológicas no aeroporto estão boas, sem obstruções para a visibilidade (visibilidade igual ou superior a 10 km) e sem limitações significativas na cobertura de nuvens.';
            default:
                return 'Condições de nuvens não reconhecidas';
        }
    }
    function translateVisibility(visibility) {
        const visibilityInMeters = parseInt(visibility);
        if (visibilityInMeters >= 5000) {
            return `${visibility} metros: Excelente`;
        }
        else if (visibilityInMeters >= 1500) {
            return `${visibility} metros: Muito Boa`;
        }
        else if (visibilityInMeters >= 500) {
            return `${visibility} metros: Boa`;
        }
        else if (visibilityInMeters >= 200) {
            return `${visibility} metros: Moderada`;
        }
        else if (visibilityInMeters >= 50) {
            return `${visibility} metros: Ruim`;
        }
        else if (visibilityInMeters >= 10) {
            return `${visibility} metros: Muito Ruim`;
        }
        else {
            return `${visibility} metros: Péssima`;
        }
    }
    const pressureMatches = mens.match(pressaoAtmosfericaRegex);
    const windDirectionMatches = mens.match(direcaoVentoRegex);
    const temperatureMatches = mens.match(temperaturaRegex);
    const cloudConditionsMatches = mens.match(nuvensRegex);
    const visibilityMatches = mens.match(visibilidadeRegex);
    const pressureAtmospheric = pressureMatches ? `${pressureMatches[1]} hPa` : 'Pressão não encontrada';
    const windDirection = windDirectionMatches ? `${translateWindDirection(parseInt(windDirectionMatches[1]))}` : 'Direção do vento não encontrada';
    const temperature = temperatureMatches ? `${temperatureMatches[1]}°C / ${temperatureMatches[2]}°C` : 'Temperatura não encontrada';
    const cloudConditions = cloudConditionsMatches ? `${translateCloudConditions(cloudConditionsMatches[0])}` : null;
    const visibility = visibilityMatches ? translateVisibility(visibilityMatches[1]) : null;
    const windDirectionString = windDirection;
    return {
        pressaoAtmosferica: pressureAtmospheric,
        temperatura: temperature,
        nuvens: cloudConditions,
        visibilidade: visibility,
        direcaoDoVento: windDirectionString
    };
}
exports.translateWeather = translateWeather;
