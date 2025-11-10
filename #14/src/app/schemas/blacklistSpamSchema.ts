import { model, Schema } from "mongoose";

const blacklistSpamSchema = new Schema({
    guildID: {
        type: String,
        required: true,
    },
    flood: {
        type: Boolean,
        required: true,
        default: false
    },
    links: {
        type: Boolean,
        required: true,
        default: false
    },
    caps: {
        type: Boolean,
        required: true,
        default: false
    },
    mentions: {
        type: Boolean,
        required: true,
        default: false
    }
}) 

export default model('blacklistSpam', blacklistSpamSchema);