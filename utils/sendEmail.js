const nodemailer = require("nodemailer");
const fs = require('fs');
const path = require("path");


module.exports.sendEmail = async (address, subject, dataSend) => {
  
  var html = 
    `<div class="container" style="box-sizing: border-box;width: 100%;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;min-width: 992px!important;">
      
    <div class="header bg-danger text-center" style="box-sizing: border-box;background-color: #1c4308!important;text-align: center!important;">
        <h1 class="text-light p-3" style="box-sizing: border-box;margin-top: 0;margin-bottom: .5rem;font-weight: 500;line-height: 1.2;font-size: 2.5rem;padding: 1rem!important;color: #f8f9fa!important;">DEKORE MASTER STORE </h1>
    </div>
    <div class="container" style="box-sizing: border-box;width: 100%;padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;min-width: 992px!important;">
        <h2 style="box-sizing: border-box;margin-top: 0;margin-bottom: .5rem;font-weight: 500;line-height: 1.2;font-size: 2rem;orphans: 3;widows: 3;page-break-after: avoid;padding : 3px">${dataSend.heading}</h2>
        <hr>
        <h3 style="box-sizing: border-box;margin-top: 0;margin-bottom: .5rem;font-weight: 700;line-height: 1.2;font-size: 1.9rem;orphans: 3;widows: 3;page-break-after: avoid;text-align:center;color:Black;padding : 3px">${dataSend.content}</h3>
        <h4><a href='${dataSend.link}'>${dataSend.link}</a></h4>
        <hr>
        <p style="box-sizing: border-box;margin-top: 0;margin-bottom: 1,5rem;orphans: 3;widows: 3;">${dataSend.message}</p>
    </div>
  </div>`
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.NODEMAILER_USER,
    to: address,
    subject: subject,
    html: html,
  });
  
  return info
};
