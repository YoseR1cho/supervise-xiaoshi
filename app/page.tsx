"use client";

import { useState, useEffect } from "react";

// 自定义提示框组件
const NotificationToast = ({
    message,
    type = "info",
    onClose,
}: {
    message: string;
    type?: "success" | "warning" | "info";
    onClose: () => void;
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // 等待动画完成
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getIcon = () => {
        switch (type) {
            case "success":
                return (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
            case "warning":
                return (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                );
        }
    };

    const getBgColor = () => {
        switch (type) {
            case "success":
                return "bg-gradient-to-r from-green-400 to-emerald-500";
            case "warning":
                return "bg-gradient-to-r from-orange-400 to-red-500";
            default:
                return "bg-gradient-to-r from-pink-400 to-purple-500";
        }
    };

    return (
        <div
            className={`
      fixed top-6 right-6 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    `}
        >
            <div
                className={`
        ${getBgColor()}
        rounded-2xl shadow-2xl p-4 text-white
        border-2 border-white/20
        backdrop-blur-sm
      `}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">{getIcon()}</div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsVisible(false);
                            setTimeout(onClose, 300);
                        }}
                        className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Home() {
    const [state, setState] = useState<"selecting" | "counting" | "completed">(
        "selecting"
    );
    const [selectedTime, setSelectedTime] = useState<number>(25 * 60); // 默认25分钟
    const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
    const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
    const [notification, setNotification] = useState<{
        message: string;
        type: "success" | "warning" | "info";
        id: number;
    } | null>(null);
    const [customTime, setCustomTime] = useState<string>("");
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

    // 时间选项
    const timeOptions = [
        { label: "15分钟", value: 15 * 60 },
        { label: "25分钟", value: 25 * 60 },
        { label: "45分钟", value: 45 * 60 },
        { label: "60分钟", value: 60 * 60 },
    ];

    // 处理自定义时间输入
    const handleCustomTimeChange = (value: string) => {
        // 只允许输入数字
        const numericValue = value.replace(/\D/g, "");
        setCustomTime(numericValue);

        if (numericValue && parseInt(numericValue) > 0) {
            setSelectedTime(parseInt(numericValue) * 60);
        }
    };

    // 验证自定义时间
    const validateCustomTime = () => {
        if (!customTime) {
            showNotification("请输入自定义时间", "warning");
            return false;
        }

        const minutes = parseInt(customTime);
        if (minutes <= 0 || minutes > 240) {
            showNotification("请输入1-240分钟之间的时间", "warning");
            return false;
        }

        return true;
    };

    // 确认自定义时间
    const confirmCustomTime = () => {
        if (validateCustomTime()) {
            setShowCustomInput(false);
            showNotification(`已设置自定义时间：${customTime}分钟`, "info");
        }
    };

    // 开始计时
    const startTimer = () => {
        setState("counting");
        setTimeLeft(selectedTime);
        const id = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    setState("completed");
                    showNotification(
                        "小诗老师真厉害，又自律了一把！",
                        "success"
                    );
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setTimerId(id);
    };

    // 提前结束计时
    const stopTimer = () => {
        if (timerId) {
            clearInterval(timerId);
            setTimerId(null);
            setState("selecting");
            notifyDeveloper();
            showNotification("小诗老师请认真学习！", "warning");
        }
    };

    // 格式化时间为年-月-日 几点-几分-几秒
    const formatCurrentTime = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 通知开发者
    const notifyDeveloper = () => {
        const currentTime = formatCurrentTime();
        console.log("通知开发者：用户提前结束了学习", currentTime);

        // 实际项目中可以使用fetch或axios调用API
        fetch(
            `https://push.spug.cc/send/4NbKBjzNqdjpxWeP?key1=${encodeURIComponent(
                "小诗又玩手机啦啊啊啊啊啊啊，快去问问她怎么又玩上了!"
            )}&key2=${encodeURIComponent(currentTime)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).catch((error) => {
            console.error("API调用失败:", error);
        });
    };

    // 显示通知
    const showNotification = (
        message: string,
        type: "success" | "warning" | "info" = "info"
    ) => {
        setNotification({
            message,
            type,
            id: Date.now(),
        });
    };

    // 格式化时间
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
    };

    // 监听页面可见性变化
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (state === "counting" && document.hidden) {
                stopTimer();
            }
        };

        const handleBeforeUnload = () => {
            if (state === "counting") {
                notifyDeveloper();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("beforeunload", handleBeforeUnload);
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [state, timerId]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-center fixed top-48 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                    小诗的自习室
                </span>
            </h1>
            <div className="w-full max-w-md mt-20">
                {state === "selecting" && (
                    <div className="card">
                        <h2 className="text-xl font-semibold mb-6 text-center">
                            选择学习时间
                        </h2>
                        <div className="flex flex-wrap justify-center">
                            {timeOptions.map((option) => (
                                <div
                                    key={option.value}
                                    className={`time-option ${
                                        selectedTime === option.value
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedTime(option.value);
                                        setShowCustomInput(false);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))}

                            {/* 自定义时间选项 */}
                            <div
                                className={`time-option ${
                                    showCustomInput ? "selected" : ""
                                }`}
                                onClick={() => {
                                    setShowCustomInput(!showCustomInput);
                                    if (!showCustomInput && customTime) {
                                        setSelectedTime(
                                            parseInt(customTime) * 60
                                        );
                                    }
                                }}
                            >
                                自定义时间
                            </div>
                        </div>

                        {/* 自定义时间输入框 */}
                        {showCustomInput && (
                            <div className="mt-6 p-4 bg-pink-50 rounded-xl border-2 border-pink-200">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={customTime}
                                        onChange={(e) =>
                                            handleCustomTimeChange(
                                                e.target.value
                                            )
                                        }
                                        placeholder="输入分钟数"
                                        className="flex-1 px-4 py-2 rounded-lg border-2 border-pink-300 focus:border-pink-500 focus:outline-none"
                                        maxLength={3}
                                    />
                                    <span className="text-pink-600 font-medium">
                                        分钟
                                    </span>
                                    <button
                                        onClick={confirmCustomTime}
                                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                                    >
                                        确认
                                    </button>
                                </div>
                                <p className="text-xs text-pink-500 mt-2">
                                    小诗快输入1-240分钟之间的时间
                                </p>
                            </div>
                        )}
                        <button
                            className="btn-pink w-full mt-8"
                            onClick={startTimer}
                        >
                            小诗现在就开始学
                        </button>
                    </div>
                )}

                {state === "counting" && (
                    <div className="card text-center">
                        <h2 className="text-xl font-semibold mb-6">学习中</h2>
                        <div className="timer mb-8">{formatTime(timeLeft)}</div>
                        <button className="btn-pink w-full" onClick={stopTimer}>
                            提前结束
                        </button>
                    </div>
                )}

                {state === "completed" && (
                    <div className="card text-center">
                        <h2 className="text-xl font-semibold mb-6">
                            学习完成！
                        </h2>
                        <p className="text-lg mb-8">
                            小诗老师你是我的神，又自律了一把！
                        </p>
                        <button
                            className="btn-pink w-full"
                            onClick={() => setState("selecting")}
                        >
                            重新开始
                        </button>
                    </div>
                )}
            </div>

            {/* 自定义提示框 */}
            {notification && (
                <NotificationToast
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}
