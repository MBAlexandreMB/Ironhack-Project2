const handleChange = (e) => {
  const div = document.getElementById(e.target.value);
  if (e.target.checked) {
    getSubCategories(e.target.value.split('/')[0])
    .then(result => {
      createCheckboxes(result.data.subcategories, div, e);
    })
    .catch(err => console.log(err));
  } else {
    while(div.childNodes.length > 2) {
      div.removeChild(div.lastChild);
    } 
  }
}  
  
  const createCheckboxes = (categories, div, event) => {
    for (let y = 0; y < categories.length; y += 1) {
      let subCategory = document.createElement('div');
      subCategory.id = categories[y]._id;
      
      let label = document.createElement('label');
      label.for = categories[y].name;
      label.innerHTML = categories[y].name;
      
      let input = document.createElement('input');
      input.name = categories[y].name;
      if (event) {
        input.value = categories[y]._id + '/' + event.target.value;
        subCategory.id = categories[y]._id + '/' + event.target.value;
      } else {
        input.value = categories[y]._id;
        subCategory.id = categories[y]._id;
      }
      input.classList.add('checkbox-category');
      input.type = 'checkbox';
      input.onchange = (e) => handleChange(e);
      
      subCategory.appendChild(input);
      subCategory.appendChild(label);
      div.appendChild(subCategory);
    }
  }
  
  const setListeners = () => {
    const checkboxes = document.querySelectorAll('.checkbox-category');
    for (let x = 0; x < checkboxes.length; x += 1) {
      checkboxes[x].onchange = (e) => handleChange(e);     
    }
  }
  
  
  const base = '/company/processes/new';
  
  const getSubCategories = (id) => {
    return axios.get(`${base}/getSubByIdCategory/${id}`);
  }
  
  const getInitialCategories = () => {
    return axios.get(`${base}/getSubCategory/hierarchy`);
  }
  
  getInitialCategories()
  .then(result => {
    createCheckboxes(result.data, document.getElementById('checkbox-container'));
  }).catch(err => console.log(err));

  setListeners();
  