export default {
  port: 5000,
  dbUri:
    'mongodb+srv://mikeadebisi_admin:<PASSWORD>@mikeadebisi.vwif2.mongodb.net/?',
  // 'mongodb://eduquota_admin:<PASSWORD>@mongodb/eduquota?directConnection=true',
  logLevel: 'info',
  accessTokenPrivateKey: '',
  refreshTokenPrivateKey: '',
  smtp: {
    user: 'maugdousrc3q3rfy@ethereal.email',
    pass: 'F2ZBHCe3b1nzwNPa51',
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
  },
  emailAddress: 'adebisienads@gmail.com',
  emailSender: 'Michael E Adebisi',
  emailSubject: 'Welcome to Eduquota',
  emailBody: '<h1>Welcome to Eduquota</h1>',
  emailFooter: '<p>Thank you for using Eduquota</p>',
  emailSignature: '<p>Michael E Adebisi</p>',
  emailFooterSignature: '<p>Michael E Adebisi</p>',
  emailFooterSignatureLink:
    "<p><a href='https://www.linkedin.com/in/mikeadebisi/'><img src='https://img.freepik.com/free-vector/isometric-education-illustration-with-books_1284-64357.jpg?w=2000' alt='images' /></a></p>",
};
