import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1E3A8A",
};

export const metadata: Metadata = {
  title: "설악디엘본아파트톡 - 420세대 입주민 전용 스마트 커뮤니티 & 메신저",
  description: "설악디엘본아파트 입주민, 동대표, 관리사무소를 위한 실시간 카카오톡형 소통 플랫폼",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "디엘본톡",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased select-none">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
