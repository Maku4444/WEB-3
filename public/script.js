// --- Параметри моніторингу BESS (ПР2) ---
let soc = 80;               
let current = 0;           
let voltage = 720;          
let temp = 25;              
let cycles = 124;
let mode = 'standby';       

function monitorBESS() {
    setInterval(() => {
        if (mode === 'charge') {
            current = 350 + (Math.random() * 50); 
            soc = Math.min(100, soc + 0.1);
            temp += 0.05;
        } else if (mode === 'discharge') {
            current = -380 - (Math.random() * 30); 
            soc = Math.max(0, soc - 0.15);
            temp += 0.08;
        } else {
            current = 0;
            temp = Math.max(20, temp - 0.03); 
        }
        voltage = 700 + (soc * 1.2) + (Math.random() * 5);

        updateUI();
    }, 2000);
}

function updateUI() {
    // Числові значення
    document.getElementById('soc-val').innerText = soc.toFixed(1);
    document.getElementById('current-val').innerText = current.toFixed(0);
    document.getElementById('voltage-val').innerText = voltage.toFixed(1);
    document.getElementById('temp-val').innerText = temp.toFixed(1);
    document.getElementById('cycle-count').innerText = Math.floor(cycles);

    // Прогноз розряду
    const forecastEl = document.getElementById('time-forecast');
    if (mode === 'discharge' && current < 0) {
        let hours = (soc / (Math.abs(current) / 10)).toFixed(1); 
        forecastEl.innerText = hours;
    } else {
        forecastEl.innerText = "--";
    }

    // Перевірка діапазонів (Оновлена логіка)
    checkRange('soc', soc, 20, 95);
    checkRange('current', current, -400, 400);
    checkRange('voltage', voltage, 650, 800);
    checkRange('temp', temp, 20, 35);

    // Прогрес-бар
    document.getElementById('soc-bar').style.width = soc + "%";
}

// Виправлена функція: міняє тільки колір рамки
function checkRange(id, val, min, max) {
    const card = document.getElementById(`card-${id}`);
    if (val < min || val > max) {
        card.style.borderColor = "#dc3545"; // Червоний
        card.style.borderWidth = "2px";
    } else {
        card.style.borderColor = "#198754"; // Зелений
        card.style.borderWidth = "1px";
    }
}

function setMode(newMode) {
    mode = newMode;
    const modeEl = document.getElementById('work-mode');
    modeEl.innerText = newMode === 'charge' ? 'Заряд' : (newMode === 'discharge' ? 'Розряд' : 'Очікування');
    
    if (newMode === 'discharge') cycles += 0.01; 
}

// --- Робота з формою та сервером (ПР3) ---

const form = document.getElementById('accidentForm');
const listContainer = document.getElementById('accidentsList');

form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/api/accidents', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            alert("Аварію успішно зареєстровано!");
            form.reset();
            loadAccidents(); // Оновлюємо список після додавання
        }
    } catch (error) {
        console.error("Помилка відправки:", error);
    }
};

async function loadAccidents() {
    try {
        const res = await fetch('/api/accidents');
        const data = await res.json();
        
        listContainer.innerHTML = ''; // Очищуємо перед виводом
        
        if (data.length === 0) {
            listContainer.innerHTML = '<p class="text-muted">Записів поки немає.</p>';
            return;
        }

        data.reverse().forEach(acc => {
            const dateObj = new Date(acc.id);
            const card = `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="fw-bold text-danger">${acc.type}</h6>
                            <small class="text-muted">${acc.date} | ${acc.time}</small>
                        </div>
                        <p class="mb-1"><strong>Адреса:</strong> ${acc.address}</p>
                        <p class="small text-secondary">${acc.description}</p>
                        <div class="d-flex align-items-center justify-content-between mt-2">
                            <span class="badge bg-light text-dark border">Постраждалі: ${acc.victims}</span>
                            ${acc.photo ? `<a href="${acc.photo}" target="_blank" class="btn btn-sm btn-outline-secondary">Дивитись фото</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            listContainer.innerHTML += card;
        });
    } catch (error) {
        listContainer.innerHTML = '<p class="text-danger">Не вдалося завантажити дані з сервера.</p>';
    }
}

// Ініціалізація
monitorBESS();
loadAccidents();