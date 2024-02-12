import { ReportUserModel } from "../model/Report.model.js";
async function getReportStatus({ deviceToken = "" }) {
  try {
    const reportedUser = await ReportUserModel.findOne({ deviceToken });
    if (!reportedUser) return false;
    return reportedUser?.reportCount > 5;
  } catch (err) {
    return false;
  }
}

export default getReportStatus;
