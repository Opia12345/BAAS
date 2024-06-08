const { Queue, User } = require("../Models/User");
const yup = require("yup");

const getSessionTime = (currentTime) => {
  const hours = currentTime.getHours();
  if (hours >= 8 && hours < 10) {
    return "8-10";
  } else if (hours >= 10 && hours < 12) {
    return "10-12";
  } else if (hours >= 12 && hours < 14) {
    return "12-2";
  } else if (hours >= 14 && hours < 16) {
    return "2-4";
  } else {
    return "No available sessions, Please try again tomorrow.";
  }
};

const Validation = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please use a valid email address")
    .required("Email is required"),
  description: yup.string().required("Description is required"),
});

// Generate a special ticket
exports.GenerateTicket = async (req, res) => {
  const { name, email, description } = req.body;

  try {
    const validationSchema = Validation;
    await validationSchema.validate(
      { name, email, description },
      { abortEarly: false }
    );

    // Check if user and service exist
    const user = await User.findOne({ name });
    const userMail = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!userMail) {
      return res.status(404).send("User with provided email not found");
    }

    // Generate a unique ticket number
    const lastTicket = await Queue.findOne().sort({ ticketNumber: -1 });
    const ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

    // Determine the session time
    const currentTime = new Date();
    const sessionTime = getSessionTime(currentTime);

    // Create new ticket
    const ticket = new Queue({
      name,
      email,
      ticketNumber,
      sessionTime: sessionTime,
      description,
    });

    await ticket.save();
    res.status(201).send(ticket);
  } catch (error) {
    res.status(500).send(error.message);
  }
};
