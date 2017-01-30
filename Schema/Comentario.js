/**
 * Created by mc185249 on 1/26/2017.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let comentarioSchema = new Schema({
    date:Date,//1
    redSocial:Number,//2
    message:String,//3
    Author:String,//4
    country:String,//5
    idMessage:String,//8
    idResponse:String,//9
    idCliente:Number,
    categories:String,//12
    routes:String//13

},{collection:"comentario"});
let Comentario = mongoose.model('comentario',comentarioSchema);
module.exports = Comentario;