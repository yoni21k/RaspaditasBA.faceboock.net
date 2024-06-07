const scratchImage = 'miimagen.png';
const brushImage = 'brush.png';
const prizeImages = [
    'billete1.jpg', 'billete2.jpg', 'billete3.jpg', 
    'billete4.jpg', 'billete5.jpg', 'suerte_la_proxima.jpg'
];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generatePrizes() {
    let prizes = [];
    let unluckyCount = getRandomInt(2, 4);

    for (let i = 0; i < unluckyCount; i++) {
        prizes.push('suerte_la_proxima.jpg');
    }

    while (prizes.length < 4) {
        const randomIndex = getRandomInt(0, 5);
        const prize = prizeImages[randomIndex];
        prizes.push(prize);
    }

    return shuffle(prizes);
}

function loadBrushPattern(ctx, callback) {
    const img = new Image();
    img.onload = function() {
        const pattern = ctx.createPattern(img, 'repeat');
        callback(pattern);
    };
    img.src = brushImage;
}

function initScratchCard(canvasId, cardId, prizeImage) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const prize = document.querySelector(`#${cardId} .prize img`);
    prize.src = prizeImage;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = scratchImage;

    loadBrushPattern(ctx, (pattern) => {
        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = pattern;
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();
        }

        function scratchAutomatically() {
            const interval = setInterval(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                scratch(x, y);
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                document.querySelector(`#${cardId} .prize`).style.visibility = 'visible';
            }, 5000);
        }

        canvas.addEventListener('click', () => {
            scratchAutomatically();
        });

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            scratchAutomatically();
        }, { passive: false });
    });
}

function addMoreCards() {
    const cardsContainer = document.getElementById('cards-container');
    cardsContainer.innerHTML = '';
    const prizes = generatePrizes();

    for (let i = 0; i < 4; i++) {
        const cardId = `card${i + 1}`;
        const canvasId = `canvas${i + 1}`;
        const prizeImage = prizes[i];

        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.id = cardId;

        const newCanvas = document.createElement('canvas');
        newCanvas.id = canvasId;
        newCanvas.className = 'scratch-canvas';
        newCanvas.width = 400;
        newCanvas.height = 150;

        const newPrize = document.createElement('div');
        newPrize.className = 'prize hidden';

        const newImage = document.createElement('img');
        newImage.alt = `Billete ${i + 1}`;
        newImage.className = 'prize-image';

        newPrize.appendChild(newImage);
        newCard.appendChild(newCanvas);
        newCard.appendChild(newPrize);
        cardsContainer.appendChild(newCard);

        initScratchCard(canvasId, cardId, prizeImage);
    }
}

function validateCode(codigo) {
    const usedCodes = JSON.parse(localStorage.getItem('usedCodes')) || [];
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    if (usedCodes.includes(codigo)) {
        return { valid: false, message: 'Código expirado.' };
    }
    
    if (codigosValidos.includes(codigo)) {
        usedCodes.push(codigo);
        localStorage.setItem('usedCodes', JSON.stringify(usedCodes));
        return { valid: true, message: 'Código Valido. Generando nuevas raspaditas.' };
    } else {
        return { valid: false, message: 'Código inválido.' };
    }
}

document.getElementById('validar-codigo').addEventListener('click', () => {
    const codigoInput = document.getElementById('codigo-input').value.trim();
    const result = validateCode(codigoInput);
    const validationTimeElement = document.getElementById('validation-time');
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    if (result.valid) {
        validationTimeElement.textContent = `Código validado el: ${formattedDate}`;
        addMoreCards();
    } else {
        validationTimeElement.textContent = `Código inválido: ${result.message}`;
    }
});
