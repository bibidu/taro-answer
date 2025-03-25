import Taro from "@tarojs/taro";
import { useState, useEffect, useRef } from "react";
import { View, Text, Button, Progress } from "@tarojs/components";
import useLatest from "../../hooks/useLatest";
import { defaultSettings } from "../settings/constant";

const words = [
  {
    word: "Good",
    options: ["好的; 棒的", "坏的", "一般的", "优秀的"],
    correct: 0,
  },
  {
    word: "Bad",
    options: ["好的", "坏的; 糟糕的", "一般的", "可怕的"],
    correct: 1,
  },
  {
    word: "Average",
    options: ["好的", "坏的", "一般的; 中等的", "普通的"],
    correct: 2,
  },
];

const CircularProgress = ({
  noAnimate,
  timerPercentage,
  strokeColor = "#3b82f6",
}) => (
  <Progress
    percent={timerPercentage}
    className="w-full h-2"
    strokeWidth={2}
    active={false}
    activeMode="forwards"
    activeColor={strokeColor}
    duration={10}
  />
);

const Card = ({ children }) => <View>{children}</View>;

export default function Answer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const currentQuestionRef = useLatest(currentQuestion);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const selectedOptionsRef = useLatest(selectedOptions);
  const goodRef = useRef(null);
  const [isLocked, setIsLocked] = useState(false);
  const [fade, setFade] = useState(false);

  const [stopSignal, setStopSignal] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // 从缓存读取 setting并useState暂存
  const [settings, setSettings] = useState(defaultSettings);
  const settingsRef = useLatest(settings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = Taro.getStorageSync("settings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          setTimeLeft(parsedSettings.timerDuration);
        }
      } catch (error) {
        console.error("Failed to load settings from localStorage:", error);
      }
      setSettingsLoaded(true);
    };

    loadSettings();
  }, []);
  useEffect(() => {
    if (!settingsRef.current.showTimer) return;
    if (timeLeft <= 0) {
      if (settingsRef.current.autoSwitch) {
        handleOptionClick(-1);
      }
      return;
    }
    if (stopSignal) return;

    const callback = () => {
      if (
        currentQuestionRef.current <= words.length - 1 &&
        selectedOptionsRef.current.length < words.length
      ) {
        setTimeLeft(timeLeft - 1);
      }
    };
    const timer = setTimeout(() => {
      callback();
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, stopSignal]);

  const progressPercentage = (selectedOptions.length / words.length) * 100;
  const timerPercentage = (timeLeft / settings.timerDuration) * 100;
  const handleOptionClick = (index) => {
    if (isLocked) return;
    if (selectedOptions.length === words.length) return;

    setSelectedOptions([...selectedOptions, index]);
    setIsLocked(true);
    setStopSignal(true);
    if (currentQuestion < words.length - 1) {
      setFade(true);
    }

    setTimeout(() => {
      setStopSignal(false);
      if (currentQuestion < words.length - 1) {
        setFade(false);
        setTimeLeft(settings.timerDuration);
        console.log("dxz next", currentQuestion + 1);
        setCurrentQuestion(currentQuestion + 1);
      } else {
      }
      setIsLocked(false);
    }, 600);
  };

  const finished = selectedOptions.length === words.length;

  if (!settingsLoaded) {
    return (
      <View className="w-full h-screen flex justify-center items-center">
        Loading...
      </View>
    );
  }

  return (
    <View className="w-full">
      {settings.showProgress && (
        <View className="w-full fixed top-0 left-0 px-4 py-2">
          <Progress
            percent={progressPercentage}
            className="h-2 rounded-full"
            strokeWidth={2}
            active
            activeMode="forwards"
            activeColor="black"
            duration={10}
          />
          <Text className="text-sm text-muted-foreground whitespace-nowrap">
            当前进度 {selectedOptions.length}/{words.length}
          </Text>
        </View>
      )}
      <View
        className={`w-full mx-auto p-10 flex flex-col gap-6 absolute top-[50%] translate-y-[-50%] transition-opacity duration-500 ${
          fade ? "opacity-0 delay-500" : "opacity-100"
        }`}
      >
        <View className="flex flex-col items-center gap-6 border-0 shadow-none">
          <View
            ref={goodRef}
            className={`text-4xl font-bold font-heading tracking-tight`}
          >
            {words[currentQuestion].word}
          </View>

          {settings.showTimer && (
            <View className="relative w-full">
              <View className=" inset-0 flex items-center justify-center">
                <Text className="text-black text-base">{timeLeft}s</Text>
              </View>
              {stopSignal ? (
                <CircularProgress
                  key={words[currentQuestion].word + "a"}
                  noAnimate
                  timerPercentage={timerPercentage}
                  strokeColor="#000000"
                />
              ) : (
                <CircularProgress
                  key={words[currentQuestion].word + "b"}
                  timerPercentage={timerPercentage}
                  strokeColor="#000000"
                />
              )}
            </View>
          )}

          <View className="w-full space-y-3 mt-4">
            {words[currentQuestion].options.map((option, index) => (
              <OptionButton
                key={words[currentQuestion].word + index}
                label={String.fromCharCode(65 + index)}
                text={option}
                onClick={() => handleOptionClick(index)}
                isLocked={finished || isLocked}
                correctIndex={words[currentQuestion].correct}
                currentIndex={index}
                useSelectedIndex={selectedOptions[currentQuestion]}
                respondInRealTime={settings.respondInRealTime}
              />
            ))}
          </View>
        </View>
      </View>

      {finished && (
        <View className="fixed bottom-0 left-0 w-full">
          <Button
            onClick={() => setIsActionSheetOpen(true)}
            className=" w-full py-4 bg-black text-white flex items-center justify-center"
          >
            查看结果
            <View className="safe-pb"></View>
          </Button>
        </View>
      )}

      {isActionSheetOpen && (
        <View
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setIsActionSheetOpen(false)}
        >
          <View
            className="bg-white rounded-lg p-4 w-11/12 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <View className="text-xl font-bold">结果</View>
            {words.map((word, index) => (
              <View key={index} className="mt-2">
                <Text>{word.word}: </Text>
                <Text
                  className={
                    selectedOptions[index] === word.correct
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {selectedOptions[index] === word.correct ? "正确" : "错误"}
                </Text>
                <View>
                  <Text>选项: </Text>
                  {word.options.map((option, i) => (
                    <Text
                      key={i}
                      className={
                        i === selectedOptions[index] ? "font-bold" : ""
                      }
                    >
                      {String.fromCharCode(65 + i)}. {option}{" "}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
            <Button
              className="w-full rounded-xl mt-4"
              onClick={() => Taro.redirectTo({ url: "/pages/index/index" })}
            >
              返回首页
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}

function OptionButton({
  label,
  text,
  onClick,
  isLocked,
  respondInRealTime,

  useSelectedIndex,
  correctIndex,
  currentIndex,
}) {
  let borderClass = "";

  if (respondInRealTime && useSelectedIndex !== undefined) {
    const isCurrentOptionCorrect = correctIndex === currentIndex;
    const isUserSelectCurrent = useSelectedIndex === currentIndex;

    if (isUserSelectCurrent) {
      borderClass = isCurrentOptionCorrect
        ? "border-green-500"
        : "border-red-500";
    } else {
      borderClass = isCurrentOptionCorrect ? "border-green-500" : "";
    }
  }
  console.log("dxz borderClass", { borderClass });
  return (
    <Button
      variant="outline"
      className={`w-full justify-start h-auto py-4 px-4 mb-2 font-normal text-base rounded-xl text-left border-4 border-solid border-black ${borderClass} font-heading`}
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
    >
      <Text className="text-primary mr-2 text-black">{label}.</Text>
      <Text className=" text-black">{text}</Text>
    </Button>
  );
}
