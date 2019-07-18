const baseURL = document.URL.slice(0, document.URL.indexOf('user') - 1);
const processId = document.URL.slice(document.URL.indexOf('test') - 25, document.URL.indexOf('test') - 1);

const setCard = (card) => {
  const buttons = document.getElementsByClassName('card-alternative-btn');

  if (card.user) {
    console.log(card);
    document.getElementById('card-title').innerHTML = `There is no questions left to answer!`;
    document.getElementById('card-time').innerHTML = `<a href="/user/profile/${card._id}/processes">Back to processes</a>`;

    for(let x = 0; x < buttons.length; x += 1){
      buttons[x].style.visibility = 'hidden';
    }
    document.getElementById('company-name').style.visibility = 'hidden';
    document.getElementById('question-title').style.visibility = 'hidden';
    document.getElementById('questionId').style.visibility = 'hidden';
  } else {
    document.getElementById('card-title').innerHTML = `<b>${card.company}</b> - ${card.process}`;
    document.getElementById('company-name').innerHTML = card.category;
    document.getElementById('question-title').innerHTML = card.question;
    document.getElementById('questionId').innerHTML = card.questionId;
    document.getElementById('card-time').innerHTML = `${card.status[0]} / ${card.status[1]}`;
  
    document.getElementById('answer-btn0').innerHTML = card.alternatives[0];
    document.getElementById('answer-btn1').innerHTML = card.alternatives[1];
    document.getElementById('answer-btn2').innerHTML = card.alternatives[2];
    document.getElementById('answer-btn3').innerHTML = card.alternatives[3];
    document.getElementById('answer-btn4').innerHTML = card.alternatives[4];
  }


  
  for(let x = 0; x < buttons.length; x += 1){
    buttons[x].addEventListener('click', (e) => {
      saveAnswer(e);
    });
  }
}


const getACard = () => {
  axios.get(`${baseURL}/user/process/${processId}/getCard`)
  .then(card => 
    {
      if (!card) {
        setCard(null);
      } else {
        setCard(card.data);
      }
    })
  .catch(err => console.log(err));
}

const saveAnswer = (event) => {
  const question = document.getElementById('questionId').innerHTML;
  const answer = event.target.innerHTML;

  axios.post(`${baseURL}/user/process/test/saveAnswer?answer=${answer}&question=${question}`)
  .then((res) => {
    console.log(res);
    getACard();
  })
  .catch(err => console.log(err));
}

getACard();