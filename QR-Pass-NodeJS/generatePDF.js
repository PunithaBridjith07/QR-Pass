const fonts = {
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
const fs = require('fs-extra');
const path = require('path')

async function generatePdf(bookingDetail, qrUrl) {
    const { bookingId, eventName, seats, eventProof, date, time, totalAmount, locationUrl } = bookingDetail


    try {
        const useFolder = path.join(__dirname, 'pdfForEachBooking', bookingId);
        await fs.ensureDir(useFolder); // Ensure directory exists

        const fileName = `${bookingDetail.bookingId}.pdf`;


        let ticketDefinition = {
            watermark: { text: 'QR PASS ', color: 'blueviolet', opacity: 0.1, bold: true, italics: false, font: 'Anton' },
            content: [
                {
                    table: {
                        widths: ["100%"], // Full-width border
                        layout: "noBorders",
                        body: [
                            [
                                {
                                    stack: [
                                        {
                                            table: {
                                                widths: ["50%", "50%"],
                                                body: [
                                                    [
                                                        {
                                                            image: "logo/Logo.png", // QR Pass Logo
                                                            fit: [85, 85],
                                                            alignment: "left",
                                                            margin: [20, 0, 0, 0]
                                                        },
                                                        {
                                                            text: "E-Ticket Confirmation",
                                                            font: "Anton",
                                                            style: "title",
                                                            alignment: "right",
                                                            margin: [0, 10, 20, 0]
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: "noBorders",
                                            margin: [0, 10, 0, 10]
                                        },
                                        {
                                            image: qrUrl, // Event Image
                                            // fit:[300,300],
                                            height: 300,
                                            width: 300,
                                            alignment: "center",
                                            margin: [0, 10]
                                        },
                                        {
                                            text: "Ticket Details",
                                            style: "sectionHeader",
                                            margin: [0, 20, 0, 10],
                                            font: "Anton"
                                        },
                                        {
                                            table: {
                                                widths: ["35%", "65%"],
                                                body: [
                                                    [{ text: "Event Name:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: eventName, style: "value", font: "JosefinSans" }],

                                                    [{ text: "Seats:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: seats, style: "value", font: "JosefinSans" }],

                                                    [{ text: "Event Proof:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: eventProof, style: "value", font: "JosefinSans" }],

                                                    [{ text: "Date:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: date, style: "value", font: "JosefinSans" }],

                                                    [{ text: "Time:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: time, style: "value", font: "JosefinSans" }],

                                                    [{ text: "Total Amount:", style: "label", font: "JosefinSans", bold: true },
                                                    { text: `₹${totalAmount}`, style: "value", font: "JosefinSans" }]
                                                ]
                                            },
                                            layout: "lightHorizontalLines",
                                            margin: [20, 10]
                                        },
                                        {
                                            text: "Event Location",
                                            style: "sectionHeader",
                                            margin: [0, 20, 0, 10],
                                            font: "Anton"
                                        },
                                        {
                                            text: "Click here for the event location",
                                            link: locationUrl,
                                            font: "JosefinSans",
                                            color: "blue",
                                            fontSize: 10,
                                            alignment: "center",
                                            decoration: "underline"
                                        },
                                        {
                                            text: "Thank you for booking with QR Pass! We look forward to seeing you at the event.",
                                            alignment: "center",
                                            font: "JosefinSans",
                                            bold: true,
                                            margin: [0, 20],
                                            color: "blueviolet",
                                            fontSize: 16
                                        },
                                        {
                                            text: "***** Organizers: Scan the QR code below to check in the attendee *****",
                                            alignment: "center",
                                            color: "#f75f54",
                                            font: "JosefinSans",
                                            fontSize: 13,
                                            bold: true,
                                            margin: [10, 10, 0, 0]
                                        }
                                        // {
                                        //     image: "logo/Logo.png", // QR Code
                                        //     fit: [120, 120],
                                        //     alignment: "right",
                                        //     margin: [0, 10, 10, 0]
                                        // }
                                    ],
                                    margin: [10, 10] // Inner margin for spacing
                                }
                            ]
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return (rowIndex % 2 === 0) ? "#f7f7f7" : "#ffffff"; // Light gray alternating rows
                        }
                    },
                    margin: [1, 1] // Outer margin for spacing
                }
            ],
            styles: {
                title: {
                    fontSize: 20,
                    bold: true,
                    alignment: "center",
                    color: "#333"
                },
                sectionHeader: {
                    fontSize: 14,
                    bold: true,
                    color: "#444"
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

        let pdfDoc = printer.createPdfKitDocument(ticketDefinition);
        pdfDoc.pipe(fs.createWriteStream(`pdfForEachBooking/${bookingDetail.bookingId}/${fileName}`))
        pdfDoc.end();

        return { path: `pdfForEachBooking/${bookingDetail.bookingId}/${fileName}`, fileName: fileName }
    } catch (error) {
        console.error("Ticket Not Generated ", error.message);
        return { error: error.message }
    }
}


module.exports = { generatePdf };