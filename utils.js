const pm = require('./prettyMessages.js')
const config = require("./config.json");


exports.getRange = (start, Xoffset=0, Yoffset=2) => {
    /*calcule un intervalle de cellules: ('A3', (3,2) ) renvoir 'A3:E5'*/
    try{
        const letter = start[0]
        exports.charInc(letter, Xoffset)
        const index = start.slice(1)
        console.log(letter, index, start)
        console.log('getRange', start, Xoffset)
        console.log(exports.charInc(letter, Xoffset))
        return start+':'+ exports.charInc(letter, Xoffset) + parseInt(parseInt(index)+Yoffset)
    }catch{
        return "X73:X73"
    }

}

//renvoie le caractère décalée de offset (ascii)
exports.charInc = (letter, offset) => String.fromCharCode(letter.charCodeAt() + parseInt(offset))

//prend une liste de cellules (liste qui n'en contient souvent qu'une)
// et renvoie une liste d'objets contenant la matière, le prof et l'heure
exports.parseCell = (cells, hour) => {
    console.log(cells, hour)
    if(!cells) return -1
    let res = []
    cells.forEach((cell, i) => {
        let raw = cell.split(/\n| /)
        let tmp = []
        for(let i=0; i<raw.length; i++){
            if(raw[i])
            tmp.push(raw[i])
        }
        console.log('parseCell:',tmp)
        res.push({class: tmp[0], teacher: tmp[1], hour: hour})
    });
    console.log('fin_____parseCell:', res, '\n')
    return res
}

exports.formatCell = (hour) => {
    console.log('formatCell in: ', hour)
    let courses = []
    let teachers = []
    let zooms = []
    Object.entries(hour).forEach((item, i) => {
        console.log('formatCell ',item, item[1])
        cell = item[1]
        if(cell === -1 || !cell.class) return ''
        let classType = ''
        if(cell.class.startsWith('C_')){
            classType = 'CM de '
            cell.class = cell.class.slice('C_'.length)
        }else if (cell.class.startsWith('C_')){
            classType = 'TD de '
            cell.class = cell.class.slice('TD_'.length)
        }else if (cell.class.startsWith('TP_')){
            classType = 'TP de '
            cell.class = cell.class.slice('TP_'.length)
        }
        let teacher = ''
        if(cell.teacher) teacher = config.teachers[cell.teacher]? "avec "+config.teachers[cell.teacher]: "avec "+cell.teacher
        const course = classType + cell.class
        const zoom = config.zooms[cell.teacher]? config.zooms[cell.teacher]:''
        const message = course + zoom
        console.log('____formatCell____course:',course, ', teacher:', teacher, ', zoom:', zoom, '\n')
        courses.push(course)
        teachers.push(teacher)
        zooms.push(zoom)
    });
    console.log('------------------formatCell ', courses, teachers, zooms)
    return courses.length === 1? pm.prettyMsg(courses[0], teachers[0], zooms[0], hour[0].hour):pm.prettyMultiMsg(courses, teachers, zooms, hour[0].hour)
}

//renvoie le code de l'heure suivant h
exports.getHourOffset = (h) => {
    if(h>=0 && h<=8) return 0
    if(h>8 && h<=10) return 1
    if(h>10 && h<=14) return 2
    if(h>14 && h<=16) return 3
    if(h>16 && h<=24) return -1 //prochain cours le lendemain
}
