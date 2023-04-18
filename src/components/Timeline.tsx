import Image from "next/image";
import React, { useEffect, type FC } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { CreateTweet } from "./CreateTweet";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import dayjs from "dayjs";
import useScrollPosition from "~/hooks/useScrollPosition";
import { AiFillHeart } from "react-icons/ai";
import { InfiniteData, QueryClient, useQueryClient } from "@tanstack/react-query";

dayjs.extend(relativeTime);
dayjs.extend(updateLocal);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

type UpdateCacheArgs = {
  client: QueryClient;
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
};

const updateCache = ({ client, variables, data, action }: UpdateCacheArgs) => {
  client.setQueryData([["tweet", "timeline"], { input: { limit: 10 }, type: "infinite" }], (oldData) => {
    console.log(oldData);
    const newData = oldData as InfiniteData<RouterOutputs["tweet"]["timeline"]>;
    const newTweets = newData.pages.map((page) => {
      return {
        tweets: page.tweets.map((tweet) => {
          if (tweet.id === variables.tweetId) return { ...tweet, likes: action === "like" ? [data.userId] : [] };
          return tweet;
        }),
      };
    });
    return {
      ...newData,
      pages: newTweets,
    };
  });
};

type TweetProps = {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  client: QueryClient;
};

const Tweet: FC<TweetProps> = ({ tweet, client }) => {
  const likeMutation = api.tweet.like.useMutation({
    onSuccess: (data, variables) => updateCache({ client, data, variables, action: "like" }),
  }).mutateAsync;
  const unlikeMutation = api.tweet.unlike.useMutation({
    onSuccess: (data, variables) => updateCache({ client, data, variables, action: "unlike" }),
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;
  return (
    <div className="mb-4 border-b-2 border-gray-500">
      <div className="flex p-2">
        {tweet.author.image && tweet.author.name && (
          <Image src={tweet.author.image} alt={`${tweet.author.name} profile picture`} width="48" height="48" className="rounded-full" />
        )}
        <div className="ml-2">
          <div className="align-center flex">
            <p className="font-bold">{tweet.author.name}</p>
            <p className="text-sm text-gray-500"> - {dayjs(tweet.createdAt).fromNow()}</p>
          </div>
          <div>{tweet.text}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center p-2">
        <AiFillHeart
          onClick={() => {
            if (hasLiked) void unlikeMutation({ tweetId: tweet.id });
            else void likeMutation({ tweetId: tweet.id });
          }}
          size="1.5rem"
          color={hasLiked ? "red" : "grey"}
        />
        <span className="text-sm text-gray-500">10</span>
      </div>
    </div>
  );
};

const Timeline = () => {
  const { data, hasNextPage, fetchNextPage, isFetching } = api.tweet.timeline.useInfiniteQuery(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );
  const { scrollPosition } = useScrollPosition();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  const client = useQueryClient();

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, scrollPosition]);

  return (
    <div>
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet tweet={tweet} key={tweet.id} client={client} />
        ))}
      </div>
      {!hasNextPage && <p>No more items to load</p>}
    </div>
  );
};

export default Timeline;
