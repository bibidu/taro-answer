import React, { useState, useEffect } from "react";
import {
  View,
  Input,
  RadioGroup,
  Radio,
  Text,
  Switch,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import ExpandIcon from '../../components/expand-icon'
import { defaultSettings} from './constant'


const CustomSwitch = ({ checked, onCheckedChange }) => {
  return (
    <View className="relative">
      <Switch
        checked={checked}
        onChange={(e) => onCheckedChange(e.detail.value)}
      />
    </View>
  );
};

const SettingsPage = () => {
  // 状态管理
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // 从缓存加载设置
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = Taro.getStorageSync("settings");
        console.log("dxz savedSettings", savedSettings);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
      }
      setSettingsLoaded(true);
    };

    loadSettings();
  }, []);

  // 更新设置并保存到缓存
  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      Taro.setStorageSync("settings", JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  };

  // 处理倒计时时间输入
  const handleTimerDurationChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateSettings({ timerDuration: Math.min(value, 15) });
    } else if (e.target.value === "") {
      // 允许清空输入框，但不更新状态
      e.target.value = "";
    } else {
      // 如果输入无效或为0，恢复到之前的值
      e.target.value = settings.timerDuration.toString();
    }
  };

  // 获取主题颜色的显示名称
  const getColorThemeName = (theme) => {
    switch (theme) {
      case "dark":
        return "黑色";
      case "light":
        return "白色";
      default:
        return theme;
    }
  };

  // 如果设置尚未加载，显示加载状态
  if (!settingsLoaded) {
    return (
      <View className="flex items-center justify-center h-screen">
        加载中...
      </View>
    );
  }

  return (
    <View className="flex flex-col min-h-screen bg-white p-6">
      {/* <Text className="text-2xl font-bold mb-8">设置</Text> */}
      {/* 当前设置的摘要 */}
      {/* <View className="mb-6 p-3 bg-gray-50 rounded-md text-sm">
        <h3 className="font-semibold mb-2">当前设置</h3>
        <p>主题: {getColorThemeName(settings.colorTheme)}</p>
        <p>倒计时: {settings.showTimer ? "开启" : "关闭"}</p>
        {settings.showTimer && (
          <>
            <p>倒计时时间: {settings.timerDuration}秒</p>
            <p>自动切换: {settings.autoSwitch ? "开启" : "关闭"}</p>
          </>
        )}
        <p>显示进度: {settings.showProgress ? "开启" : "关闭"}</p>
        <p>显示正确结果: {settings.respondInRealTime ? "开启" : "关闭"}</p>
      </View> */}

      {/* 基础设置部分 */}
      <View className="mb-8">
        <Text className="text-xl font-semibold mb-4">基础</Text>

        <View className="mb-4">
          <View className="flex justify-between items-center">
            <Text className="text-sm">主题配色</Text>
          </View>

          <View className="ml-4 mt-2 p-3 bg-gray-100 rounded-md">
            <RadioGroup
              onChange={(e) => {
                updateSettings({ colorTheme: e.detail.value });
              }}
              className="flex flex-col space-y-3"
            >
              <View className="flex items-center justify-between">
                <View className="w-16 h-8 bg-black rounded-md"></View>
                <Radio
                  value="dark"
                  checked={settings.colorTheme === "dark"}
                  className="radio"
                />
              </View>
            </RadioGroup>
          </View>
        </View>
      </View>

      {/* 答题设置部分 */}
      <View>
        <Text className="text-xl font-semibold mb-4">答题</Text>

        <View className="mb-4">
          <View className="flex justify-between items-center">
            <Text className="text-sm">倒计时</Text>
          </View>

          {/* 子选项容器 - 只在showTimer为true时显示 */}
          <View className="ml-4 mt-2 p-3 bg-gray-100 rounded-md">
            <View className="flex justify-between items-center">
              <Text className="text-sm">展示</Text>
              <CustomSwitch
                checked={settings.showTimer}
                onCheckedChange={(checked) =>
                  updateSettings({
                    showTimer: checked,
                    ...(checked
                      ? {
                          timerDuration: defaultSettings.timerDuration,
                          autoSwitch: defaultSettings.autoSwitch,
                        }
                      : {
                          autoSwitch: false,
                          timerDuration: 0,
                        }),
                  })
                }
              />
            </View>

            {settings.showTimer && (
              <>
                <View className="my-3 flex justify-between items-center">
                  <Text className="text-sm">倒计时时间</Text>
                  <Input
                    type="number"
                    value={settings.timerDuration}
                    onInput={(e) => handleTimerDurationChange(e)}
                    className="w-16 h-8 border border-gray-300 focus:border-transparent focus:ring-0 focus:outline-none text-center"
                  />
                </View>
                <View className="flex justify-between items-center">
                  <Text className="text-sm">归零后自动切下一题</Text>
                  <CustomSwitch
                    checked={settings.autoSwitch}
                    onCheckedChange={(checked) =>
                      updateSettings({ autoSwitch: checked })
                    }
                  />
                </View>
              </>
            )}
          </View>
          <ExpandIcon />
        </View>

        <View className="mb-4 flex justify-between items-center">
          <Text className="text-sm">展示进度条</Text>
          <CustomSwitch
            checked={settings.showProgress}
            onCheckedChange={(checked) =>
              updateSettings({ showProgress: checked })
            }
          />
        </View>

        <View className="mb-4 flex justify-between items-center">
          <Text className="text-sm">实时展示题目结果</Text>
          <CustomSwitch
            checked={settings.respondInRealTime}
            onCheckedChange={(checked) =>
              updateSettings({ respondInRealTime: checked })
            }
          />
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;
