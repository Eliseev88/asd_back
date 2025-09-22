const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const transporter = nodemailer.createTransport({
  host: "mail.asdhere.net",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/feedback", async (req, res) => {
  const { contact, message, "g-recaptcha-response": token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "CAPTCHA обязательна" });
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

  const response = await fetch(verifyUrl, { method: "POST" });
  const data = await response.json();

  if (!data.success) {
    return res.status(400).json({ error: "CAPTCHA не пройдена" });
  }

  if (!contact || !message) {
    return res.status(400).json({ error: "Заполните все поля" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "eliseev88@gmail.com",
    subject: "Новое обращение с сайта",
    text: `Письмо от: ${contact}\nСообщение: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ error: "Не получилось отправить запрос. Попробуйте снова" });
    }
    res.status(200).json({ message: "Ваш запрос отправлен" });
  });
});

app.listen(port, () => {
  console.log(`Сервер работает на порту ${port}`);
});
