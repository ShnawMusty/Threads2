"use server"

import { revalidatePath } from "next/cache";
import UserModel from "../models/userModel";
import ThreadModel from '../models/threadModel'
import { connectToDB } from "../mongoose"
import { User } from "lucide-react";

export async function updateUser({userId, username, name, bio, image, path}) {
    await connectToDB();

    try {
        await UserModel.findOneAndUpdate(
          { id: userId },
          {
            username: username.toLowerCase(),
            name: name,
            bio: bio,
            image: image,
            onboarded: true,
          },
          { upsert: true }
        );

        if(path === '/profile/edit') {
            revalidatePath(path)
        } 
    } catch (error) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUser(userId) {
    try {
        await connectToDB();

        return await UserModel
        .findOne({ id: userId})
        
    } catch (error) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function fetchUserPosts(userId) {
  try {
    await connectToDB();

    // TODO: populate community
    const threads = await UserModel
    .findOne({id: userId})
    .populate({
      path: 'threads',
      model: ThreadModel,
      populate: {
        path: 'children',
        model: ThreadModel,
        populate: {
          path: 'author',
          model: UserModel,
          select: 'name id image'
        }
      }
    })

    return threads

  } catch (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`)
  }
}


export async function fetchUsers({userId, searchString = '', pageNumber = 1, pageSize = 20, sortBy = 'desc'}) {
  try {
    await connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, 'i');

    const query = {
      id: { $ne: userId}
    }

    if (searchString.trim() !== '') {
      query.$or = [
        { username: { $regex: regex} },
        { name: { $regex: regex} }
      ]
    }

    const sortOptions = { createdAt: sortBy}

    const usersQuery = UserModel
    .find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize);

    const totalUsersCount = await UserModel.countDocuments(query)

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length

    return {users, isNext}

  } catch (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}


export async function getActivity(userId) {
  try {
    await connectToDB();

    const userThreads = await ThreadModel.find({ author: userId});

    const childThreadsIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children)
    }, []);

    const replies = await ThreadModel.find({
      _id: { $in: childThreadsIds},
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: UserModel,
      select: 'name image _id'
    })

    return replies;

  } catch (error) {
    throw new Error(`Failed to fetch activity: ${error.message}`)
  }
}