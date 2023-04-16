import { type FormEvent, useState } from "react";
import { z } from "zod";
import { api } from "~/utils/api";

export const tweetSchema = z.object({
  text: z.string({ required_error: "Tweet text is required" }).min(10).max(280),
});

export const CreateTweet = () => {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const { mutateAsync } = api.tweet.create.useMutation();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      tweetSchema.parse({ text });
    } catch ({ message }) {
      setError(message as string);
      return;
    }

    void mutateAsync({ text });
  };
  return (
    <>
      {error && JSON.stringify(error)}
      <form onSubmit={handleSubmit} className="rounder-md mb-4 flex w-full flex-col border-2 p-4">
        <textarea onChange={(e) => setText(e.target.value)} className="w-full p-4 shadow"></textarea>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="bg-primary rounded-md px-4 py-2 text-white">
            Tweet
          </button>
        </div>
      </form>
    </>
  );
};
