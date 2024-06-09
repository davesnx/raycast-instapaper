import { showHUD } from "@raycast/api";
import Instapaper from "./instapaper";

const username = "your_username";
const password = "your_password";
const apiUrl = "https://www.instapaper.com/api/add";

async function addToInstapaper(url: string, title: string, selection: string) {
  const client = new Instapaper(KEY, SECRET);
  client.setCredentials(USERNAME, PASSWORD);

  client
    .add({ limit: 100 })
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
}

export default async function main() {
  const url = "http://example.com";
  const title = "Example Title";
  const selection = "Example text to save to Instapaper";
  addToInstapaper(url, title, selection);
}
