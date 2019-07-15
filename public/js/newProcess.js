// const handleChange = (e) => {
//   const div = document.getElementById(e.target.value);
//   if (e.target.checked) {
//     getSubCategories(e.target.value)
//     .then(result => {
//       createCheckboxes(result.data.subcategories, div);
//     })
//     .catch(err => console.log(err));
//   } else {
//     console.log(div.childNodes);
//     while(div.childNodes.length > 4) {
//       div.removeChild(div.lastChild);
//     } 
//   }
// }  
  
//   const createCheckboxes = (categories, div) => {
//     for (let y = 0; y < categories.length; y += 1) {
//       let subCategory = document.createElement('div');
//       subCategory.id = categories[y]._id;
      
//       let label = document.createElement('label');
//       label.for = categories[y].name;
//       label.innerHTML = categories[y].name;
      
//       let input = document.createElement('input');
//       input.name = categories[y].name;
//       input.value = categories[y]._id;
//       input.classList.add('checkbox-category');
//       input.type = 'checkbox';
//       input.onchange = (e) => handleChange(e);
      
//       subCategory.appendChild(input);
//       subCategory.appendChild(label);
//       div.appendChild(subCategory);
//     }
//   }
  
//   const setListeners = () => {
//     const checkboxes = document.querySelectorAll('.checkbox-category');
//     for (let x = 0; x < checkboxes.length; x += 1) {
//       checkboxes[x].onchange = (e) => handleChange(e);     
//     }
//   }
  
  
//   const base = '/company/processes/new/getSubCategory';
  
//   const getSubCategories = (id) => {
//     return axios.get(`${base}/${id}`);
//   }
  
//   const getInitialCategories = () => {
//     return axios.get(`${base}/hierarchy`);
//   }

//   getInitialCategories().then(result => {
//     createCheckboxes(result.data.subcategories, document.getElementById('checkbox-container'));
//   }).catch(err => console.log(err));

//   setListeners();
  