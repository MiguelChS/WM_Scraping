/**
 * Created by mc185249 on 1/30/2017.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let nombreSchema = new Schema({
    nombre:String,
    genero:String,
    tipoName:Number
},{collection:"nombre"});
let nombre = mongoose.model('nombre',nombreSchema);
module.exports = nombre;