const model = require('../models/company');

class Company {
  constructor (name, description, address, logo, processes) {
    this.name = name;
    this.description = description
    this.address = address;
    this.logo = logo;
    this.processes = processes;
  }

  addNew() {
    return model.create({
      name: this.name, 
      description: this.description, 
      address: {
        street: this.address.street,
        number: this.address.number,
        district: this.address.district,
        city: this.address.city,
        state: this.address.state,
        country: this.address.country,
      },
      logo: this.logo,
      processes: this.processes,
    })
  }

  update(findKey, findValue, ObjectsToUpdate) {
    return model.find({`${findKey}`: findValue})
  }
}

module.exports = Company;