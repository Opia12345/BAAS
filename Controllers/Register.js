const nodemailer = require("nodemailer");
const saltRounds = 15;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../Models/User");
const yup = require("yup");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth: {
    user: process.env.USERMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

const Validation = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please use a valid email address")
    .required("Email is required"),
  username: yup.string().required("User Name is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

exports.Register = async (req, res) => {
  const { name, email, username, password } = req.body;

  try {
    const validationSchema = Validation;
    await validationSchema.validate(
      { name, email, username, password },
      { abortEarly: false }
    );

    const existingMail = await User.findOne({ email });

    if (existingMail) {
      return res
        .status(409)
        .json({ error: "User with this Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWTSECRET,
      {
        expiresIn: "3m",
      }
    );

    newUser.resetToken = refreshToken;
    newUser.resetTokenExpiration = Date.now() + 3 * 60 * 1000;

    await newUser.save();

    const verificationLink = `${process.env.BASE_URL}/emailConfirmed?token=${refreshToken}`;

    const response = {
      message: "User created successfully",
    };

    res.status(201).json(response);

    //     let mailOptions = {
    //       from: process.env.USERMAIL,
    //       to: email,
    //       subject: "Welcome to Nexus Bank! Your Account Registration is Complete",
    //       html: `<table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: white; color: #333; font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    //       <tr>
    //           <td align="center" style="background-color: white; padding: 20px 0;">
    //               <img src="cid:logo" alt="QRight Logo" style="width: 150px; display: block;">
    //           </td>
    //       </tr>
    //       <tr>
    //           <td style="padding: 40px;">
    //               <h3 style="color: #004080; margin-top: 0;">Dear ${FirstName},</h3>
    //               <p>Welcome to QRight! We are thrilled to have you on board and look forward to providing you with a seamless and efficient queue management experience. Your account has been successfully registered, and you are now ready to take advantage of all the features and benefits QRight has to offer.</p>
    //               <p>You can log in to your account using the following link:</p>
    //               <p style="text-align: center;">
    //                   <a href="${verificationLink}" style="background: #0073e6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Log In to Your Account</a>
    //               </p>
    //               <p>If you have any questions or need assistance, our customer support team is here to help. You can reach us at support@qright.com or call us at +234 817 079 5643.</p>
    //               <p>Thank you for choosing QRight. We look forward to serving you!</p>
    //               <p>Best regards,<br />
    //                  The QRight Team</p>
    //               <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
    //               <p style="text-align: center; font-size: 12px; color: #666;">&copy; 2024 QRight. All rights reserved.<br>You are receiving this email because you signed up on our platform.</p>
    //           </td>
    //       </tr>
    //   </table>
    //          `,
    //       attachments: [
    //         {
    //           filename: "logo.png",
    //           path: "./logo.png",
    //           cid: "logo",
    //         },
    //       ],
    //     };

    //     transporter.sendMail(mailOptions, function (error, info) {
    //       if (error) {
    //         console.log("Error sending mail ", error);
    //       } else {
    //         console.log("Email sent: " + info.response);
    //       }
    //     });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Validation error", details: err.errors });
    } else {
      console.error(err);
      res
        .status(500)
        .json({ error: "An error occurred, please try again later" });
    }
  }
};
