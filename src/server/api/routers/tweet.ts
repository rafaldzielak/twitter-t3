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
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { limit, cursor } = input;
      const tweets = await prisma.tweet.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        include: { author: { select: { name: true, image: true, id: true } } },
      });
      return { tweets };
    }),
});
