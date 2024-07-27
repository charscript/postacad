import { useState } from 'react';
import Loader from '@/components/shared/loader';
import { useGetRecentPosts, useGetFollowedPosts, useGetUsers } from '@/lib/react-query/queriesAndMutations';
import { Models } from 'appwrite';
import PostCard from '@/components/shared/PostCard';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import UserCard from '@/components/shared/UserCard';
import { Button } from '@/components/ui/button';

const FormSchema = z.object({
  filter: z.string(),
});

const Home = () => {
  const [showFollowed, setShowFollowed] = useState(false);
  const [showCreators, setShowCreators] = useState(true);
  const { data: posts, isPending: isPostLoading, isError: isErrorPosts } = showFollowed ? useGetFollowedPosts() : useGetRecentPosts();
  const { data: creators, isLoading: isUserLoading, isError: isErrorCreators } = useGetUsers(10);

  if (isErrorPosts || isErrorCreators) {
    return (
      <div className="flex flex-1">
        <div className="home-container">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
        <div className="home-creators">
          <p className="body-medium text-light-1">Something bad happened</p>
        </div>
      </div>
    );
  }

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { filter: 'all' },
  });

  const handleSelectChange = (value: string) => {
    setShowFollowed(value === 'followed');
    form.setValue('filter', value);
  };

  return (
    <div className="flex flex-1">
      <div className="home-container">
        <div className="home-posts">
          <div className="flex justify-between items-center w-full">
            <h2 className="h3-bold md:h2-bold text-left">Inicio</h2>
            <Form {...form}>
              <FormField
                control={form.control}
                name="filter"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={handleSelectChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mostrar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="followed">Seguidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          </div>
          {isPostLoading && !posts ? (
            <Loader />
          ) : (
            <ul className="flex flex-col gap-3 w-full">
              {posts?.documents.map((post: Models.Document) => (
                <PostCard post={post} key={post.$id} />
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="flex">

        <Button
          onClick={() => setShowCreators(!showCreators)}
          className={`toggle-button ${showCreators ? 'show-creators' : 'hide-creators'}`}
        >
          {showCreators ? 'Ocultar' : 'Mostrar'} Creadores
        </Button>

        {showCreators && (
          <div className={` ${showCreators ? 'show home-creators sm:block' : 'hidden'}`}>
            <h3 className="h3-bold text-light-1 mb-7">Creadores Destacados</h3>
            {isUserLoading && !creators ? (
              <Loader />
            ) : (
              <ul className="grid 2xl:grid-cols-2 gap-6">
                {creators?.documents.map((creator: Models.Document) => (
                  <li key={creator?.$id}>
                    <UserCard user={creator} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}



      </div>
    </div>
  );
};

export default Home;
