import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.css";

export default function Index() {
  return (
    <View className="flex flex-col items-center justify-center min-h-screen bg-white relative">
      <Text
        className="iconfont icon-setting absolute top-4 right-8 w-5 h-5 text-3xl"
        onClick={() => {
          Taro.navigateTo({ url: "/pages/settings/index" });
        }}
      ></Text>

      <View className="flex flex-col items-center justify-center flex-1 w-full ">
        <View className="text-3xl font-bold mb-4 font-heading">已打卡天数</View>
        <View className="text-6xl font-extrabold font-heading">2</View>
        <View className="bg-white shadow-md rounded-lg  mt-4 w-[90%] border border-black">
          <View className="flex items-center pl-4">
            <View className="w-20 h-20 mr-4 border border-black rounded-sm flex items-center justify-center">
              CET4
            </View>
            <View className="flex-1 p-4">
              <View className="text-lg font-semibold font-heading">
                四级词汇书
              </View>

              <View className="relative mt-2">
                <View className="h-2 bg-gray-200 rounded-full">
                  <View
                    className="h-2 bg-black rounded-full"
                    style={{ width: "10%" }}
                  ></View>
                </View>
                <View className=" w-full text-sm text-right mt-1">3/321</View>
              </View>
            </View>
          </View>
        </View>
        <Button
          className="w-full fixed bottom-0 inset-x-0 bg-black text-white py-2 px-4 font-heading hover:bg-gray-800 transition duration-200"
          onClick={() => {
            Taro.navigateTo({ url: "/pages/answer/index" });
          }}
        >
          开始学习
          <View className="safe-pb"></View>
        </Button>
      </View>
    </View>
  );
}
