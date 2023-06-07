const mongoose = require( 'mongoose' );

const reqString = {
    type: String,
    required: true
}

const guildsSchema = mongoose.Schema( {
    _id: reqString,
    channelsId: {
        type: Object,
        welcome: {
            type: String,
            default: ''
        },
        goodbye: {
            type: String,
            default: ''
        },
        logs: {
            type: String,
            default: ''
        },
        vc: {
            type: String,
            default: ''
        }
    },
    administrator: {
        type: Array
    },
    autorole: {
        type: Array
    },
    timezone: {
        type: String,
        default: 'America/Los_Angeles'
    },
    color: {
        type: String,
        default: '16777215'
    }
} )

module.exports = mongoose.model( 'guilds', guildsSchema, 'guilds' )