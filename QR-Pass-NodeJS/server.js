const express = require('express');
const cors = require('cors');
const os = require('os');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');
const { generateQRCode } = require('./generateQRCode');
const { generatePdf } = require('./generatePDF');

// const { jsPDF } = require("jspdf"); // will automatically load the node version

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
app.use('/qrCodeForEachBooking', express.static(path.join(__dirname, 'qrCodeForEachBooking')));
app.use('/pdfForEachBooking', express.static(path.join(__dirname, 'pdfForEachBooking')));

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

    // nano.db.list().then(dbs => {
    //     console.log('Databases:', dbs);
    // }).catch(err => {
    //     console.error('Error:', err);
    // });
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
            subject: 'Subscription Payment Confirmation',
            text: `Dear Organizer, your payment of ₹${paid} has been successfully received on ${date} at ${time}.`,
            html: `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Payment Confirmation - Event Publishing</title>
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

        res.status(200).json({ message: 'Email sent successfully!', messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
});

//  Event QR Ticket Via Email
app.post('/generate-qr', async (req, res) => {
    const { to, bookingId, outputFormat, eventName, locationUrl, totalAmount } = req.body;

    try {
        const imageUrl = await generateQRCode(bookingId, outputFormat); // Generate QR Code
        console.log(imageUrl);


        if (imageUrl) {
            const imageBase64 = await fs.readFileSync(imageUrl); // Read Image as Buffer

            const info = await transporter.sendMail({
                from: `"QR Pass" <${process.env.EMAIL}>`,
                to: to,
                subject: 'Ticket Booking Confirmation',
                text: `Dear User, your booking for ${eventName} has been confirmed!`,
                html: `<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Ticket Confirmation</title>
                            <style>
                                body { font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                                .container { max-width: 500px; margin: 20px auto; background: #fff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
                                .header h1 { color: #4CAF50; font-size: 22px; }
                                .qr-code { width: 200px; height: 200px; margin: 15px auto; display: block; }
                                .button { background-color: #4CAF50; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 8px 3px; font-size: 14px; }
                                .footer { margin-top: 20px; font-size: 12px; color: #888; }
                                .rules { text-align: left; font-size: 14px; margin-top: 20px; padding: 10px; border-top: 1px solid #ddd; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header"><h1>🎟 Ticket Confirmed!</h1></div>
                                <p><strong>Important:</strong> Do not share this QR code. It is strictly for event check-in.</p>
                                <img src="cid:qrimage" alt="QR Code" class="qr-code">
                                <p><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>
                                <p><strong>Location:</strong> <a href="${locationUrl}" target="_blank">View on Map</a></p>
                                <p>Download QR Code:</p>
                                <a href="http://localhost:8000/qrCodeForEachBooking/${bookingId}/${bookingId}.jpeg" class="button" download>📷 JPEG</a>
                                <a href="http://localhost:8000/qrCodeForEachBooking/${bookingId}/${bookingId}.png" class="button" download>🖼 PNG</a>
                                <a href="http://localhost:8000/qrCodeForEachBooking/${bookingId}/${bookingId}.svg" class="button" download>📄 SVG</a>
                                <div class="rules">
                                    <h3>QR Code Usage Guidelines:</h3>
                                    <p>- The QR code must be presented upon arrival at the event venue.</p>
                                    <p>- Event organizers will scan the QR code to grant entry.</p>
                                    <p>- Ensure your QR code is not shared to avoid unauthorized access.</p>
                                    <p>- If a user scans the QR code, they can only view their ticket details.</p>
                                    <p>- If an organizer scans the QR code, the check-in status will be updated.</p>
                                    <p>- The QR code is valid for single entry only.</p>
                                </div>
                                <div class="footer"><p>© 2025 QR Pass. All rights reserved.</p></div>
                            </div>
                        </body>
                        </html>`,
                attachments: [
                    {
                        filename: `${bookingId}.png`, // QR Code File
                        content: imageBase64, // Attach as content
                        encoding: 'base64',
                        cid: 'qrimage' // Content ID for embedding in email
                    }
                ]
            });

            res.status(200).json({ message: 'Event Booked', messageId: info.messageId, qrCodeUrl: `${req.protocol}://${req.get('host')}/${imageUrl}` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error on Booking', error: error.message });
    }
});

app.get('/generate-pngSvg/:bookingId/:outputFormat', async (req, res) => {
    const { bookingId, outputFormat } = req.params

    try {
        const fileUrl = await generateQRCode(bookingId, outputFormat);
        const fileBuffer = fs.readFileSync(fileUrl)
        // Set response headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFile.fileName}`);
        res.send(fileBuffer);  // Send the buffered data
    } catch (error) {
        res.status(500).json({ error: "Error Downloading File" });
    }
})

//  download Pdf, while booked event
app.post('/download-ticket', async (req, res) => {
    try {
        const bookingDetail = req.body;
        const qrUrl = `qrCodeForEachBooking/${req.body.bookingId}/${req.body.bookingId}.jpeg`;

        // Generate the PDF and get the file details
        const pdfFile = await generatePdf(bookingDetail, qrUrl);
        const filePath = path.join(__dirname, pdfFile.path);

        // Wait until the file is available using a loop
        const waitForFile = (filePath, timeout = 10000) => new Promise((resolve) => {
            const start = Date.now();
            const interval = setInterval(() => {
                if (fs.existsSync(filePath) || Date.now() - start > timeout) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100); // Check every 100ms
        });

        await waitForFile(filePath); // Ensure the file is fully created

        // Set response headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${pdfFile.fileName}`);

        // Stream the PDF file directly
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        console.error("Error during ticket generation:", error);
    }
});
