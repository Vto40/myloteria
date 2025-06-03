const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu proveedor SMTP
    auth: {
        user: 'myloterianacional@gmail.com',
        pass: 'kprr ysbz awxg lprb',
    },
});

async function enviarCorreo(destinatario, asunto, texto) {
    try {
        await transporter.sendMail({
            from: '"MyLoteria" <myloterianacional@gmail.com>',
            to: destinatario,
            subject: asunto,
            text: texto,
        });
        console.log(`Correo enviado a ${destinatario} con asunto "${asunto}"`);
    } catch (error) {
        console.error('Error enviando correo:', error);
    }
}

module.exports = enviarCorreo;