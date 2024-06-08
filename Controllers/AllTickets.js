const { Queue } = require("../Models/User");

exports.AllTickets = async (req, res) => {
  try {
    const tickets = await Queue.find();
    if (tickets.length === 0) {
      return res.status(404).json({ message: "No tickets available" });
    }
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
