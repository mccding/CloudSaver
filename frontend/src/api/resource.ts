import { apiAdapter } from "@/utils/apiAdapter";
import type { Resource } from "@/types/index";

export const resourceApi = {
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    return await apiAdapter.search(keyword, channelId, lastMessageId);
  },
};
