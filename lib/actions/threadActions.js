"use server"

import { revalidatePath } from "next/cache";
import UserModel from "../models/userModel";
import { connectToDB } from "../mongoose"
import ThreadModel from '@/lib/models/threadModel'

export async function createThread({text, author, communityId, path}) {
    try {
        await connectToDB();
        const createdThread = await ThreadModel.create({
            text,
            author,
            community: null,
        });

        await UserModel.findByIdAndUpdate(author, {
            $push: {threads: createdThread._id}
        })

        revalidatePath(path)
        
    } catch (error) {
        throw new Error(`Failed to create thread: ${error.message}`)
    }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    try {
        await connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize;

        const threadsQuery = ThreadModel
        .find({parentId: {$in: [null, undefined]} })
        .sort({createdAt: 'desc'})
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: 'author', model: UserModel})
        .populate({ 
            path: 'children',
            populate: { 
                path: 'author',
                model: UserModel,
                select: '_id name parentId image'
            }
        });

        const totalThreadsCount = await ThreadModel.countDocuments({ parentId: { $in: [null, undefined] }})

        const threads = await threadsQuery.exec();

        const isNext = totalThreadsCount > skipAmount + threads.length;

        return {threads, isNext};

    } catch (error) {
        throw new Error(`Failed to fetch threads: ${error.message}`)
    }
}

export async function fetchThreadById(id) {
  try {
    await connectToDB();

    // TODO: populate community
    const thread = await ThreadModel
      .findById(id)
      .populate({
        path: 'author',
        model: UserModel,
        select: '_id id name image'
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: UserModel,
            select: '_id id name parentId image'
          },
          {
            path: 'children',
            model: ThreadModel,
            populate: {
              path: 'author',
              model: UserModel,
              select: '_id id name parentId image'
            }
          }
        ]
      }).exec();

      return thread;
  } catch (error) {
    throw new Error(`Failed to fetch thread: ${error.message}`)
  }
}

export async function addCommentToThread(threadId, commentText, userId, path) {
  try {
    await connectToDB();

    threadId = JSON.parse(threadId);

    const originalThread = await ThreadModel.find({threadId});

    if(!originalThread) throw new Error('Thread not found');

    const commentThread = new ThreadModel({
      text: commentText,
      author: userId,
      parentId: threadId
    });
  
    const savedCommentThread = await commentThread.save();

    await ThreadModel.findByIdAndUpdate(threadId, {
            $push: {children: savedCommentThread._id}
    })

    revalidatePath(path);

  } catch (error) {
    throw new Error(`Error adding comment to thread:  ${error.message}`)
  }
}