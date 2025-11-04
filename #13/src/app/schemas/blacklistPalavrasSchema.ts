import { model, Schema } from "mongoose";

const blacklistPalavrasSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    palavras: {
        type: [String],
        required: true,
        default: []
    }
}) 

export default model('blacklistPalavras', blacklistPalavrasSchema);