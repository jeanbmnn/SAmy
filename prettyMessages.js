let config = require("./config.json");
const Discord = require('discord.js');

const randomColor = () => Math.floor(Math.random()*16777215).toString(16);

const hours = ['8h00', '10h20', '13h50', '16h10']


exports.prettyMsg = (course, teacher, zoom, hour) => new Discord.MessageEmbed()
.setColor('#'+randomColor())
.setTitle(course)
.setURL(zoom)
.setDescription(teacher + ' à ' + hours[hour])

exports.prettyMultiMsg = (courses, teachers, zooms, hour) => {
    let msg = new Discord.MessageEmbed()
    .setColor('#'+randomColor())
    .setDescription(hours[hour])
    let zoom = ''
    for(let i=0; i<courses.length; i++){
        if(courses[i] !== ''){
            zoom = zooms[i] ? zooms[i]:'pas de zoom'
            msg.addFields(
                { name: courses[i], value: (teachers[i]? teachers[i]:'') + zoom, inline: true}
            )
        }
    }
    return msg
}

exports.help = () => new Discord.MessageEmbed()
    .setColor('#'+randomColor())
    .setTitle('Aide')
    .addFields(
        { name: 'prochain cours:', value: 's!next' },
        { name: "EdT d'une journée", value: 's!edt 30/02', inline: true },
        { name: 'Tous les liens zooms:', value: 's!zooms', inline: true },
        { name: 'Ajouter un alias de professeur', value: 's!add teacher BP Blaise Pascal', inline: true },
        { name: 'Supprimer un alias de professeur', value: 's!delete teacher BP', inline: true },
        { name: 'Ajouter un lien zoom', value: 's!add zoom [initiales prof.] https://univ-...z09', inline: true },
        { name: 'Supprimer un lien zoom', value: 's!delete zoom [initiales prof.]', inline: true },
    )

exports.prettyZooms = () => {
    delete require.cache[require.resolve('./config.json')]   // Deleting loaded module
    config = require("./config.json")
    new Discord.MessageEmbed()
    .setColor('#'+randomColor())
    .setTitle('Zooms recensés')
    .addFields(Object.keys(config.zooms).map((item, i) => new Object({name: config.teachers[item]? config.teachers[item]: item, value:config.zooms[item]})))
}
