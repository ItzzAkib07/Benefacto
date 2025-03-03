require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// Schema for storing emails
const SubscriberSchema = new mongoose.Schema({ email: String });
const Subscriber = mongoose.model("Subscriber", SubscriberSchema);

// Route to handle email subscription
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.status(201).json({ message: "Subscription successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Route to send email notifications
app.post("/send-updates", async (req, res) => {
  try {
    const subscribers = await Subscriber.find();
    if (subscribers.length === 0) return res.status(400).json({ message: "No subscribers found" });

    const { title, link } = req.body;
    if (!title || !link) return res.status(400).json({ message: "Blog details are required" });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: subscribers.map(sub => sub.email),
      subject: "New Blog Update",
      html: `<h2>${title}</h2><p>Check out our latest blog: <a href="${link}">${title}</a></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Update emails sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
