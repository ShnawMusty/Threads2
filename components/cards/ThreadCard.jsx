import { fetchCommunityDetails } from "@/lib/actions/communityActions";
import { formatDateString } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const ThreadCard = async ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  communityId,
  createdAt,
  comments,
  isComment,
}) => {

  const community = await fetchCommunityDetails(communityId);
  return (
    <article className={`flex flex-col w-full rounded-xl ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7'} `}>
      <div className="flex items-start justify-between">
        <div className="flex flex-1 w-full flex-row gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="profile image"
                fill
                className="rounded-full object-cover"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>
          <div className="flex w-full flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="text-base-semibold text-light-1">{author.name}</h4>
            </Link>
            <p className="pt-2 text-small-regular text-light-1">{content}</p>

            <div className={`${isComment && 'mb-8'} mt-5 flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  src="/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer "
                />

                <Link href={`/thread/${id}`}>
                  <Image
                    src="/reply.svg"
                    alt="reply"
                    width={24}
                    height={24}
                    className="cursor-pointer "
                  />
                </Link>

                <Image
                  src="/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer "
                />

                <Image
                  src="/share.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer "
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} replies
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* todo: delete thread */}
      {/* show comment logos */}
      {!isComment && community && (
        <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
          <p className="text-subtle-medium text-gray-1">
            {formatDateString(createdAt)}{" "}- {community.name} Community
          </p>
        
          <Image src={community.image} alt={community.name} width={16} height={16} className="w-auto h-auto aspect-[1/1] ml-1 rounded-full object-cover"/>
        </Link>
      )}
    </article>
  );
};

export default ThreadCard;
