import fetch from "node-fetch";
import crypto from "crypto";
import OAuth from "oauth-1.0a";

export default class Instapaper {
  baseURL = "https://www.instapaper.com/api/";
  user: string | null = null;
  password: string | null = null;
  token: string | null = null;
  authorizing = null;
  consumer_key: string | null = null;
  consumer_secret: string | null = null;
  oauth: string | null = null;

  constructor(consumer_key: string, consumer_secret: string) {
    this.consumer_key = consumer_key;
    this.consumer_secret = consumer_secret;
    this.oauth = this.createOAuth();
  }

  createOAuth = () => {
    return OAuth({
      consumer: { key: this.consumer_key, secret: this.consumer_secret },
      signature_method: "HMAC-SHA1",
      hash_function: (base_string: string, key: string) =>
        crypto.createHmac("sha1", key).update(base_string).digest("base64"),
    });
  };

  setCredentials(user: string, password: string) {
    this.user = user;
    this.password = password;
  }

  authorize = () => {
    return new Promise((resolve, reject) => {
      if (this.token) {
        return resolve(this);
      }

      if (this.authorizing) {
        return resolve(this.authorizing);
      }

      if (!this.user || !this.password) {
        return reject("please input valid username and password");
      }

      const options = this.buildAuthOption("1/oauth/access_token", {
        format: "qline",
        data: {
          x_auth_username: this.user,
          x_auth_password: this.password,
          x_auth_mode: "client_auth",
        },
      });

      this.authorizing = fetch(options)
        .then((response) => response.json())
        .then((data) => {
          const token = data.split("&").reduce((acc, current) => {
            const [key, val] = current.split("=");
            acc[key] = val;
            return acc;
          }, {});

          this.token = {
            key: token.oauth_token,
            secret: token.oauth_token_secret,
          };

          this.authorizing = null;
          resolve(this);
        })
        .catch((error) => {
          this.authorizing = null;
          reject(error);
        });
    });
  };

  buildAuthOption = (url, params = {}) => {
    const options = {
      ...params,
      method: "POST",
      url: this.baseURL + url,
      json: true,
    };

    options.form = this.oauth.authorize(options);

    if (this.token) {
      options.headers = this.oauth.toHeader(this.oauth.authorize(options, this.token));
    }
    return options;
  };

  request = (url, params = {}, version = "1") => {
    return this.authorize()
      .then(() => this.buildAuthOption(version + url, { data: params }))
      .then((options) => fetch(options));
  };

  verifyCredentials = () => this.request("/account/verify_credentials");

  list = (params = {}) => this.request("/bookmarks/list", params);

  add = (params = {}) => this.request("/bookmarks/add", params);
}
