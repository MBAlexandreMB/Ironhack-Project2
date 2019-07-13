const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema ({
    user: {
        username: {type: String, require: true, unique: true},
        password: {type: String, require: true, unique: true}
    },
    personal: {
        name: {type: String, require: true},
        lasName: {type: String, require: true},
        dateOf: {type: Date, require: true},
        maritalStatus: {type: String, enum: ['single', 'married', 'divorced'], require: true},
        cpf: {type: String, require: true},
        nationality: {type: String, require: true},
        email: {type: String, require: true},
        phone: {type: String, require: true},
        telephone: {type: String, require: true},
        socialMedia:{
            linkedin: {type: String},
            facebook: {type: String},
            sitePortifolio: {type: String}
        }
        
    },

    adress: {
        street: {type: String, require: true},
        number: {type: String, require: true},
        district: {type: String, require: true},
        city: {type: String, require: true},
        state: {type: String, require: true},
        country: {type: String, require: true},
        cep: {type: String, require: true}
    },

    skills: {
        professionalResume: {type: String, require: true},
        education: {
            degree: {type: String, require: true, },
            institution: {type: String, require: true},
            fieldOfStudy: {type: String, require: true},
            period: {
                startDate: {type: Date, require: true},
                endDate:{type: Date, require: true},
            }    
        }

    },

    languages: {
        idiom: {type: String, require: true},
        level: {type: String, require: true, eum: ['basic', 'middle', 'advanced']}
    },

    experiences: {
        companyName:{type: String, require: true},
        occupation: {type: String, require: true},
        period: {
            startDate: {type: Date, require: true},
            endDate: {type: Date, require: true},
        },
        description: {type: String, require: true}
    },

    questions: {
        question: {type: String, require: true},
        answer: {type: String, require: true},
        statusAnswer: {type: Boolean}
    }
})

const User = mongoose.model("User", UserSchema);
module.exports = User;