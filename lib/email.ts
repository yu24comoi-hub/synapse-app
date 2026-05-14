import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  const validTo = to.filter(Boolean);
  if (validTo.length === 0) return;
  await transporter.sendMail({
    from: `"Synapse" <${process.env.EMAIL_FROM}>`,
    to: validTo.join(", "),
    subject,
    html,
  });
}
