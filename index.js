const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');
const drinksFile = path.join(__dirname, 'drinks.json');
app.use(express.static('public'));

function saveDrinksToFile() {
    fs.writeFileSync(drinksFile, JSON.stringify(drinks, null, 2));
}

app.use(express.json());

let drinks = [];

if (fs.existsSync(drinksFile)) {
    const data = fs.readFileSync(drinksFile, 'utf-8');
    drinks = JSON.parse(data);
}

let nextId = Math.max(...drinks.map(d => d.id), 0) + 1;

// GET all drinks
app.get('/drinks', (req, res) => {
    res.json(drinks);
});

// POST a new drink
app.post('/drinks', (req, res) => {
    const { name, description } = req.body;

    // Validate required fields
    if (!name || !description || name.trim() === '' || description.trim() === '') {
        return res.status(400).json({ message: 'Name and description are required.' });
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    // Check for duplicate name
    const nameExists = drinks.some(drink => drink.name.toLowerCase() === trimmedName.toLowerCase());
    if (nameExists) {
        return res.status(400).json({ message: 'A drink with that name already exists.' });
    }

    // Check for duplicate description
    const descriptionExists = drinks.some(drink => drink.description.toLowerCase() === trimmedDescription.toLowerCase());
    if (descriptionExists) {
        return res.status(400).json({ message: 'A drink with that description already exists.' });
    }

    const newDrink = {
        id: nextId++,
        name: trimmedName,
        description: trimmedDescription
    };

    drinks.push(newDrink);
    saveDrinksToFile();
    res.status(201).json(newDrink);

});


// PUT - Update a drink by ID
app.put('/drinks/:id', (req, res) => {
    const drinkId = parseInt(req.params.id);
    const drink = drinks.find(d => d.id === drinkId);

    if (!drink) {
        return res.status(404).json({ message: 'Drink not found' });
    }
    drink.name = req.body.name || drink.name;
    drink.description = req.body.description || drink.description;
    saveDrinksToFile();
    res.json(drink);


});

// DELETE - Remove a drink by ID
app.delete('/drinks/:id', (req, res) => {
    const drinkId = parseInt(req.params.id);
    const index = drinks.findIndex(d => d.id === drinkId);

    if (index === -1) {
        return res.status(404).json({ message: 'Drink not found' });
    }

    const deleted = drinks.splice(index, 1);
    saveDrinksToFile();
    res.json({ message: 'Drink deleted', drink: deleted[0] });

});

// Start the server (should be last)
app.listen(port, () => {
    console.log(`Drink API running at http://localhost:${port}`);
});
