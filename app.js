/**
 * Created by mc185249 on 1/23/2017.
 */
"use strict";
let express = require('express');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');
let app     = express();

app.get("/",(reqApp,resApp)=>{
    resApp.setHeader('content-disposition', 'attachment; filename=Comments.xls');
    resApp.setHeader('content-type', 'application/vnd.ms-excel');

    let credentials = {
        "j_username": process.env.WM_USUARIO,
        "j_password": process.env.WM_PASS
    };

    var req = request.defaults({
        jar: true,                 // Guardar las cookies hacia un jar

    });

    req.post({
        uri: 'https://bi.wholemeaning.com/j_spring_security_check?ajax=false',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: require('querystring').stringify(credentials)
    }, function(err, res, body) {
        if (err) {
            console.log(err);
            return;
        }
        let excel = {
            catdes:false,
            execution:620,
            filters:[{
                dataset:273,
                date_type:1,
                end:0,
                execution:620,
                id:1,
                not:false,
                original_not:false,
                showtext:"Fecha: Últimos Días (1)",
                start:1,
                type:"social-date"
            },{
                dataset:273,
                execution:620,
                type:"social-network",
                values:["1"]
            }],
            model:304,
            offset:180,
            order:"msg_date",
            query:"",
            random:false,
            sze:"50",
            xml:false
        };

        req.put({
            uri:'https://bi.wholemeaning.com/api/v1/export/coments/273',
            headers:{'content-type':'application/json'},
            body: JSON.stringify(excel)
        },function (err,res,body) {
            if (err) {
                console.log(err);
                return;
            }
            req.get('https://bi.wholemeaning.com/api/v1/export/coments').pipe(resApp);
        })
    })
});


app.listen(3002,()=>console.log("escuchando en el puerto 3002"));