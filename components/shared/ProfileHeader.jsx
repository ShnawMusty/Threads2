import Image from 'next/image'

const ProfileHeader = ({accountId, authUserId, name, username, imgUrl, bio, type}) => {

  return (
    <div className='flex flex-col w-full justify-start'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='relative h-20 w-20 object-cover'>
            <Image src={imgUrl} alt={name} fill className='rounded-full shadow-2xl object-cover'/>
          </div>

          <div className='flex-1'>
            <h2 className='text-light-1 text-left text-heading3-bold'>{name}</h2>
            <p className='text-gray-1 text-base-medium'>@{username}</p>
          </div>
        </div>
      </div>

        {/* TODO: Community */}
        <p className='mt-6 max-w-lg text-base-regular text-light-2'>{bio}</p>
        <div className='mt-10 h-0.5 w-full bg-dark-3' />
    </div>
  )
}

export default ProfileHeader