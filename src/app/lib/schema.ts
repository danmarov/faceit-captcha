import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  uuid,
  inet,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const actionResultEnum = pgEnum("action_result", [
  "white",
  "black",
  "block",
]);
export const actionTypeEnum = pgEnum("action_type", [
  "load",
  "redirect",
  "iframe",
]);

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey(),
  name: varchar("name"),
  referrerCf: text("referrer_cf"),
  urlCf: text("url_cf"),
  httpReferer: text("http_referer"),
  queryString: text("query_string"),
  checkAdresses: boolean("check_adresses"),
  whitePage: text("white_page").notNull(),
  blackPage: text("black_page").notNull(),
  date: timestamp("date"),
});

export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey(),
  companyId: varchar("company_id").notNull(),
  checkAdresses: boolean("check_adresses"),
  url: text("url").notNull(),
  date: timestamp("date"),
});

export const addresses = pgTable("addresses", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  companyId: varchar("company_id"),
  address: inet("address").notNull(),
  type: actionResultEnum("type").notNull(),
  date: timestamp("date"),
});

export const requests = pgTable("requests", {
  id: uuid("id")
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  companyId: varchar("company_id"),
  token: varchar("token"),
  referrerCf: text("referrer_cf"),
  urlCf: text("url_cf"),
  queryString: text("query_string"),
  httpReferer: text("http_referer"),
  httpUserAgent: text("http_user_agent"),
  remoteAddr: varchar("remote_addr"),
  httpCfConnectingIp: varchar("http_cf_connecting_ip"),
  cfConnectingIp: varchar("cf_connecting_ip"),
  xForwardedFor: varchar("x_forwarded_for"),
  trueClientIp: varchar("true_client_ip"),
  action: actionResultEnum("action").notNull(),
  actionPage: text("action_page").notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  date: timestamp("date"),
});
