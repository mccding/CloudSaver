import { apiAdapter } from "@/utils/apiAdapter";

export const userApi = {
  login: async (data: { username: string; password: string }) => {
    return await apiAdapter.login(data.username, data.password);
  },
  register: async (data: { username: string; password: string; registerCode: string }) => {
    return await apiAdapter.register(data.username, data.password, data.registerCode);
  },
  getSponsors: async () => {
    return await apiAdapter.getSponsors();
  },
};
