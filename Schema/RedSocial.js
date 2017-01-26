/**
 * Created by mc185249 on 1/26/2017.
 */
let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let redSocialSchema = new Schema({
    id:Number,
    name:String
},{collection:"redSocial"});
let RedSocial = mongoose.model('redSocial',redSocialSchema);
module.exports = RedSocial;