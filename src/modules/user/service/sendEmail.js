import nodemailer from 'nodemailer'
export const sendEmail=async(to,subject,html,attachments)=>{
    const transport=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    })
    const info= await transport.sendMail({
        from:`"do7aa"<${process.env.EMAIL}>`,
        to:to? to:"do7a.moha00@gmail.com",
        subject:subject? subject:"hello",
        html:html?html:"<b>Hello</b>",
        attachments:attachments?attachments:[]

    })
   
}