import { tweetSchema } from "~/components/CreateTweet";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure.input(tweetSchema).mutation(({ ctx, input }) => {
    const { prisma, session } = ctx;
    const userId = session.user.id;
    const { text } = input;
    return prisma.tweet.create({
      data: {
        text,
        author: {
          connect: { id: userId },
        },
      },
    });
  }),
});
