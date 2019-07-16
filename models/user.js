const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    user: {
        username: {type: String, unique: true},
        password: {type: String, unique: true}
    },
    personal: {
        name: {type: String},
        lasName: {type: String},
        dateOfBirth: {type: Date},
        maritalStatus: {type: String, enum: ['single', 'married', 'divorced']},
        cpf: {type: String},
        nationality: {type: String},
        email: {type: String},
        phone: {type: String},
        telephone: {type: String},
        socialMedia:{
            linkedin: {type: String},
            facebook: {type: String},
            sitePortifolio: {type: String}
        }
        
    },

    adress: {
        street: {type: String},
        number: {type: String},
        district: {type: String},
        city: {type: String},
        state: {type: String},
        country: {type: String},
        cep: {type: String}
    },

    skills: {
        professionalResume: {type: String},
        education: {
            degree: {type: String},
            institution: {type: String},
            fieldOfStudy: {type: String},
            period: {
                startDate: {type: Date},
                endDate:{type: Date},
            }    
        }

    },

    languages: {
        idiom: {type: String},
        level: {type: String, eum: ['basic', 'middle', 'advanced']}
    },

    experiences: {
        companyName:{type: String},
        occupation: {type: String},
        period: {
            startDate: {type: Date},
            endDate: {type: Date},
        },
        description: {type: String}
    },

    questions: {
        question: {type: String},
        answer: {type: String},
        statusAnswer: {type: Boolean}
    },
    processes: [{type: Schema.Types.ObjectId, ref: 'processes'}],
})

const User = mongoose.model("User", UserSchema);
module.exports = User;