import { apiAdapter } from "@/utils/apiAdapter";
import type { ShareInfoResponse, Folder, SaveFileParams, GetShareInfoParams } from "@/types";

export const cloud115Api = {
  async getShareInfo(params: GetShareInfoParams) {
    const result = await apiAdapter.getCloudShareInfo("cloud115", params);
    return result.data as ShareInfoResponse;
  },

  async getFolderList(parentCid = "0") {
    return await apiAdapter.getCloudFolders("cloud115", parentCid);
  },

  async saveFile(params: SaveFileParams) {
    return await apiAdapter.saveCloudFile("cloud115", params);
  },
};
