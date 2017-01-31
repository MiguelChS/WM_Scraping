/**
 * Created by mc185249 on 1/23/2017.
 */
"use strict";
let request = require('request');
let moment = require('moment');
let xlsx = require('xlsx');
let trim = require('trim');
require("bufferjs");
let mongoose = require("mongoose");
let Cliente = require('./Schema/Cliente');
let Comentario = require('./Schema/Comentario');
let RedSocial = require('./Schema/RedSocial');
let Nombre = require('./Schema/nombre');
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_WM)
    .catch((err)=>{
        console.log('error mongodb connect');
    });

function searchClient(client,grup) {
    for(let i = 0;i < grup.length;i++){
        if(trim(client) == trim(grup[i].name)){
            return grup[i].id;
        }
    }
}

function verificarFecha(date,lastDate) {
    let evaluateDate = moment(date).format("x");
    let compareLastDate = moment(lastDate).format("x");
    return evaluateDate >= compareLastDate;
}

function verificarIdMessage(idMessage,arrayIdMessage) {
    if(arrayIdMessage.indexOf(idMessage) != -1){
        console.log("coincidencia-->",idMessage);
        return true;
    }
    return false;
}

function LimpiarNombre(nombre) {
    nombre = nombre.replace(new RegExp("[á]",'g'),"a");
    nombre = nombre.replace(new RegExp("[é]",'g'),"3");
    nombre = nombre.replace(new RegExp("[í]",'g'),"i");
    nombre = nombre.replace(new RegExp("[ó]",'g'),"o");
    nombre = nombre.replace(new RegExp("[ú]",'g'),"u");
    return nombre;
}

function searchGenero(nombre,ArrayGeneros) {
    for(let i = 0; i < ArrayGeneros.length;i++){
        let regex = new RegExp(`\\s${ArrayGeneros[i].nombre.toUpperCase()}\\s`);
        if(regex.test(` ${nombre.toUpperCase()} `)){
            return ArrayGeneros[i].genero;
        }
    }
    return null;
}

function readExcel(buffer,idRedSocial,groupClient,lastDateIdMessage,arrayNombre) {
    console.log(`redSocial ${idRedSocial} --> `,lastDateIdMessage);
    let workbook = xlsx.read(buffer,{type:"buffer"});
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let arrayLetra = ['!','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    let letraInicioColumn = 1;
    let filaInicio = 7;
    let totalFila = worksheet["!range"].e.r;
    let totalColumn = worksheet["!range"].e.c;
    let collectionComentario=[];
    for(let fila = filaInicio; fila <= totalFila;fila++){
        var auxArray = [];
        for(let column = letraInicioColumn; column <= totalColumn ; column++){
            let position = `${arrayLetra[column]}${fila}`;
            if(worksheet.hasOwnProperty(position)){
                if(worksheet[position].v == ''){
                    auxArray.push(null);
                    continue;
                }
                auxArray.push(worksheet[position].v);
            }else{
                auxArray.push(null);
            }
        }
        if(auxArray[10] == null) continue;
        if(lastDateIdMessage && !verificarFecha(auxArray[0],lastDateIdMessage.date)) continue;
        if(lastDateIdMessage && verificarIdMessage(auxArray[7],lastDateIdMessage.idMessage)) continue;
        collectionComentario.push(Comentario({
            date:moment(auxArray[0]).toDate(),//1
            redSocial:idRedSocial,//2
            message:auxArray[2],//3
            Author:auxArray[3],//4
            fullName:auxArray[5],
            generoInferido: searchGenero(LimpiarNombre(auxArray[5]),arrayNombre),
            country:auxArray[4],//5
            idMessage:auxArray[7],//8
            idResponse:auxArray[8],//9
            idCliente:searchClient(auxArray[10],groupClient),
            categories:auxArray[11],//12
            routes:auxArray[12]//13
        }));
    }
    console.log(`total de filas Descargadas ${totalFila}      \n      redSocial ${idRedSocial} --> : `,collectionComentario.length);
    return collectionComentario;
}

function downloadExcel(request,redSocial,lastDate) {
    return new Promise((resolve,reject)=>{
        let start;
        if(lastDate){
            start = parseInt(moment(moment(lastDate.date)).format('x'),10);
        }else{
            start = parseInt(moment(moment().format("YYYY-MM-DD")).format('x'),10);
        }
        let end = parseInt(moment(moment().add(1,'day').format("YYYY-MM-DD")).format('x'),10);
        let excelParameter = {
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
        request.put({
            uri:'https://bi.wholemeaning.com/api/v1/export/coments/273',
            headers:{'content-type':'application/json'},
            body: JSON.stringify(excelParameter)
        },(err)=>{
            if (err) {
                reject(err);
            }
            var buffers = [];
            let download = request.get('https://bi.wholemeaning.com/api/v1/export/coments');
            download.on("data",(e)=>{
                buffers.push(e);
            });
            download.on("end",()=>{
                resolve(Buffer.concat(buffers));
            });
        })
    });
}

function log() {
    return new Promise((resolve,reject)=>{
        let credentials = {
            "j_username": process.env.WM_USUARIO,
            "j_password": process.env.WM_PASS
        };
        var req = request.defaults({jar: true});
        req.post({
            uri: 'https://bi.wholemeaning.com/j_spring_security_check?ajax=false',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: require('querystring').stringify(credentials)
        }, (err) => {
            if (err) {
                reject(err);
            }
            resolve(req);
        });
    });
}

function searchLastDateIdMessage(redSocial) {
    return new Promise((resolve,reject)=>{
        Comentario.find({"redSocial":redSocial}).sort({"date":-1}).limit(1)
            .then((r)=>{
                if(r.length != 0){
                    Comentario.find({"date":r[0].date,"redSocial":redSocial})
                        .then((r2)=>{
                            let result = {
                                date:r2[0].date,
                                idMessage: r2.map((valor)=>{ return valor.idMessage})
                            };
                            resolve(result);
                        })
                        .catch((err2)=>{
                            reject(err2)
                        });
                }else{
                    resolve(null);
                }
            })
            .catch((err)=>{
                reject(err);
            })
    })
}

function startProcess() {
    return new Promise((resolve,reject)=>{
        let promiseArray = [];
        promiseArray.push(log());
        promiseArray.push(Cliente.find());
        promiseArray.push(searchLastDateIdMessage(1));
        promiseArray.push(searchLastDateIdMessage(2));
        promiseArray.push(Nombre.find());
        Promise.all(promiseArray)
            .then((result)=>{
                let request = result[0];
                let groupClient = result[1];
                let lastDateTwitter = result[2];
                let lastDateFacebook = result[3];
                let arrayNombre = result[4];
                let resultComment = [];
                downloadExcel(request,"1",lastDateTwitter)
                    .then((bufferTwitter)=>{
                        resultComment = resultComment.concat(readExcel(bufferTwitter,1,groupClient,lastDateTwitter,arrayNombre));

                        downloadExcel(request,"2",lastDateFacebook)
                            .then((bufferFacebook)=>{
                                resultComment = resultComment.concat(readExcel(bufferFacebook,2,groupClient,lastDateFacebook,arrayNombre));

                                if(resultComment.length != 0){
                                    Comentario.collection.insert(resultComment,(err)=>{
                                        if(err){
                                            reject(err);
                                        }else{
                                            console.log(`total doc insert --> ${resultComment.length}`);
                                            resolve();
                                        }
                                    })
                                }else{
                                    console.log(`total doc insert --> ${resultComment.length}`);
                                    resolve();
                                }

                            })
                            .catch((err)=>{
                                reject(err);
                            })

                    })
                    .catch((err)=>{
                        reject(err);
                    })
            })
            .catch((err)=>{
                reject(err);
            });
    });
}

function start(){
    console.log("Iniciando Proceso");
    startProcess()
        .then(()=>{
            setTimeout(()=>{
                start();
            },600000);
        })
        .catch((err)=>{
            console.log(err);
            setTimeout(()=>{
                start();
            },600000);
        });
}

start();

