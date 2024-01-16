const database = require('../database');
const router = require('express-promise-router')();
const logger = require('../utils/logger');
const axios = require('axios');

router.get('/', async (req, res) => {
    try {
        const journeys = {
            "headTexts":["Zeit","Fahrt","Nach","Steig","Abfahrten","Aktuell","Ankunft"],
            "stationName":"Wien Handelskai Bahnhst (U)",
            "stationEvaId":"1292001",
            "boardType":"dep",
            "imgPath":"/hafas-res/img/",
            "iconProductsSubPath":"vs_oebb/",
            "rtInfo":true,
            "journey":[
            {"id":"792721810","ti":"08:46","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:17","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3915671810","ti":"08:46","da":"16.01.2024","pr":"S 1","st":"Wien Floridsdorf Bahnhof","lastStop":"Wien Floridsdorf Bahnhof","ati":"08:49","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"782901810","ti":"08:47","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"08:51","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"38253218113","ti":"08:47","da":"16.01.2024","pr":"Bus 11B","st":"Wien Hillerstra&#223;e (Nr.12)","lastStop":"Wien Hillerstra&#223;e (Nr.12)","ati":"09:00","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3827401814","ti":"08:47","da":"16.01.2024","pr":"Bus 11B","st":"Wien Friedrich-Engels-Platz (Nr.20)","lastStop":"Wien Friedrich-Engels-Platz (Nr.20)","ati":"08:49","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"39022918110","ti":"08:48","da":"16.01.2024","pr":"S 45","st":"Wien H&#252;tteldorf Bahnhof","lastStop":"Wien H&#252;tteldorf Bahnhof","ati":"09:16","tr":"12","trChg":false,"rt":false,"rta":false}   
            ,{"id":"792701810","ti":"08:49","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:20","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3907401810","ti":"08:49","da":"16.01.2024","pr":"REX 1","st":"Wien Floridsdorf Bahnhof","lastStop":"Wien Floridsdorf Bahnhof","ati":"08:52","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"774251812","ti":"08:50","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"08:54","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"38147718112","ti":"08:50","da":"16.01.2024","pr":"Bus 11A","st":"Wien Stadion (Meiereistra&#223;e)","lastStop":"Wien Stadion (Meiereistra&#223;e)","ati":"09:09","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3818571815","ti":"08:51","da":"16.01.2024","pr":"Bus 11A","st":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","lastStop":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","ati":"09:02","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4029411814","ti":"08:51","da":"16.01.2024","pr":"Bus 5A","st":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","lastStop":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","ati":"09:18","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4030181811","ti":"08:51","da":"16.01.2024","pr":"Bus 5A","st":"Wien Griegstra&#223;e","lastStop":"Wien Griegstra&#223;e","ati":"08:57","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"787201810","ti":"08:52","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:22","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3909201810","ti":"08:52","da":"16.01.2024","pr":"REX 2","st":"Laa/Thaya Bahnhof","lastStop":"Laa/Thaya Bahnhof","ati":"10:05","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"762521812","ti":"08:53","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"08:56","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"789191810","ti":"08:55","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:25","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3825811810","ti":"08:55","da":"16.01.2024","pr":"Bus 11B","st":"Wien Hillerstra&#223;e (Nr.12)","lastStop":"Wien Hillerstra&#223;e (Nr.12)","ati":"09:08","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3827401815","ti":"08:55","da":"16.01.2024","pr":"Bus 11B","st":"Wien Friedrich-Engels-Platz (Nr.20)","lastStop":"Wien Friedrich-Engels-Platz (Nr.20)","ati":"08:57","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3905901810","ti":"08:55","da":"16.01.2024","pr":"S 3","st":"Korneuburg Bahnhof","lastStop":"Korneuburg Bahnhof","ati":"09:16","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3915741810","ti":"08:55","da":"16.01.2024","pr":"S 2","st":"M&#246;dling Bahnhof","lastStop":"M&#246;dling Bahnhof","ati":"09:36","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"764541812","ti":"08:56","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"08:59","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"792681810","ti":"08:57","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:28","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"39022918111","ti":"08:58","da":"16.01.2024","pr":"S 45","st":"Wien H&#252;tteldorf Bahnhof","lastStop":"Wien H&#252;tteldorf Bahnhof","ati":"09:26","tr":"12","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3907871812","ti":"08:58","da":"16.01.2024","pr":"S 1","st":"Marchegg Bahnhof","lastStop":"Marchegg Bahnhof","ati":"09:54","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"764501810","ti":"08:59","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"09:02","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3814781810","ti":"08:59","da":"16.01.2024","pr":"Bus 11A","st":"Wien Stadion (Meiereistra&#223;e)","lastStop":"Wien Stadion (Meiereistra&#223;e)","ati":"09:18","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3818571816","ti":"08:59","da":"16.01.2024","pr":"Bus 11A","st":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","lastStop":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","ati":"09:10","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"792671810","ti":"09:00","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:31","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3915051813","ti":"09:00","da":"16.01.2024","pr":"S 1","st":"Wien Meidling Bahnhof","lastStop":"Wien Meidling Bahnhof","ati":"09:22","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"782881810","ti":"09:01","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"09:05","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3909131811","ti":"09:01","da":"16.01.2024","pr":"S 2","st":"Wolkersdorf im Weinviertel Bahnhof","lastStop":"Wolkersdorf im Weinviertel Bahnhof","ati":"09:27","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4029411815","ti":"09:01","da":"16.01.2024","pr":"Bus 5A","st":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","lastStop":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","ati":"09:28","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4030181812","ti":"09:01","da":"16.01.2024","pr":"Bus 5A","st":"Wien Griegstra&#223;e","lastStop":"Wien Griegstra&#223;e","ati":"09:07","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"800451810","ti":"09:03","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:34","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3827401816","ti":"09:03","da":"16.01.2024","pr":"Bus 11B","st":"Wien Friedrich-Engels-Platz (Nr.20)","lastStop":"Wien Friedrich-Engels-Platz (Nr.20)","ati":"09:05","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3915601811","ti":"09:03","da":"16.01.2024","pr":"S 3","st":"Wien Liesing Bahnhof","lastStop":"Wien Liesing Bahnhof","ati":"09:35","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"782871810","ti":"09:04","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"09:08","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3825811811","ti":"09:05","da":"16.01.2024","pr":"Bus 11B","st":"Wien Hillerstra&#223;e (Nr.12)","lastStop":"Wien Hillerstra&#223;e (Nr.12)","ati":"09:18","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"36371810","ti":"09:06","da":"16.01.2024","pr":"REX 3","st":"Znojmo","lastStop":"Znojmo","ati":"10:36","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3908971810","ti":"09:06","da":"16.01.2024","pr":"REX 2","st":"Wien Meidling Bahnhof","lastStop":"Wien Meidling Bahnhof","ati":"09:28","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"782851810","ti":"09:07","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"09:11","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"800451811","ti":"09:07","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:38","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3818571817","ti":"09:07","da":"16.01.2024","pr":"Bus 11A","st":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","lastStop":"Wien Heiligenstadt Bf (Josef-Hindels-Gasse)","ati":"09:18","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"39022918112","ti":"09:08","da":"16.01.2024","pr":"S 45","st":"Wien H&#252;tteldorf Bahnhof","lastStop":"Wien H&#252;tteldorf Bahnhof","ati":"09:36","tr":"12","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3814781811","ti":"09:09","da":"16.01.2024","pr":"Bus 11A","st":"Wien Stadion (Meiereistra&#223;e)","lastStop":"Wien Stadion (Meiereistra&#223;e)","ati":"09:28","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3912041813","ti":"09:09","da":"16.01.2024","pr":"S 7","st":"Flughafen Wien Bahnhof","lastStop":"Flughafen Wien Bahnhof","ati":"09:41","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"762511810","ti":"09:10","da":"16.01.2024","pr":"U6","st":"Wien Floridsdorf Bf (U6)","lastStop":"Wien Floridsdorf Bf (U6)","ati":"09:13","tr":"1","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3915731810","ti":"09:10","da":"16.01.2024","pr":"REX 7","st":"Wien Floridsdorf Bahnhof","lastStop":"Wien Floridsdorf Bahnhof","ati":"09:13","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"800451812","ti":"09:11","da":"16.01.2024","pr":"U6","st":"Wien Siebenhirten (U6)","lastStop":"Wien Siebenhirten (U6)","ati":"09:42","tr":"2","trChg":false,"rt":false,"rta":false}   
            ,{"id":"3827401817","ti":"09:11","da":"16.01.2024","pr":"Bus 11B","st":"Wien Friedrich-Engels-Platz (Nr.20)","lastStop":"Wien Friedrich-Engels-Platz (Nr.20)","ati":"09:13","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4029411816","ti":"09:11","da":"16.01.2024","pr":"Bus 5A","st":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","lastStop":"Wien Nestroyplatz (Schrottgie&#223;ergasse)","ati":"09:38","tr":"","trChg":false,"rt":false,"rta":false}   
            ,{"id":"4030181813","ti":"09:11","da":"16.01.2024","pr":"Bus 5A","st":"Wien Griegstra&#223;e","lastStop":"Wien Griegstra&#223;e","ati":"09:17","tr":"","trChg":false,"rt":false,"rta":false}   
            ],
            "maxJ":52
            }
        res.json(journeys);
    } catch (err) {
        logger.error(err);
        res.status(500).json({ error: 'An error occurred while fetching journeys data' });
    }
});

async function fetchJourney() {
    const url = 'https://fahrplan.oebb.at/bin/stboard.exe/dn?L=vs_scotty.vs_liveticker&evaId=1292001&boardType=dep&time=8:46&productsFilter=1011111111011&additionalTime=0&maxJourneys=50&outputMode=tickerDataOnly&start=yes&selectDate=today';
    try {
        const response = await axios.get(url);
        //TODO databse insert
        return response.data;
    } catch (error) {
        logger.error(error);
        throw error;
    }
}

module.exports = router;
