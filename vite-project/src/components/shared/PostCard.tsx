import { useUserContext } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { Models } from 'appwrite'
import React, { useState } from 'react'
import { File } from 'lucide-react'
import { Link } from 'react-router-dom'
import PostStats from './PostStats';

type PostCardProps = {
    post: Models.Document;

}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [showFullCaption, setShowFullCaption] = useState(false);

  if(!post.creator) return;

  const toggleCaption = () => {
    setShowFullCaption(!showFullCaption);
  }

  return (
    <div className="post-card">
        <div className="flex-between">
            <div className="flex items-center gap-3">
                <Link to={`/profile/${post.creator.$id}`}>
                    <img 
                        src={post?.creator?.imageUrl || '/assets/icons/profile-placeholder.svg'} 
                        alt="creator"
                        className="rounded-full w-12 lg:h-12"
                    />
                </Link>

                <div className="flex flex-col gap-1">
                    <p className="base-medium lg:body-bold text-light-1">
                        {post.creator.name}
                    </p>
                    <div className="flex-center gap-2 text-light-3">
                        <p className="subtle-semibold lg:small-regular">
                            {formatDate(post.$createdAt)}
                        </p>
                        {post.location && (
                            <div className="flex-center gap-2">
                                -
                                <p className="subtle-semibold lg:small-regular">
                                {post.location}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                

            </div>
            <Link to={`/update-post/${post.$id}`}
                className={`${user.id !== post.creator.$id && "hidden"}`}>
                <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20}/>
            </Link>
        </div>
        <Link to={`/posts/${post.$id}`} >
            <div className="small-medium lg:base-medium py-5 post-card-caption">
            <div className="overflow-hidden ">
                <p className="overflow-wrap-anywhere line-clamp-6 ">
                    {post.caption}
                </p>
            </div>
                {post.tags.length > 0 && post.tags.some((tag: string) => tag.trim() !== '') && (
                    <ul className="flex gap-1 ">
                        {post.tags.filter((tag: string) => tag.trim() !== '').map((tag: string) => (
                        <li key={tag} className="text-light-3">
                            #{tag}
                        </li>
                        ))}
                    </ul>
                )}
            </div>
            {post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg' && (
              <img src={post.imageUrl}
              className="post-card_img"
              alt="imagen"
              />
            )}

            {post.isResource ? (
                <div>
                    <div className="flex-center mt-2">
                        <File size={24} className="text-light-3 hover:text-primary-500" /> {/* Icono de archivo */}
                        <p className="text-light-3 ml-2 hover:text-primary-500 line-clamp-1">Este post incluye un archivo</p>
                    </div>
                    <div className="mt-5">
                        <PostStats post={post} userId={user.id}/>
                    </div>
                </div>
                
            ) : (
                <div>
                    <div >
                        <PostStats post={post} userId={user.id}/>
                    </div>
                </div>
            )}
        </Link>
        
        
        
    </div>
  )
}

export default PostCard