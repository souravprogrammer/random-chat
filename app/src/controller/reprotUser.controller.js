// import { users } from "../lib/socketHandler.js";
import { ReportUserModel } from "../model/Report.model.js";
async function reprotUser(req, res) {
  const report = req.body;
  const { deviceToken } = report;
  // const deviceToken = req?.cookies?.deviceToken;

  try {
    if (!deviceToken) {
      res.status(401).json({ message: "no user avilable" });
      return;
    }
    const reprotedObject = await ReportUserModel.findOneAndUpdate(
      { deviceToken: deviceToken }, // Query
      {
        $inc: { reportCount: 1 }, // Increment count by 1 if document exists
        $push: {
          report: {
            reason: report.reason,
            description: report?.description ?? "",
          },
        }, // Push the reason into the report array
        $setOnInsert: {
          // Set fields only during insert (upsert)
          deviceToken: deviceToken,
        },
      },
      { upsert: true, new: true } // Options
    );
    res.status(200).json({ message: "user reported successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong while reporting a user" });
  }
}
async function isBan(req, res) {
  const deviceToken = req?.cookies?.deviceToken;

  try {
    if (!deviceToken) {
      res.status(400).json({ message: "no user avilable", ban: false });
      return;
    }
    const reportedUser = await ReportUserModel.findOne({ deviceToken });

    if (!reportedUser || reportedUser?.reportCount <= 5) {
      res.status(200).json({ message: "good to go", ban: false });
      return;
    }
    if (reportedUser.reportCount > 5) {
      res.status(200).json({ message: "good to go", ban: true });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "something went wrong", ban: false, err: err.message });
  }
}

export { reprotUser, isBan };
