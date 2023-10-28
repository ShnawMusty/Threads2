'use client'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { usePathname, useRouter } from 'next/navigation';
import { threadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/threadActions'



function PostThread({userId}) {
    const pathname = usePathname();
    const router = useRouter();
    
    const form = useForm({
      resolver: zodResolver(threadValidation),
      defaultValues: {
        thread: '',
        accountId: userId
      }
    })

    const onSubmit = async (values) => {
        await createThread({
          text: values.thread,
          author: userId,
          communityId: null,
          path: pathname
          })
          router.push('/')
    };

    return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col justify-start gap-10 mt-10'>
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w-full">
              <FormLabel >
                <p className="text-light-2  text-base-semibold">Content</p>
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1" > 
                <Textarea rows={15} className="account-form_input no-focus" {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <Button type='submit' className='bg-primary-500'>Post Thread</Button>
        </form>
    </Form>
  )
}

export default PostThread