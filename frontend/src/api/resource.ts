import { apiAdapter } from "@/utils/apiAdapter";

export const resourceApi = {
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    return await apiAdapter.search(keyword, channelId, lastMessageId);
  },
};
