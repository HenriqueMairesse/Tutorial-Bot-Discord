import { model, Schema } from "mongoose";

const sorteioSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    messageID: {
        type: String,
        required: true,
        default: null
    },
    terminou: {
        type: Boolean,
        required: true,
        default: false
    },
    participantes: {
        type: [String],
        required: true,
        default: []
    },
    dataTermino: {
        type: Date,
        required: true
    },
    ganhadores: {
        type: Number,
        required: true,
    },
    premio: {
        type: String,
        required: true
    }
}) 

export default model('Sorteio', sorteioSchema);