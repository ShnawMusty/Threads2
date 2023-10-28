'use client'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { usePathname } from 'next/navigation';
import { commentValidation } from '@/lib/validations/thread';
import Image from 'next/image';
import Link from 'next/link';
import { addCommentToThread } from '@/lib/actions/threadActions';

const Comment = ({threadId, currentUserImg, currentUserId}) => {

  const pathname = usePathname();
    
    const form = useForm({
      resolver: zodResolver(commentValidation),
      defaultValues: {
        thread: '',
      }
    })

    const onSubmit = async (values) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname);

        form.reset();
    };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='comment-form'>

        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 w-full">
              <FormLabel >
                <Link href={`/profile/${currentUserId}`}>
                  <Image src={currentUserImg} alt="profile image" width={48} height={48} className='rounded-full object-cover'/>
                </Link>
              </FormLabel>
              <FormControl className="border-none bg-transparent" > 
                <Input type="text" placeholder='Comment...' className="text-light-1 outline-none no-focus font-semibold" {...field} />
              </FormControl>
            </FormItem>
          )} 
        />
        <Button type='submit' className='comment-form_btn'>Reply</Button>
        </form>
    </Form>
    </>
  )
}

export default Comment