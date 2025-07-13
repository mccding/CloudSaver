import { apiAdapter } from "@/utils/apiAdapter";
import type { GlobalSettingAttributes, UserSettingAttributes } from "@/types";

export const settingApi = {
  async getSetting() {
    return await apiAdapter.getSettings();
  },
  async saveSetting(data: {
    userSettings: UserSettingAttributes;
    globalSetting?: GlobalSettingAttributes | null;
  }) {
    return await apiAdapter.saveSettings(data);
  },
};
