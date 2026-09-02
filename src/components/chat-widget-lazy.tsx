"use client";

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("./chat-widget").then((m) => m.ChatWidget), {
  ssr: false,
  loading: () => null,
});

export { ChatWidget };
