/**
 * Created by mc185249 on 1/26/2017.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let clientSchema = new Schema({
    id:Number,
    name:String,
    Account:String
},{collection:"cliente"});
let Cliente = mongoose.model('Cliente',clientSchema);
module.exports = Cliente;