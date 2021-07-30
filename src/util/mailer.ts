import nodeMailer from "nodemailer";
const mailHost = "mail.flextech.vn";
const mailPort = 25;

const sendMail = (to: string, subject: string, htmlContent: string) => {
    try {
        const transporter = nodeMailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: false,
            auth: {
                user: process.env.MAILER_EMAIL,
                pass: process.env.MAILER_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const options = {
            from: process.env.MAILER_EMAIL, // địa chỉ admin email bạn dùng để gửi
            to: to, // địa chỉ gửi đến
            subject: subject, // Tiêu đề của mail
            html: htmlContent // Phần nội dung mail mình sẽ dùng html thay vì thuần văn bản thông thường.
        };
        const send = transporter.sendMail(options, function(error, info) {
            if(error){
                   return console.log(error);
            } else {
                   console.log("Message sent: " + info.response);
            }
        });
        return {
            status: true,
            message: "Success!"
        };  
    }catch(error) {
        console.log(error.message);
        return {
            status: false,
            message: error.message
        };
    }

};

export default sendMail;

function done() {
    throw new Error("Function not implemented.");
}
