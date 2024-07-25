import { useUserContext } from '@/context/AuthContext'
import { Models } from 'appwrite'
import React from 'react'
import { Link } from 'react-router-dom'
import PostStats from './PostStats'
import { formatDate } from '@/lib/utils'

type GridPostListProps = {
    posts: Models.Document[];
    showUser?: boolean;
    showStats?: boolean;
}

const GridPostList = ( {posts, showUser = true, showStats = true} : GridPostListProps) => {
    const { user } = useUserContext();
  
    
    return (
    <ul className="grid-container">
        {posts.map((post) => (
            <li key={post.$id} className="relative min-w-80 h-80">
                {post.imageUrl && post.imageUrl !== 'https://example.com/default-image.jpg' ? (
                    <>
                        <Link to={`/posts/${post.$id}`} className="grid-post_link">
                            <img src={post.imageUrl} alt="post" className="h-full w-full object-cover"/>
                        </Link>

                        <div className="grid-post_user">
                            {showUser && (
                            <div className="flex items-center justify-start gap-2 flex-1">
                                <img src={post.creator.imageUrl} alt="creator" className="h-8 w-8 rounded-full"/>
                                <p className="line-clam-1">
                                    {post.creator.name}
                                </p>
                            </div>
                        )}

                        {showStats && <PostStats post={post} userId={user.id}/>}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-2 p-4 bg-dark-4 rounded-lg">
                        
                        {showUser && (
                            <div className="flex items-center gap-2">
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
                        )}
                        <p className="line-clamp-3">{post.caption}</p>
                        {post.tags.length > 0 && (
                            <ul className="flex gap-1">
                                {post.tags.map((tag: any) => (
                                    <li key={tag} className="text-light-3">#{tag}</li>
                                ))}
                            </ul>
                        )}
                        {showStats && <PostStats post={post} userId={user.id} />}
                    </div>
                    
                    
                )}
                
                
            </li>
        ))}
    </ul>
  )
}

export default GridPostList