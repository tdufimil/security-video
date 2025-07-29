"use client";

import { useEffect, useState } from "react";

export default function NotifyPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 6秒後に表示
    const timeout = setTimeout(() => {
      setVisible(true);
    }, 9000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`
        fixed z-50 transition-all duration-700 ease-out rounded-lg
        right-4
        ${
          visible
            ? "bottom-4 opacity-100 translate-y-0"
            : "-bottom-80 opacity-0 translate-y-10"
        }
      `}
    >
      <img
        src="/images/winsecuritynotify.png"
        alt="警告通知"
        className="w-[370px] h-auto shadow-xl rounded-lg"
      />
    </div>
  );
}
