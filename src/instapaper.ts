import { createHmac } from "crypto";
import OAuth from "oauth-1.0a";
import fetch from "node-fetch";

const createOAuth = (key: string, secret: string) => {
  return new OAuth({
    consumer: { key, secret },
    signature_method: "HMAC-SHA1",
    hash_function: (base_string, key) => createHmac("sha1", key).update(base_string).digest("base64"),
  });
};

export default class Instapaper {
  private baseURL = "https://www.instapaper.com/api/";
  private username: string | undefined;
  private password: string | undefined;
  // public token: OAuth.Token | undefined;
  private oauth;

  constructor({
    username,
    password,
    consumer_key,
    consumer_secret,
  }: {
    username: string;
    password: string;
    consumer_key: string;
    consumer_secret: string;
  }) {
    this.username = username;
    this.password = password;
    this.oauth = createOAuth(consumer_key, consumer_secret);
  }

  async request(url: string, params = {}) {
    const endpoint = new URL(this.baseURL + url);
    const body = JSON.stringify(params);
    const auth = btoa(this.username + ":" + this.password);
    try {
      console.log(body);
      const response = await fetch(endpoint, {
        method: "POST",
        body,
        headers: {
          Authorization: "Basic " + auth,
        },
      });
      if (response.status === 200) {
        const json = await response.json();
        return { ok: true, data: json };
      } else if (response.status < 500 && response.status >= 400) {
        return { ok: false, status: response.status, error: new Error(response.statusText) };
      } else {
        return {
          ok: false,
          status: response.status,
          error: new Error("Something went wrong hitting the Instapaper API"),
        };
      }
    } catch (error) {
      return { ok: false, error: new Error("Something went wrong hitting the Instapaper API") };
    }
  }

  add = (url: string) => this.request("add", { url });
}
