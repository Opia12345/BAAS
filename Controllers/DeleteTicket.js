const { Queue } = require("../Models/User");

exports.DeleteTicket = async (req, res) => {
  try {
    const ticket = await Queue.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).send("Ticket not found");
    }
    res.send({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};
