import Image from "next/image";
import React, { useEffect, type FC } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { CreateTweet } from "./CreateTweet";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocal from "dayjs/plugin/updateLocale";
import dayjs from "dayjs";
import useScrollPosition from "~/hooks/useScrollPosition";

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

type TweetProps = {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
};

const Tweet: FC<TweetProps> = ({ tweet }) => {
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

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, scrollPosition]);

  return (
    <div>
      <CreateTweet />
      <div className="border-l-2 border-r-2 border-t-2 border-gray-500">
        {tweets.map((tweet) => (
          <Tweet tweet={tweet} key={tweet.id} />
        ))}
      </div>
      {!hasNextPage && <p>No more items to load</p>}
    </div>
  );
};

export default Timeline;
