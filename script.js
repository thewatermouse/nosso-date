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

// Configurações executadas ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    startSlideShow();

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('date-select');
    if(dateInput) {
        dateInput.setAttribute('min', today);
    }

    // Gerenciador nativo para os Checkboxes (Atividades)
    const checkboxes = document.querySelectorAll('input[name="atividade"]');
    checkboxes.forEach(cb => {
        // Garante que comecem desmarcados no carregamento
        cb.checked = false;
        cb.closest('.option-card').classList.remove('selected');

        cb.addEventListener('change', (e) => {
            const card = e.target.closest('.option-card');
            if (e.target.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    });

    // Gerenciador nativo para os Radios (Comida)
    const radios = document.querySelectorAll('input[name="comida"]');
    radios.forEach(radio => {
        radio.checked = false;
        radio.closest('.option-card').classList.remove('selected');

        radio.addEventListener('change', (e) => {
            document.querySelectorAll('input[name="comida"]').forEach(r => {
                r.closest('.option-card').classList.remove('selected');
            });
            if (e.target.checked) {
                e.target.closest('.option-card').classList.add('selected');
            }
        });
    });
});

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
function dispararEAvancar() {
    const emailField = document.getElementById('email-namorada');
    
    if (!emailField.value || !emailField.checkValidity()) {
        alert("Por favor, digite um e-mail válido para receber o convite! 💞");
        return;
    }

    // Envia os dados via AJAX em background para não travar a tela dela
    const form = document.getElementById('main-card');
    const url = form.getAttribute('action');
    const formData = new FormData(form);

    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).catch(error => console.log('Envio registrado.'));

    // Avança de tela instantaneamente e gera o link do calendário
    gerarLinkGoogleCalendar();
    nextStep(7);
}

function gerarLinkGoogleCalendar() {
    const [ano, mes, dia] = dateState.date.split('-');
    const [hora, minuto] = dateState.time.split(':');

    const dataInicio = `${ano}${mes}${dia}T${hora}${minuto}00`;
    
    const horaFimNum = (parseInt(hora, 10) + 4) % 24;
    const horaFimStr = String(horaFimNum).padStart(2, '0');
    const dataFim = `${ano}${mes}${dia}T${horaFimStr}${minuto}00`;

    const emailDela = document.getElementById('email-namorada').value;

    const titulo = encodeURIComponent("Nosso Date Perfeito! 🌹✨");
    const descricao = encodeURIComponent(
        `Cardápio Escolhido: ${dateState.food}\n` +
        `Atividades do Date: ${dateState.activities.join(', ')}\n\n` +
        `Criado com todo carinho do mundo! ❤️`
    );

    // Parâmetro &add coloca ela direto na agenda
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dataInicio}/${dataFim}&details=${descricao}&add=${encodeURIComponent(emailDela)}&sf=true&output=xml`;
    
    document.getElementById('gcal-link').setAttribute('href', gCalUrl);
}
