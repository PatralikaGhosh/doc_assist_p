// const express = require('express');
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
    res.send('Server is ready');
});

// Accessing the database
console.log(process.env.MONGO_URL);

app.listen(5000, () => {    
    console.log('Server is running on port 5000 : localhost:5000');
});