import { apiAdapter } from "@/utils/apiAdapter";
import type { ShareInfoResponse, SaveFileParams, GetShareInfoParams } from "@/types";

export const quarkApi = {
  async getShareInfo(params: GetShareInfoParams) {
    const result = await apiAdapter.getCloudShareInfo("quark", params);
    return result.data as ShareInfoResponse;
  },

  async getFolderList(parentCid = "0") {
    return await apiAdapter.getCloudFolders("quark", parentCid);
  },

  async saveFile(params: SaveFileParams) {
    return await apiAdapter.saveCloudFile("quark", params);
  },
};
