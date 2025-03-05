const express = require('express');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors()); // Enable CORS
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// CORS Headers setup
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});
app.listen(8000, () => console.log("Server running at http://localhost:8000"));

// Serve static files
app.use('/events', express.static(path.join(__dirname, 'events')));

//  Database Configure with Nano
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL verification
const nano = require('nano')(process.env.COUCHDB_URL);
// nano.auth('d_couchdb','Welcome#2').then((cookie) => {
//     console.log('Login successful:', cookie);
//   }).catch(console.error);
const db = nano.db.use(process.env.DB_NAME);


// GET Request
app.get('', async (req, res) => {

    nano.db.list().then(dbs => {
        console.log('Databases:', dbs);
    }).catch(err => {
        console.error('Error:', err);
    });
    res.status(200).json({ "Status": "Connection Successful" });
});

// POST Request for Event Image Upload

// app.post('/event-image/:userId/:eventId', upload.array('images', 10), async (req, res) => {
//     const { userId, eventId } = req.params;  // Get userId and eventId from URL params
//     const userFolder = path.join(__dirname, 'events', userId);  // Create user folder
//     const eventFolder = path.join(userFolder, eventId);  // Create event folder inside user folder

//     try {
//         await fs.ensureDir(eventFolder);  // Ensure directories exist
//         let filePaths = [];  // Array to store image URLs
//         await Promise.all(req.files.map(async (file) => {
//             const filePath = path.join(eventFolder, file.originalname);  // File path
//             await fs.writeFile(filePath, file.buffer);  // Save the file

//             // Push the URL to filePaths array
//             filePaths.push(`${req.protocol}://${req.get('host')}/events/${userId}/${eventId}/${file.originalname}`);
//         }));             //  use to store Multiple images
//     } catch (error) {
//         res.status(500).json({ error: 'Error saving event images', details: error.message });
//     }
// })    //    use to post 10 images from via the request

app.post('/event-image/:userId/:eventId', upload.single('image'), async (req, res) => {
    const { userId, eventId } = req.params;  // Get userId and eventId from URL params
    const userFolder = path.join(__dirname, 'events', userId);  // Create user folder
    const eventFolder = path.join(userFolder, eventId);  // Create event folder inside user folder

    try {
        await fs.ensureDir(eventFolder);  // Ensure directories exist, according to the every event

        const imagePath = path.join(eventFolder, req.file.originalname);

        await fs.writeFile(imagePath, req.file.buffer);
        const filePath = `${req.protocol}://${req.get('host')}/events/${userId}/${eventId}/${req.file.originalname}`
        res.status(200).json({ eventImage: filePath });
    } catch (error) {
        res.status(500).json({ error: 'Error saving event images', details: error.message });
    }
});             //  Store single file

// Create Nodemailer transporter for sending email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

// POST Request for sending email
app.post('/send-subscribed-email', async (req, res) => {
    const { to, paid, date, time } = req.body;  // Get email details from request body

    try {
        const info = await transporter.sendMail({
            from: `"QR Pass" <${process.env.EMAIL}>`,
            to: to,
            subject: 'Event Payment Confirmation',
            text: `Dear Organizer, your payment of ₹${paid} has been successfully received on ${date} at ${time}.`,
            html: `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Confirmation - Event Booking</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 20px auto;
                            background-color: #fff;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            padding: 30px;
                        }
                        .header {
                            text-align: center;
                            padding-bottom: 20px;
                        }
                        .header h1 {
                            color: #4CAF50;
                        }
                        .content {
                            padding: 20px;
                            border-top: 2px solid #f0f0f0;
                            margin-top: 20px;
                        }
                        .content p {
                            font-size: 16px;
                            line-height: 1.5;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            font-size: 12px;
                            color: #888;
                        }
                        .button {
                            background-color: #4CAF50;
                            color: #fff;
                            padding: 12px 20px;
                            text-decoration: none;
                            border-radius: 5px;
                            display: inline-block;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Payment Successful</h1>
                        </div>
                        <div class="content">
                            <p>Dear <strong>Organizer</strong>,</p>
                            <p>Your payment has been successfully received. Here are the details:</p>
                            <p><strong>Amount Paid:</strong> ₹${paid}</p>
                            <p><strong>Payment Date:</strong> ${date}</p>
                            <p><strong>Payment Time:</strong> ${time}</p>
                            <p>Thank you for using our service! You can now proceed to publish your event.</p>
                            <a href="http://yourwebsite.com/publish-event" class="button">🚀 Publish Event</a>
                        </div>
                        <div class="footer">
                            <p>© 2025 QR Pass. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>`
        });

        res.json({ message: 'Email sent successfully!', messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
});