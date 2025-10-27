import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService{
    private transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: 'abie.exe@gmail.com',
                pass: 'shkccsizlrvpwlnz',
            },
        });
    }

    async sendVerificationEmail(to: string, otp: string){
        const mailOption = {
            from: '"Travique"  <no-reply@gmail.com>',
            to,
            subject: "You Otp code",
            html: `
            <h3>you otp for verification is:</h3>
            <h1>${otp}</h1>
            <p>this code will expire in 5 mint.</p>
            ` 
        };

        await this.transporter.sendMail(mailOption);
    }
}