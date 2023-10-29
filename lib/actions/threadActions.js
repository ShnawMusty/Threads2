"use server"

import { revalidatePath } from "next/cache";
import UserModel from "../models/userModel";
import ThreadModel from '@/lib/models/threadModel'
import CommunityModel from '@/lib/models/communityModel'
import { connectToDB } from "../mongoose"

export async function createThread({text, author, orgId, path}) {
    try {
        await connectToDB();

        const community = await CommunityModel.findOne({id: orgId}, {_id: 1});

        const createdThread = await ThreadModel.create({
            text,
            author,
            communityId: community._id || null,
        });

        await UserModel.findByIdAndUpdate(author, {
            $push: {threads: createdThread._id}
        })

        if (community) {
          await CommunityModel.findByIdAndUpdate(community._id,
            { $push: { threads: createdThread._id} }
          )
        }

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

export async function deleteThread(id, path) {
  try {
    await connectToDB();

    const mainThread = await ThreadModel
    .findById(id)
    .populate('author community');

    if (!mainThread) throw new Error('Thread not found');

    const descendantThreads = await fetchAllChildThreads(id);

    const descendantThreadsIds = [
      id,
      ...descendantThreads.map(thread => thread._id)
    ];
    
    const uniqueAuthorIds = new Set(
      [
        mainThread.author?._id?.toString(),
        ...descendantThreads.map(thread => thread.author?._id?.toString()),
      ]
    );


    const uniqueCommunityIds = new Set(
      [
        mainThread.communityId?._id?.toString(),
        ...descendantThreads.map(thread => thread.communityId?._id?.toString()),
      ].filter(id => id !== undefined)
    );

    await ThreadModel.deleteMany({_id: { $in: descendantThreadsIds }});

    await UserModel.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds)} },
      { $pull: { threads: { $in: descendantThreadsIds }}}
    );

    await CommunityModel.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) }},
      { $pull: { threads: { $ins: descendantThreadsIds }} }
    );

    revalidatePath(path)

  } catch (error) {
    throw new Error(`Failed to delete Thread: ${error.message}`)
  }
}

export async function fetchAllChildThreads(threadId) {
  const childThreads = await ThreadModel.find({ parentId: threadId});
  
  const descendantThreads = [];
  
  for (const child of childThreads) {
    const descendants = await fetchAllChildThreads(child._id);
    descendantThreads.push(child, ...descendants);
  }

  return descendantThreads;
}