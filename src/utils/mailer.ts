import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

function welcomeHTML(name: string) {
  let html = fs.readFileSync(path.resolve(__dirname, '../assets/email_templates/index.html'), 'utf8');
  html = html.replace('{RECIEVER_NAME}', name);
  return html;
}

export const sendWelcomeEmail = (email: string, name: string) => {
  sgMail
    .send({
      to: email,
      from: {
        name: 'Michael From Mikeadebisi.com',
        email: 'hey@mikeadebisi.com',
      },
      subject: 'Thank you for reaching out!',
      text: `Hello ${name}, thanks for reachign out!, i will get back to you as soon as possible.`,
      html: welcomeHTML(name),
    })
    .then((response) => {
      console.log(response[0].statusCode);
      console.log(response[0].headers);
    })
    .catch((error) => {
      console.error(error);
    });
};
