const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://zafackdome:Domelien2023@cluster0.czdypc8.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('Connected!'))
  .catch((err) => console.log('Disconnect! '+err));