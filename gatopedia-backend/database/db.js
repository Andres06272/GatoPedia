const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../gatopedia.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas e insertar datos iniciales
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS breeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    lifespan TEXT,
    characteristics TEXT,
    origin TEXT,
    weight TEXT,
    image TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attributes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    breed_id INTEGER,
    type TEXT CHECK(type IN ('color', 'pattern', 'tag')),
    value TEXT,
    FOREIGN KEY (breed_id) REFERENCES breeds(id)
  )`);

  // Verificar si ya hay datos
  db.get("SELECT COUNT(*) as count FROM breeds", (err, row) => {
    if (row.count === 0) {
      insertInitialData();
    }
  });
});

function insertInitialData() {
  const breeds = [
    {
      name: "Persa",
      lifespan: "12-16 años",
      characteristics: "Pelaje largo, cara plana, temperamento calmado. Ideal para vivir en interiores.",
      origin: "Persia (actual Irán)",
      weight: "3-5.5 kg",
      image: "persa.jpg",
      attributes: [
        { type: "color", value: "blanco" },
        { type: "color", value: "negro" },
        { type: "color", value: "gris" },
        { type: "pattern", value: "liso" },
        { type: "tag", value: "pelaje largo" },
        { type: "tag", value: "tranquilo" }
      ]
    },
    {
      name: "Siamés",
      lifespan: "15-20 años",
      characteristics: "Cuerpo esbelto, ojos azules, muy vocal y cariñoso. Forma fuertes lazos con sus dueños.",
      origin: "Tailandia",
      weight: "3.6-5.4 kg",
      image: "siames.jpg",
      attributes: [
        { type: "color", value: "crema" },
        { type: "color", value: "marrón" },
        { type: "pattern", value: "pointed" },
        { type: "tag", value: "vocal" },
        { type: "tag", value: "activo" }
      ]
    },
    {
      name: "Maine Coon",
      lifespan: "12-15 años",
      characteristics: "Una de las razas más grandes, pelaje semilargo resistente al agua. Naturaleza gentil y amigable.",
      origin: "Estados Unidos",
      weight: "5.9-8.2 kg (machos)",
      image: "maine-coon.jpg",
      attributes: [
        { type: "color", value: "marrón" },
        { type: "color", value: "negro" },
        { type: "pattern", value: "atigrado" },
        { type: "tag", value: "grande" },
        { type: "tag", value: "amigable" }
      ]
    },
    {
      name: "Bengalí",
      lifespan: "12-16 años",
      characteristics: "Pelaje con patrón de leopardo, extremadamente activo y curioso. Disfruta del agua.",
      origin: "Estados Unidos",
      weight: "3.6-6.8 kg",
      image: "bengali.jpg",
      attributes: [
        { type: "color", value: "naranja" },
        { type: "color", value: "marrón" },
        { type: "pattern", value: "manchado" },
        { type: "tag", value: "activo" },
        { type: "tag", value: "juguetón" }
      ]
    },
    {
      name: "Esfinge",
      lifespan: "8-14 años",
      characteristics: "Apariencia sin pelo, piel arrugada. Extremadamente cariñoso y busca el calor humano.",
      origin: "Canadá",
      weight: "3.5-7 kg",
      image: "esfinge.jpg",
      attributes: [
        { type: "color", value: "rosa" },
        { type: "color", value: "gris" },
        { type: "pattern", value: "liso" },
        { type: "tag", value: "sin pelo" },
        { type: "tag", value: "cariñoso" }
      ]
    },
    {
      name: "Ragdoll",
      lifespan: "12-17 años",
      characteristics: "Gatos grandes y musculosos con ojos azules. Se relajan completamente cuando se les carga.",
      origin: "Estados Unidos",
      weight: "4.5-9 kg",
      image: "ragdoll.jpg",
      attributes: [
        { type: "color", value: "azul" },
        { type: "color", value: "blanco" },
        { type: "pattern", value: "bicolor" },
        { type: "tag", value: "relajado" },
        { type: "tag", value: "afectuoso" }
      ]
    }
  ];

  breeds.forEach(breed => {
    db.run(
      `INSERT INTO breeds (name, lifespan, characteristics, origin, weight, image) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [breed.name, breed.lifespan, breed.characteristics, breed.origin, breed.weight, breed.image],
      function(err) {
        if (err) return console.error(err.message);
        
        const breedId = this.lastID;
        breed.attributes.forEach(attr => {
          db.run(
            `INSERT INTO attributes (breed_id, type, value) VALUES (?, ?, ?)`,
            [breedId, attr.type, attr.value]
          );
        });
      }
    );
  });
}

module.exports = db;