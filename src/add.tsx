import * as React from "react";
import { getPreferenceValues, showHUD, ActionPanel, Form, showToast, Action, Toast } from "@raycast/api";
import Instapaper from "./instapaper";

const KEY = "";
const SECRET = "";

async function failure(message: string) {
  await showToast(Toast.Style.Failure, "Error", message);
}

async function addToInstapaper(username: string, password: string, url: string) {
  const client = new Instapaper({
    consumer_key: KEY,
    consumer_secret: SECRET,
    username,
    password,
  });

  return client.add(url);
}

interface FormValues {
  url: string | null;
}

export default function Command() {
  const { username, password } = getPreferenceValues();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function handleSubmit(values: FormValues) {
    setIsLoading(true);
    let url = values.url;

    if (!url) {
      await failure("URL is required");
      setIsLoading(false);
      return;
    }

    if (URL.canParse(`https://${url}`)) {
      url = `https://${url}`;
    }

    if (!URL.canParse(url)) {
      await failure("URL looks wrongly formatted");
      setIsLoading(false);
    }

    try {
      const response = await addToInstapaper(username, password, url);
      if (response.ok) {
        setIsLoading(false);
        await showHUD(`✅ "${values.url}" has been added into Instapaper`);
      } else {
        setIsLoading(false);
        throw response.error;
      }
    } catch (error: unknown) {
      setIsLoading(false);
      if (error && (error as Error).message) {
        await failure((error as Error).message.toString());
      } else {
        await failure("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="URL" placeholder="Enter a valid URL (https is implicit)" />
    </Form>
  );
}
