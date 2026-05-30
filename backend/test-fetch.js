require('dotenv').config();
const { handleChat } = require('./controllers/chatController');

const req = {
  body: {
    messages: [{ role: 'user', content: 'hello' }]
  }
};
const res = {
  status: function(code) { this.code = code; return this; },
  json: function(data) { console.log("Response:", this.code, data); }
};
const next = (err) => console.log("Next Error:", err);

handleChat(req, res, next);
