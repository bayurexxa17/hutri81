export type View =
  | "home"
  | "packages"
  | "package-stream"
  | "package-stream-plus"
  | "package-suka-suka"
  | "package-apartment"
  | "package-addon"
  | "news"
  | "news-detail"
  | "help"
  | "contact"
  | "subscribe"
  | "selfcare"
  | "check-area"
  | "local-homebase"
  | "internet-rumah"
  | "internet-apartemen"
  | "rt-login"
  | "rt-admin"
  | "admin-login"
  | "admin-dashboard";

export type ActivityLog = {
  id: string;
  ts: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
};


export type NewsArticle = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
};

export type { Member } from "./lib/realtime";
