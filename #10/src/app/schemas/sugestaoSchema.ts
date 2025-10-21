import { model, Schema } from "mongoose";

const sugestaoSchema = new Schema({
    votouSim: {
        type: [String],
        required: true,
        default: []
    },
    votouNao: {
        type: [String],
        required: true,
        default: []
    },
}) 

export default model('Sugestao', sugestaoSchema);