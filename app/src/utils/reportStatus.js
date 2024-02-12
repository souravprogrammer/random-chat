import { ReportUserModel } from "../model/Report.model.js";
async function getReportStatus() {
  const reportedUser = await ReportUserModel.findOne({ deviceToken });
}

export default getReportStatus;
