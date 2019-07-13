class Crud {
  constructor (model, keys) {
    this.model = model;
    this.keys = keys;
  }

  createNew() {
    return this.model.create()
  }  

}