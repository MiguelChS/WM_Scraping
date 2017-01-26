/**
 * Created by mc185249 on 1/23/2017.
 */
"use strict";
let request = require('request');
let moment = require('moment');
var xlsx = require('xlsx');
require("bufferjs");


function DescargarExcel(redSocial) {
    let bancos = [
        {name:"135",id:"BEstado"},
        {name:"137",id:"BSantander"},
        {name:"133",id:"BCI"},
        {name:"134",id:"BChile"},
        {name:"136",id:"BFalabella"}
    ];
    let start = parseInt(moment(moment().format("YYYY-MM-DD")).format('x'),10);
    let end = parseInt(moment(moment().add(1,'day').format("YYYY-MM-DD")).format('x'),10);
    let credentials = {
        "j_username": process.env.WM_USUARIO,
        "j_password": process.env.WM_PASS
    };

    var req = request.defaults({jar: true});
    //logueo
    req.post({
        uri: 'https://bi.wholemeaning.com/j_spring_security_check?ajax=false',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(credentials)
    }, (err, res, body) => {
        if (err) {
            console.log(err);
            return;
        }
        //mandado peticion de armado de excel
        let excelParametros = {
            catdes:false,
            execution:620,
            filters:[{
                dataset:273,
                date_type:5,
                end:end,
                execution:620,
                id:1,
                not:false,
                original_not:false,
                showtext:"",
                start:start,
                type:"social-date"
            },{
                dataset:273,
                execution:620,
                id:2,
                not:false,
                original_not:false,
                showtext:"Emisor",
                type:"social-sent",
                values:["0"]
            },{
                dataset:273,
                execution:620,
                id:3,
                not:false,
                original_not:false,
                showtext:"Grupos de Cuentas",
                type:"social-account-group",
                values:["133;wm;136;wm;137;wm;135;wm;134"]
            },{
                dataset:273,
                execution:620,
                type:"social-network",
                values:[redSocial] // 1 = twitter; 2 = facebook
            }],
            model:304,
            offset:180,
            order:"msg_date",
            query:"",
            random:false,
            sze:"5000",
            xml:false
        };

        req.put({
            uri:'https://bi.wholemeaning.com/api/v1/export/coments/273',
            headers:{'content-type':'application/json'},
            body: JSON.stringify(excelParametros)
        },(err,res,body)=>{
            if (err) {
                console.log(err);
                return;
            }
            //descargando el Excel
            var bufferes = [];
            let download = req.get('https://bi.wholemeaning.com/api/v1/export/coments');
            download.on("data",(e)=>{
                bufferes.push(e);
            });
            download.on("end",()=>{
                LeerExcel(Buffer.concat(bufferes));
            });
        })
    })
}


function LeerExcel(buffer) {
    var workbook = xlsx.read(buffer,{type:"buffer"});
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let arrayLetra = ['!','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    let letraInicioColumn = 1;
    let filaInicio = 6;
    let totalFila = worksheet["!range"].e.r;
    let totalColumn = worksheet["!range"].e.c;
    let Header = [];
    for(let fila = filaInicio; fila <= totalFila;fila++){
        for(let column = letraInicioColumn; column <= totalColumn ; column++){
            let position = `${arrayLetra[column]}${fila}`;
            if(worksheet.hasOwnProperty(position)){
                if(fila == filaInicio){
                    Header.push(worksheet[position].v);
                }else{
                    console.log(worksheet[position].v);
                }
            }
        }
    }
}
DescargarExcel();