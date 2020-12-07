const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

app.use(cors());

/*

mongodb+srv://<username>:<password>@projet6-audrey-boscher.t9pow.mongodb.net/Piquante?retryWrites=true&w=majority

Informations d'accès pour supprimer ou modifier des tables :
<username> => Employees
<password> => ky5VcAY4odIvVqjC

Informations d'accès pour éditer le contenu de la DB :
<username> => Sophie
<password> => x4aZ3t9XFvzk74To

 */

const usernameMongoDB = "Sophie";
const passwordMongoDB = "x4aZ3t9XFvzk74To";
mongoose.connect('mongodb+srv://'+usernameMongoDB+':'+passwordMongoDB+'@projet6-audrey-boscher.t9pow.mongodb.net/Piquante?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
