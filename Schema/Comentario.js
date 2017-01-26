/**
 * Created by mc185249 on 1/26/2017.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let comentarioSchema = new Schema({
    date:Date,
    redSocial:Number,
    message:String,
    Author:String,
    idMessage:String,
    idResponse:String,
    categories:String,
    routes:String

},{collection:"comentario"});
let Comentario = mongoose.model('comentario',comentarioSchema);
module.exports = Comentario;