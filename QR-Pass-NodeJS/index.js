/* const fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    },
    JosefinSans: {
        normal: 'fonts/JosefinSans-Regular.ttf',
        bold: 'fonts/JosefinSans-Bold.ttf',
        italics: 'fonts/JosefinSans-Italic.ttf',
        bolditalics: 'fonts/JosefinSans-BoldItalic.ttf'
    },
    DancingScript: {
        normal: 'fonts/DancingScript-Regular.ttf',
        bold: 'fonts/DancingScript-Bold.ttf'
    },
    LexendGiga: {
        normal: 'fonts/LexendGiga-Regular.ttf',
        bold: 'fonts/LexendGiga-Bold.ttf'
    },
    Anton: {
        normal: 'fonts/Anton-Regular.ttf',
        bold: 'fonts/Anton-Regular.ttf'
    }
};
const PdfPrinter = require('pdfmake');
const printer = new PdfPrinter(fonts);
const fs = require('fs');

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id semper massa, nec dapibus mauris. Mauris in mattis nibh. Aenean feugiat volutpat aliquam. Donec sed tellus feugiat, dignissim lectus id, eleifend tortor. Ut at mauris vel dui euismod accumsan. Cras sodales, ante sit amet varius dapibus, dolor neque finibus justo, vel ornare arcu dolor vitae tellus. Aenean faucibus egestas urna in interdum. Mauris convallis dolor a condimentum sagittis. Suspendisse non laoreet nisl. Curabitur sed pharetra ipsum. Curabitur aliquet purus vitae pharetra tincidunt. Cras aliquam tempor justo sit amet euismod. Praesent risus magna, lobortis eget dictum sit amet, tristique vel enim. Duis aliquet, urna maximus sollicitudin lobortis, mi nunc dignissim ligula, et lacinia magna leo non sem.';

const docDefinition = {
    content: [
        {
            table: {
                widths: ['100%'], // Full-width border
                layout: 'noBorders',
                body: [
                    [
                        {
                            stack: [
                                {
                                    table: {
                                        widths: ['50%', '50%'],
                                        body: [
                                            [
                                                {
                                                    image: 'logo/Logo.png', // QR Pass Logo
                                                    fit: [85, 85],
                                                    alignment: 'left',
                                                    margin: [20, 0, 0, 0]
                                                },
                                                {
                                                    text: 'E-Ticket Confirmation',
                                                    font: 'Anton',
                                                    style: 'title',
                                                    alignment: 'right',
                                                    margin: [0, 10, 20, 0]
                                                }
                                            ]
                                        ]
                                    },
                                    layout: 'noBorders',
                                    margin: [0, 10, 0, 10]
                                },
                                {
                                    image: 'events/user_2_4a66e630-26a7-4e98-8ac0-7be31e4c1a33/event_2_7d94aab9-98cf-45fa-90bf-147f8bedabc4/event9.jpg', // Event Image
                                    // fit: [300, 300],
                                    height: 210,
                                    width: 400,
                                    alignment: 'center',
                                    margin: [0, 10]
                                },
                                {
                                    text: 'Ticket Details', style: 'sectionHeader', margin: [0, 20, 0, 10],
                                    font: 'Anton',
                                },
                                {
                                    table: {
                                        widths: ['35%', '65%'],
                                        body: [
                                            [{ text: 'Event Name:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'eventName', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                            [{ text: 'Seats:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'seats', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                            [{ text: 'Event Proof:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'aadhar', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                            [{ text: 'Date:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'date', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                            [{ text: 'Time:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'time', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                            [{ text: 'Total Amount:', style: 'label', font: 'JosefinSans', bold: true }, {
                                                text: 'totalAmount', style: 'value',
                                                font: 'JosefinSans',
                                            }],
                                        ]
                                    },
                                    layout: 'lightHorizontalLines',
                                    margin: [20, 10]
                                },
                                {
                                    text: 'Event Location', style: 'sectionHeader', margin: [0, 20, 0, 10],
                                    font: 'Anton',
                                },
                                {
                                    text: 'Click here for the event location',
                                    link: 'https://maps.app.goo.gl/87qk2fLW95D61nMs5',
                                    font: 'JosefinSans',
                                    color: 'blue',
                                    fontSize: 10,
                                    alignment: 'center',
                                    decoration: 'underline'
                                },
                                {
                                    text: 'Thank you for booking with QR Pass! We look forward to seeing you at the event.',
                                    alignment: 'center',
                                    font: 'JosefinSans',
                                    bold: true,
                                    margin: [0, 20],
                                    color: 'blueviolet',
                                    fontSize: 16
                                },
                                {
                                    text: '***** Organizers: Scan the QR code below to check in the attendee *****',
                                    alignment: 'center',
                                    color: '#f75f54',
                                    font: 'JosefinSans',
                                    fontSize: 13,
                                    bold: true,
                                    margin: [10, 10, 0, 0]
                                },
                                {
                                    image: 'logo/Logo.png', // QR Code
                                    fit: [120, 120],
                                    alignment: 'right',
                                    margin: [0, 10, 10, 0]
                                },
                            ],
                            margin: [10, 10] // Inner margin for spacing
                        }
                    ]
                ]
            },
            layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                    return (rowIndex % 2 === 0) ? '#f7f7f7' : '#ffffff'; // Light gray alternating rows
                }
            },

            margin: [1, 1], // Outer margin for spacing
        }
    ],
    styles: {
        title: {
            fontSize: 20,
            bold: true,
            alignment: 'center',
            color: '#333'
        },
        sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#444'
        },
        label: {
            bold: true,
            fontSize: 12
        },
        value: {
            fontSize: 12
        }
    },
    defaultStyle: {
        fontSize: 12
    }
};

const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('pdfs/watermark.pdf'));
pdfDoc.end(); */

const convertapi = require('convertapi')('secret_YKfU68YwpiZOyQCj');
const path = require('path');
const os = require('os');

async function convertToPng(bookingId, outputFormat, eventName, locationUrl, totalAmount) {
    try {
        if (outputFormat !== 'png') {
            throw new Error('Unsupported output format. Only PNG is allowed.');
        }

        const jpegFilePath = path.join(
            __dirname, 'qrCodeForEachBooking', bookingId, `${bookingId}.jpeg`
        );
        const pngFilePath = path.join(
            __dirname, 'qrCodeForEachBooking', bookingId, `${bookingId}.png`
        );

        const result = await convertapi.convert('png', {
            File: jpegFilePath,
            FileName: `${bookingId}.jpeg`,
            ImageHeight: '200',
            ImageWidth: '200',
            TransparentColor: 'white'
        }, 'jpg');

        await result.saveFiles(pngFilePath);
        
        console.log(`QR Code for "${eventName}" saved at:`, pngFilePath);
        return {
            bookingId,
            eventName,
            locationUrl,
            totalAmount,
            qrCodePath: pngFilePath
        };
    } catch (error) {
        console.error('Error in convertToPng:', error.message);
        return { message: 'Error in QR Code generation', error: error.message };
    }
}

// Example usage:
const requestData = {
    bookingId: "884f854e-1386-46a2-98ef-d5d7ff26559b",
    outputFormat: "png",
    eventName: "Music Concert",
    locationUrl: "https://maps.google.com/?q=event+location",
    totalAmount: 1500
};

convertToPng(
    requestData.bookingId,
    requestData.outputFormat,
    requestData.eventName,
    requestData.locationUrl,
    requestData.totalAmount
).then(response => console.log(response));
