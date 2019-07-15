const companyId = document.getElementById('companyId').value;
const saveCheck = document.getElementById('saveCheck');

document.getElementsByName('name')[0].addEventListener('change', () => {
  saveCheck.innerHTML = 'Saving';
  saveCheck.classList.remove('successMessage');
  saveCheck.classList.add('errorMessage');
  axios.post('/company/profile/save', {id: companyId, name: document.getElementsByName('name')[0].value})
  .then(() => {
    saveCheck.innerHTML = 'Everything saved!'
    saveCheck.classList.add('successMessage');
    saveCheck.classList.remove('errorMessage');
  })
  .catch(err => {
    console.log(err);
    saveCheck.innerHTML = 'Error when saving name!'
    saveCheck.classList.remove('successMessage');
    saveCheck.classList.add('errorMessage');
  });

});