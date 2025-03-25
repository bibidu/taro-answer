import { View } from "@tarojs/components";

export default function ExpandIcon() {
  return (
    <>
      <View className="w-full mt-1 flex justify-center">
        <View className="w-10 h-1 bg-gray-300 rounded"></View>
      </View>
      <View className="w-full mt-1 mb-4 flex justify-center">
        <View className="w-4 h-1 bg-gray-300 rounded"></View>
      </View>
    </>
  );
}
