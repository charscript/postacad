import { useUserContext } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { Models } from 'appwrite';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';
import { Button } from '@/components/ui/button';  // Asegúrate de importar el componente Button

type PostCardProps = {
    post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
    const { user } = useUserContext();
    const [showFullCaption, setShowFullCaption] = useState(false);

    if (!post.creator) return null;

    const toggleCaption = () => {
        setShowFullCaption(!showFullCaption);
    };

    const handlePurchase = () => {
        // Lógica para manejar la compra del recurso
        console.log("Comprar recurso");
    };

    const isLocked = post.isResource && post.price > 0 && user.id !== post.creator.$id;

    return (
        <div className={`post-card ${isLocked ? 'bg-gray-200 opacity-75' : ''}`}>
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
                            {post.isResource && post.price !== undefined && (
                                <div className="flex-center gap-2">
                                    -
                                    <p className={`subtle-semibold lg:small-regular ${post.price === 0 ? 'text-green-400' : 'text-primary-600'}`}>
                                        {post.price === 0 ? 'Gratuito' : `$${post.price.toFixed(2)}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {user.id !== post.creator.$id ? (
                    post.price > 0 && (
                        <img src="/assets/icons/lockLocked.svg" alt="lock" width={30} height={30} />
                    )
                ) : (
                    <Link to={`/update-post/${post.$id}`}>
                        <img src="/assets/icons/edit.svg" alt="edit" width={20} height={20} />
                    </Link>
                )}
            </div>
            <Link to={`/posts/${post.$id}`}>
                <div className="small-medium lg:base-medium py-5 post-card-caption">
                    <div className="overflow-hidden">
                        <p className="overflow-wrap-anywhere line-clamp-6">
                            {post.caption}
                        </p>
                    </div>
                    {post.tags.length > 0 && post.tags.some((tag: string) => tag.trim() !== '') && (
                        <ul className="flex gap-1">
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
            </Link>
            <div className="mt-5">
                <PostStats post={post} userId={user.id} handlePurchase={post.isResource ? handlePurchase : undefined} />
            </div>
        </div>
    );
};

export default PostCard;
