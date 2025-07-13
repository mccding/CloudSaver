import { apiAdapter } from "@/utils/apiAdapter";
import { HotListParams } from "@/types/douban";

export const doubanApi = {
  async getHotList(params: HotListParams) {
    const result = await apiAdapter.getDoubanHotList(params);
    return result.data;
  },
};
