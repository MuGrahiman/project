console.log('In The Mail Generator')

const nodemailer = require("nodemailer");


const OTPadmin = "mujeebrahiman2000@gmail.com";
const OTpassword = "rpfyfduxxqolmtvl";

async function mail_sending(body) {
   OTP = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000; 

         console.log(OTP);
  // ----------mail transporter----------------

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: OTPadmin,
      pass: OTpassword,
    },
  });

  // ----------------mail option-----------------

  let mailOptions = {
    from: OTPadmin,
    to: body.email,
    subject: "OTP Varification",
    html: `<p>this is your OTP ${OTP}</p>`,
  };
  // ----------------sending mail -----------------
  let b;
  const a = await transporter.sendMail(
    mailOptions,
    (b = (err, data) => {
      if (err) {
        return false;
      } else {
        return true;
      }
    })
  );
  return OTP;
}

module.exports={
    mail_sending
}