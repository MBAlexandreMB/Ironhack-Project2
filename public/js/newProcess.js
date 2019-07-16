const handleChange = (e) => {
  const div = document.getElementById(e.target.value);
  if (e.target.checked) {
    getSubCategories(e.target.value.split('/')[0])
    .then(result => {
      createCheckboxes(result.data.subcategories, div, false, e);
    })
    .catch(err => console.log(err));
  } else {
    while(div.childNodes.length > 1) {
      div.removeChild(div.lastChild);
    } 
  }
  // numOfQuestions();
}  
  
  const createCheckboxes = (categories, div, first, event) => {
// <div id="categories-container"> //todas as categorias
//   <div class="category-group"> 33%
//     <div id="id da subcategoria"> //bloco que se repete 100%
//       <div>input e label</div>
//       <div>dificuldade</div>
//     </div>
//   </div>
// </div>
    let categoryGroup;
    for (let y = 0; y < categories.length; y += 1) {

      const subCategory = document.createElement('div');
      subCategory.id = categories[y]._id;
      subCategory.classList.add('subcategory-container');

      const subCategoryInfo = document.createElement('div');
      const subCategoryDiff = document.createElement('div');
      subCategoryDiff.classList.add('difficulty-radio-container');
      const divInfoDiff = document.createElement('div');
      divInfoDiff.classList.add('divinfo-container');

      //Setting and appending the checkbox and it's label
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

      subCategoryInfo.appendChild(input);
      subCategoryInfo.appendChild(label);
      //----------------------------------------------------

      //Setting and appending the radio buttons for difficulty level and it's labels
      let difficultyLabel = document.createElement('label');
      difficultyLabel.innerHTML = 'Begginer';
      difficultyLabel.for = categories[y]._id;
      difficultyLabel.classList.add('radio-label')
      let difficultyRadio = document.createElement('input');
      difficultyRadio.type = 'radio';
      difficultyRadio.name = categories[y]._id + '<-hier';
      difficultyRadio.value = '1';
      subCategoryDiff.appendChild(difficultyRadio);
      subCategoryDiff.appendChild(difficultyLabel);

      difficultyLabel = document.createElement('label');
      difficultyLabel.innerHTML = 'Medium';
      difficultyLabel.for = categories[y]._id;
      difficultyLabel.classList.add('radio-label')
      difficultyRadio = document.createElement('input');
      difficultyRadio.type = 'radio';
      difficultyRadio.name = categories[y]._id + '<-hier';
      difficultyRadio.value = '2';
      difficultyRadio.checked = true;
      subCategoryDiff.appendChild(difficultyRadio);
      subCategoryDiff.appendChild(difficultyLabel);

      difficultyLabel = document.createElement('label');
      difficultyLabel.innerHTML = 'Advanced';
      difficultyLabel.for = categories[y]._id;
      difficultyLabel.classList.add('radio-label')
      difficultyRadio = document.createElement('input');
      difficultyRadio.type = 'radio';
      difficultyRadio.name = categories[y]._id + '<-hier';
      difficultyRadio.value = '3';
      subCategoryDiff.appendChild(difficultyRadio);
      subCategoryDiff.appendChild(difficultyLabel);
      //-------------------------------------------------------
      //Settling divs DOM structure
      divInfoDiff.appendChild(subCategoryInfo);
      divInfoDiff.appendChild(subCategoryDiff);

      subCategory.appendChild(divInfoDiff);
      
      if(first) {
        categoryGroup = document.createElement('div');
        categoryGroup.classList.add('category-group');
        categoryGroup.classList.add(categories[y]._id);
      } else {
        // const arr = input.value.split('/');
        categoryGroup = document.getElementById(event.target.value);
      }

      categoryGroup.appendChild(subCategory);
      if(first){
        div.appendChild(categoryGroup);
      }
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

  // const numOfQuestions = () => {
  //   return axios.get('/company/processes/new/getNumOfQuestions');
  // }
  
  getInitialCategories()
  .then(result => {
    createCheckboxes(result.data, document.getElementById('checkbox-container'), true);
  }).catch(err => console.log(err));

  setListeners();
  