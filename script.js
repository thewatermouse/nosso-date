const dateState = {
    date: '',
    time: '',
    food: '',
    activities: []
};

function nextStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function prevStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

// ================= STEP 1: BUTTON LOGIC =================
function fogeButton() {
    const btnNao = document.getElementById('btn-nao');
    const card = document.getElementById('main-card');
    
    const cardWidth = card.clientWidth;
    const cardHeight = card.clientHeight;
    const btnWidth = btnNao.clientWidth;
    const btnHeight = btnNao.clientHeight;

    const maxX = cardWidth - btnWidth - 40;
    const maxY = cardHeight - btnHeight - 80;

    const randomX = Math.floor(Math.random() * maxX) + 20;
    const randomY = Math.floor(Math.random() * maxY) + 40;

    btnNao.style.position = 'absolute';
    btnNao.style.left = randomX + 'px';
    btnNao.style.top = randomY + 'px';
}

// Set min date to today
const today = new Date().toISOString().split('T')[0];
const dateInput = document.getElementById('date-select');
if(dateInput) {
    dateInput.setAttribute('min', today);
}

// ================= STEP 2: SAVE DATE & TIME =================
function salvarDataHora() {
    const dateVal = document.getElementById('date-select').value;
    const timeVal = document.getElementById('time-select').value;

    if (!dateVal || !timeVal) {
        alert("Por favor, preencha a data e o horário para o nosso date! ❤️");
        return;
    }

    dateState.date = dateVal;
    dateState.time = timeVal;
    nextStep(3);
}

// ================= STEP 3: FOOD CHOICE =================
function selectSingleOption(element) {
    const cards = element.closest('.option-grid').querySelectorAll('.option-card');
    cards.forEach(c => c.classList.remove('selected'));
    
    element.classList.add('selected');
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
}

function salvarComida() {
    const comidaInput = document.querySelector('input[name="comida"]:checked');
    if (!comidaInput) {
        alert("Escolha o que vamos comer, amor! 😋");
        return;
    }
    dateState.food = comidaInput.value;
    nextStep(4);
}

// ================= STEP 4: ACTIVITIES =================
function toggleMultipleOption(element) {
    element.classList.toggle('selected');
    const checkbox = element.querySelector('input[type="checkbox"]');
    checkbox.checked = !checkbox.checked;
}

function salvarAtividades() {
    const checkboxes = document.querySelectorAll('input[name="atividade"]:checked');
    dateState.activities = Array.from(checkboxes).map(cb => cb.value);

    if (dateState.activities.length === 0) {
        alert("Selecione pelo menos uma atividade pra gente fazer juntinhos! 💕");
        return;
    }
    nextStep(5);
}

// ================= STEP 5: PHOTO SLIDESHOW =================
let currentSlide = 0;
const slides = document.querySelectorAll('.slide-photo');

function startSlideShow() {
    if(slides.length > 0) {
        setInterval(() => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }, 2500);
    }
}

document.addEventListener("DOMContentLoaded", startSlideShow);

function avancarParaResumo() {
    prepararResumo();
    nextStep(6);
}

// ================= STEP 6: SUMMARY PREPARATION =================
function prepararResumo() {
    const [ano, mes, dia] = dateState.date.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    document.getElementById('summary-datetime').innerText = `${dataFormatada} às ${dateState.time}`;
    document.getElementById('summary-food').innerText = dateState.food;
    document.getElementById('summary-activities').innerText = dateState.activities.join(', ');

    document.getElementById('hidden-data').value = dataFormatada;
    document.getElementById('hidden-horario').value = dateState.time;
    document.getElementById('hidden-comida').value = dateState.food;
    document.getElementById('hidden-atividades').value = dateState.activities.join(', ');
}

// ================= SUBMIT AND GOOGLE CALENDAR =================
function enviarConfirmacao(event) {
    event.preventDefault();

    const form = document.getElementById('step6');
    const url = form.getAttribute('action');
    const formData = new FormData(form);

    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => {
        gerarLinkGoogleCalendar();
        nextStep(7);
    })
    .catch(error => {
        console.error('Erro no envio:', error);
        gerarLinkGoogleCalendar();
        nextStep(7);
    });
}

function gerarLinkGoogleCalendar() {
    const [ano, mes, dia] = dateState.date.split('-');
    const [hora, minuto] = dateState.time.split(':');

    const dataInicio = `${ano}${mes}${dia}T${hora}${minuto}00`;
    
    const horaFimNum = (parseInt(hora, 10) + 4) % 24;
    const horaFimStr = String(horaFimNum).padStart(2, '0');
    const dataFim = `${ano}${mes}${dia}T${horaFimStr}${minuto}00`;

    const titulo = encodeURIComponent("Nosso Date Perfeito! 🌹✨");
    const descricao = encodeURIComponent(
        `Cardápio Escolhido: ${dateState.food}\n` +
        `Atividades do Date: ${dateState.activities.join(', ')}\n\n` +
        `Criado com todo carinho do mundo! ❤️`
    );

    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dataInicio}/${dataFim}&details=${descricao}&sf=true&output=xml`;
    
    document.getElementById('gcal-link').setAttribute('href', gCalUrl);
}