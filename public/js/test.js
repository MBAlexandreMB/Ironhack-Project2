

const getACard = () => {
  axios.get(process.env.baseURL + 'user/process/${req.params.processId}/getCard')
  .then()
  .catch();
}

const saveAnswer = (event) => {
  const question = document.getElementById('question-title').innerHTML;
  const answer = event.target.value;

  axios.post(process.env.baseURL + '/process/test/saveAnswer', {question, answer})
  .then()
  .catch();
}
