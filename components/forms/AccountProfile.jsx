'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userValidation } from '@/lib/validations/user'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from 'next/image'
import { useState } from 'react'
import { isBase64Image } from '@/lib/utils'
import { useUploadThing } from "@/lib/uploadthing";
import { usePathname, useRouter } from 'next/navigation';
import { updateUser } from '@/lib/actions/userActions'


const AccountProfile = ({user, btnTitle }) => {

  const [files, setFiles] = useState([]);
  const { startUpload } = useUploadThing("media");
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(userValidation),
    defaultValues: {
      profile_photo: user?.image || "",
      name: user?.name || "",
      username: user?.username || '',
      bio: user?.bio || ''
    }
  })

  async function onSubmit(values) {
    
    const blob = values.profile_photo;
    
    const hasImageChanged = isBase64Image(blob);

    if (hasImageChanged) {
      const imgRes = await startUpload(files);

      if (imgRes && imgRes[0].url) {
        values.profile_photo = imgRes[0].url
      }
    }

    await updateUser({
      userId: user.id,
      image: values.profile_photo,
      username: values.username,
      name: values.name,
      bio: values.bio,
      path: pathname
    });

    if (pathname === '/profile/edit') {
      router.back()
    } else {
      router.push('/')
    }
  }

  const handleImage = (e, fieldChange) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if(e.target?.files.length > 0) {
      const file = e.target.files[0];

      setFiles(Array.from(e.target.files))

      if (!file.type.includes('image')) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || '';

        fieldChange(imageDataUrl)
      }
      
      fileReader.readAsDataURL(file)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-10 justify-start">
        <FormField
          control={form.control}
          name="profile_photo"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label overflow-hidden">
                {field.value ? (
                  <Image src={field.value} alt='profile photo' width={96} height={96} priority className='rounded-full object-contain'/>
                ) : (
                  <Image src="/profile.svg" width={24} height={24} className='object-contain' />
                )}
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200" >
                <Input type="file" accept="image/*" placeholder="Upload a photo" className="account-form_image-input" onChange={(e) => handleImage(e, field.onChange)} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel >
                <p className="text-light-2  text-base-semibold">Name</p>
              </FormLabel>
              <FormControl>
                <Input type="text" className="account-form_input no-focus" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel>
              <p className="text-light-2  text-base-semibold">Username</p>
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200" >
                <Input type="text" className="account-form_input no-focus" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel>
              <p className="text-light-2  text-base-semibold">Bio</p>
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200" >
                <Textarea rows={10} className="account-form_input no-focus" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />

        <Button type="submit" className="bg-primary-500">Submit</Button>
      </form>
    </Form>
  )
}

export default AccountProfile