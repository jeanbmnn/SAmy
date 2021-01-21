const babel = require("@babel/core");
const fs = require('fs');
const readline = require('readline');
const path = require("path");
const {google} = require('googleapis');
const utils = require('./utils.js')
const pm = require('./prettyMessages.js')




const Discord = require('discord.js');
let config = require("./config.json");



const client = new Discord.Client();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
// Load client secrets from a local file.
const getData = (cell, message, hourRange=0) => {
    fs.readFile('credentials.json', (err, content) => {
        if (err){
            return console.log('Error loading client secret file:', err);
        }
        const range = utils.getRange(cell, hourRange, 2)
        // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), (a) => getCells(a, range, message));
    });
}

/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        }
    );
}
/**
* Get and store new token after prompting for user authorization, and then
* execute the given callback with the authorized OAuth2 client.
* @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
* @param {getEventsCallback} callback The callback for the authorized client.
*/
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
* Prints the names and majors of students in a sample spreadsheet:
* @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
* @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
*/
function getCells(auth, range, message) {
    console.log('requête: ', range)
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1SP1OgLvcM0Mz7TJjGHr7IIXVrNo91D2zekepfWPCE3k',
        range: range,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const values = res.data.values;
        console.log('résultat:', res.data)
        if(values){
            coursePerHour = []
            let tmp = {}

            for(let j=0; j<values[0].length; j++){
                tmp = {data: []}
                for(let i=0; i<values.length; i++){
                    values[i][j] && tmp.data.push(values[i][j])
                    values[i][j] && (tmp.hour = j)
                }
                if(tmp.hour || tmp.hour === 0) coursePerHour.push(tmp)
            }

            console.log('coursePerHour:', coursePerHour)
            let mess = coursePerHour.map((hour) => utils.formatCell(utils.parseCell(hour.data, hour.hour)))
            console.log("messages:", mess.flat())
            for(let i=0; i<mess.flat().length; i++){
                message.channel.send(mess.flat()[i])
            }
        }else{

        }});
    }

    //Toutes les actions à faire quand le bot se connecte
    client.on("ready", function () {
        console.log("Mon BOT est Connecté");
    })

    columns = ['D', 'H', 'L', 'P', 'T']
    hours = ['8h00', '10h20', '13h50', '16h10']

    const remapDate = (d, m) => {
        /* compliqué de faire une simple relation mathématique*/
        console.log('jour ',d, 'mois ', m)
        res = 0
        if(m === 0){//janvier
            if(d<=23) res = 0
            else res = 1
        }else if (m === 1) {// février: 28 jours et lundi est le 1 c'est fort pratique
        res = parseInt(d/7)+1+2 // division par 7 pour avoir le numéro de semaine
        //dans le mois, +1 pour que ce soit de 1 à 4 et non 0 à 3; +2 pcq il y a eu deux semaines avant fevrier

    }else if (m===2) {
        res = parseInt(d/7)+1+2+3-2/3 //-2/3 car il y a un décalage des rangées à cause des vacances
    }
    console.log(res*3+4, res)
    return res*3+4 //+4 car le calendrier commence à la rangée 4
}

const updateConfig = (type, key, value) => {
    console.log(value)
    const content = {...config, [type]: {...config[type], [key]: value}}
    fs.writeFileSync(
        path.join(process.cwd(), "config.json"),
        JSON.stringify(content, null, "\t")
    );
    delete require.cache[require.resolve('./config.json')]   // Deleting loaded module
    config = require("./config.json")
    console.log(config.zooms)
}


const deleteConfig = (type, key) => {
    let data = config[type]
    delete data[key]
    const content = {...config, data}
    fs.writeFileSync(
        path.join(process.cwd(), "config.json"),
        JSON.stringify(content, null, "\t")
    );
    delete require.cache[require.resolve('./config.json')]   // Deleting loaded module
    config = require("./config.json")
    console.log(config.zooms)
}

client.login(config.BOT_TOKEN);
const prefix = "s!";

client.on("message", async function(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    console.log(command, args)
    if(command === 'ping'){
        message.reply(new Date().toDateString())

    }else if(command === 'next' || command === 'n'){
        message.channel.send("Tout de suite maître..")
        .then(msg => {
            msg.delete({ timeout: 5000 })
        })
        const date = new Date()
        let day = date.getDay() - 1
        const number = remapDate(date.getDate(), date.getMonth())
        let hour = utils.getHourOffset(date.getHours())    //chaque case du excel équivaut à 2 heures et on commence à 8heures
        if(hour === -1){ //signifie que le jour doit être incrmenté
            day++
        }
        console.log(hour)
        const cell = utils.charInc(columns[day], hour+1)+number
        getData(cell, message)

    }else if(command === "edt" || command === 'e'){
        if(args[0]){
            if(args[0].length!== 5) {
                message.channel.send("Apprends à écrire stp. T'es pas un SC.")
                return
            }
            message.channel.send("Warten Sie bitte..")
            .then(msg => {
                msg.delete({ timeout: 5000 })
            })
            const date = args[0]
            let d = new Date()
            d.setDate(date[0]+date[1])
            d.setMonth(date[3]+date[4]-1)
            const day = d.getDay()-1
            const number = remapDate(d.getDate(), d.getMonth())
            const cell = columns[day]+number
            const hourRange = '3'
            getData(cell, message, hourRange)
        }
    }else if(command === "zooms" || command === 'z'){
        message.reply("attends frr")
        .then(msg => {
            msg.delete({ timeout: 3000 })
        })
        message.channel.send(pm.prettyZooms())
    }else if(command === "add" || command === 'a'){
        if(args[0] === "teacher"){
            updateConfig('teachers', args[1], args[2]+' '+args[3])
        }else if (args[0] === "zoom") {
            updateConfig('zooms', args[1], args[2])
        }else{
            message.channel.send("commande invalide, affiche l'aide avec s!help")
        }
    }else if(command === 'delete'){
        if(args[0] === "teacher"){
            deleteConfig('teachers', args[1])
        }else if (args[0] === "zoom") {
            deleteConfig('zooms', args[1])
        }else{
            message.channel.send("commande invalide, affiche l'aide avec s!help")
        }
    }else if(command === "help" || command === "h"){
        message.channel.send(pm.help())
    }else if(command === "dodo"){
        let len = 0
        args.forEach((item, i) => {
            len += item.length
        });

        let msg
        msg = await message.channel.send("Il est encore un peu tôt, je me coucherai dans "+len+" minutes.")
        for(let i=0; i<len; i++){
            console.log(i)
            setTimeout(() => msg.edit("Il est encore un peu tôt, je me coucherai dans "+(len-i).toString()+" minutes."), i*60*1000)
        }
        setTimeout(() => process.exit(1), len*60*1000);
        setTimeout(() => message.channel.send("Bonne nuit à tous, faites de beaux rêves!"), (len-0.25)*60*1000)
    }else{
        message.reply("Désolé, ta commande n'existe pas")
        .then(msg => {
            msg.delete({ timeout: 7000 })
        })
    }
});
