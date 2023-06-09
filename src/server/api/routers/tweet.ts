import { z } from "zod";
import { tweetSchema } from "~/components/CreateTweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

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
  timeline: publicProcedure
    .input(
      z.object({
        where: z.object({ author: z.object({ name: z.string() }).optional() }).optional(),
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { limit, cursor, where } = input;
      const userId = ctx.session?.user.id;
      const tweets = await prisma.tweet.findMany({
        where,
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          author: { select: { name: true, image: true, id: true } },
          likes: { where: { userId }, select: { userId: true } },
          _count: { select: { likes: true } },
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (tweets.length > limit) {
        const nextItem = tweets.pop() as (typeof tweets)[number];
        nextCursor = nextItem.id;
      }

      return { tweets, nextCursor };
    }),
  like: protectedProcedure.input(z.object({ tweetId: z.string() })).mutation(({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { prisma } = ctx;
    return prisma.like.create({
      data: {
        tweet: {
          connect: {
            id: input.tweetId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }),
  unlike: protectedProcedure.input(z.object({ tweetId: z.string() })).mutation(({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { prisma } = ctx;
    return prisma.like.delete({
      where: {
        tweetId_userId: { tweetId: input.tweetId, userId },
      },
    });
  }),
});
