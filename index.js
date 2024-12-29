const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Google Generative AI
const API_KEY = process.env.API_KEY;
const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({ model: "gemini-pro" }); // You can keep the model as gemini-pro, but we'll refer to it as Finix

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Handle message requests from frontend
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('message', async (msg) => {
    try {
      // Modify input text to make sure it responds as "Finix"
      const inputText = `As a respectful boy named Finix, respond to this message concisely: ${msg}`;
      const { response } = await model.generateContent(inputText);

      // Remove any mention of Gemini and ensure response stays in character as Finix
      const generatedResponse = response.text().replace(/Gemini/g, "Finix");

      socket.emit('response', generatedResponse || "Finix has nothing to say.");
    } catch (error) {
      socket.emit('response', "Oops! Something went wrong.");
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
