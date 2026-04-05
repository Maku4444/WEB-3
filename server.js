const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Налаштування для збереження фото (Варіант 5: Фото)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'accident_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static('public')); // Сервер роздає твій HTML з папки public
app.use('/uploads', express.static('uploads')); // Роздає завантажені фото

// Маршрут для завантаження списку аварій
app.get('/api/accidents', (req, res) => {
    const data = JSON.parse(fs.readFileSync('data.json', 'utf8') || "[]");
    res.json(data);
});

// Маршрут для реєстрації нової аварії (Варіант 5: Дата, Тип, Адреса, Опис, Постраждалі, Час)
app.post('/api/accidents', upload.single('photo'), (req, res) => {
    const accidents = JSON.parse(fs.readFileSync('data.json', 'utf8') || "[]");
    
    const newEntry = {
        id: Date.now(),
        date: req.body.date,
        time: req.body.time,
        type: req.body.type,
        address: req.body.address,
        description: req.body.description,
        victims: req.body.victims,
        photo: req.file ? `/uploads/${req.file.filename}` : null
    };

    accidents.push(newEntry);
    fs.writeFileSync('data.json', JSON.stringify(accidents, null, 2));
    res.status(201).json({ message: "Аварію додано!" });
});

app.listen(PORT, () => console.log(`Сервер: http://localhost:${PORT}`));