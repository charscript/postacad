import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from '@/lib/react-query/queriesAndMutations';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite';
import React, { useState, useEffect } from 'react';
import Loader from './loader';

type PostStatsProps = {
    post?: Models.Document;
    userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
    const likesList = post?.likes.map((user: Models.Document) => user.$id) || [];

    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, status: savePostStatus } = useSavePost();
    const { mutate: deleteSavedPost, status: deleteSavedPostStatus } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();

    useEffect(() => {
        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);
        setIsSaved(!!savedPostRecord);
    }, [currentUser, post?.$id]);

    const handleLikePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        let newLikes = [...likes];

        const hasLiked = newLikes.includes(currentUser?.$id);
        if (hasLiked) {
            newLikes = newLikes.filter((id) => id !== userId);
        } else {
            newLikes.push(userId);
        }

        setLikes(newLikes);
        likePost({ postId: post?.$id || '', likesArray: newLikes });
    };

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Actualizar el estado isSaved inmediatamente
        setIsSaved((prevIsSaved) => !prevIsSaved);

        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

        if (savedPostRecord) {
            deleteSavedPost(savedPostRecord.$id, {
                onSuccess: () => {
                    setIsSaved(false);
                },
                onError: () => {
                    // Revertir el estado si ocurre un error
                    setIsSaved(true);
                },
            });
        } else {
            savePost({ postId: post?.$id || '', userId }, {
                onSuccess: () => {
                    setIsSaved(true);
                },
                onError: () => {
                    // Revertir el estado si ocurre un error
                    setIsSaved(false);
                },
            });
        }
    };

    const isMutating = savePostStatus === 'pending' || deleteSavedPostStatus === 'pending';

    return (
        <div className="flex justify-between items-center z-20">
            <div className="flex gap-2 mr-5">
                <img
                    src={checkIsLiked(likes, userId)
                        ? "/assets/icons/liked.svg"
                        : "/assets/icons/like.svg"}
                    alt="like"
                    width={20}
                    height={20}
                    onClick={handleLikePost}
                    className="cursor-pointer"
                />
                <p className="small-medium lg:base-medium">{likes.length}</p>
            </div>

            <div className="flex gap-2">
                {isMutating ? (
                    <div className="loader-icon-resize">
                        <Loader />
                    </div>
                ) : (
                    <img
                        src={isSaved
                            ? "/assets/icons/saved.svg"
                            : "/assets/icons/save.svg"}
                        alt="save"
                        width={20}
                        height={20}
                        onClick={handleSavePost}
                        className={`cursor-pointer ${isMutating ? 'cursor-not-allowed' : ''}`}
                    />
                )}
            </div>
        </div>
    );
};

export default PostStats;
