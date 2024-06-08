const { Queue, User } = require("../Models/User");
const yup = require("yup");

const MAX_USERS_PER_SESSION = 15;

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
    return null;
  }
};

const getNextAvailableSession = async (currentTime) => {
  const sessions = ["8-10", "10-12", "12-2", "2-4"];
  for (const session of sessions) {
    const sessionUsers = await Queue.countDocuments({ sessionTime: session });
    if (sessionUsers < MAX_USERS_PER_SESSION) {
      return session;
    }
  }
  return null;
};

const Validation = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Please use a valid email address")
    .required("Email is required"),
  description: yup.string().required("Description is required"),
});

exports.GenerateTicket = async (req, res) => {
  const { name, email, description } = req.body;

  try {
    const validationSchema = Validation;
    await validationSchema.validate(
      { name, email, description },
      { abortEarly: false }
    );

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingTicket = await Queue.findOne({ email });

    if (existingTicket) {
      return res
        .status(400)
        .json({ error: "User has already booked a ticket" });
    }

    const currentTime = new Date();
    let sessionTime = getSessionTime(currentTime);

    while (sessionTime) {
      const sessionUsers = await Queue.countDocuments({ sessionTime });
      if (sessionUsers < MAX_USERS_PER_SESSION) {
        break;
      }
      sessionTime = await getNextAvailableSession(currentTime);
    }

    if (!sessionTime) {
      return res
        .status(400)
        .json({ error: "No available sessions, Please try again tomorrow." });
    }

    const lastTicket = await Queue.findOne().sort({ ticketNumber: -1 });
    const ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;

    const ticket = new Queue({
      name,
      email,
      ticketNumber,
      sessionTime: sessionTime,
      description,
      status: "waiting",
      issueTime: currentTime,
    });

    await ticket.save();
    res.status(201).json({
      ticketId: ticket._id,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = error.inner.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }

    res.status(500).json({ error: error.message });
  }
};
