const path = require('path');
const fs = require('fs-extra');
const QRCode = require('qrcode');
const os = require('os')
var convertapi = require('convertapi')('secret_YKfU68YwpiZOyQCj');

async function generateQRCode(bookingId, outputFormat) {
    try {
        if (!bookingId || typeof bookingId !== 'string') {
            throw new Error('Invalid bookingId. It must be a non-empty string.');
        }

        const useFolder = path.join(__dirname, 'qrCodeForEachBooking', bookingId);
        await fs.ensureDir(useFolder); // Ensure directory exists

        const fileName = `${bookingId}.${outputFormat}`;
        const filePath = path.join(useFolder, fileName);

        if (!filePath || typeof filePath !== 'string') {
            throw new Error('Invalid file path generation.');
        }

        const inputText = `http://localhost:4200/ticket/${bookingId}`;

        if (outputFormat === 'jpeg') {
            const options = {
                type: outputFormat,
                width: 300,
                scale: 10,
                version: 10,
                errorCorrectionLevel: 'H',
            };

            await QRCode.toFile(filePath, inputText, options);
            return `qrCodeForEachBooking/${bookingId}/${path.basename(filePath)}`;
        } else if (outputFormat === 'png') {
            const jpegFilePath = path.join(
                __dirname, 'qrCodeForEachBooking', bookingId, `${bookingId}.jpeg`
            );
            const pngFilePath = path.join(
                __dirname, 'qrCodeForEachBooking', bookingId, `${bookingId}.png`
            );

            const result = await convertapi.convert('png', {
                File: jpegFilePath,
                FileName: `${bookingId}.jpeg`,
                ImageResolution: '500',
                ImageHeight: '200',
                ImageWidth: '200',
                TransparentColor: 'white'
            }, 'jpg');

            await result.saveFiles(pngFilePath);
            return `qrCodeForEachBooking/${bookingId}/${path.basename(pngFilePath)}`;
        } else if (outputFormat === 'svg') {
            const svgData = await QRCode.toString(inputText, { type: 'svg' });
            await fs.writeFile(filePath, svgData);
            return `qrCodeForEachBooking/${bookingId}/${path.basename(filePath)}`;
        } else {
            throw new Error('Unsupported output format. Use jpeg, png, or svg.');
        }
    } catch (err) {
        console.error('Error in generateQRCode:', err.message);
        return { message: 'Error on Booking', error: err.message };
    }
}

async function generateSvgQRCode(filePath, inputText, bookingId) {
    const svgData = await QRCode.toString(inputText, { type: 'svg' });
    await fs.writeFile(filePath, svgData);
    return `qrCodeForEachBooking/${bookingId}/${path.basename(filePath)}`;
}

module.exports = { generateQRCode };