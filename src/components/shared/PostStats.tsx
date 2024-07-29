import { useState, useEffect, useRef } from 'react';
import { useSavePost, useDeleteSavedPost, useGetCurrentUser, useLikePost, useCreateTransaction, useGetTransactionsFromPostAndUser } from '@/lib/react-query/queriesAndMutations';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { useGetFileDownload } from '@/lib/react-query/queriesAndMutations';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserContext } from '@/context/AuthContext';
import { Modal, ModalTrigger, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';




type PostStatsProps = {
    post?: Models.Document;
    userId: string;
    handlePurchase?: () => void;
};

const COOLDOWN_TIME = 1000;

type QueueItem = {
    action: 'save' | 'delete';
    postId?: string;
    recordId?: string;
};

const PostStats = ({ post, userId, handlePurchase }: PostStatsProps) => {
    if (!post) {
        return null;
    }

    const { user } = useUserContext(); // Obtén el contexto de usuario
    const likesList = post.likes.map((user: Models.Document) => user.$id) || [];
    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, status: savePostStatus } = useSavePost();
    const { mutate: deleteSavedPost, status: deleteSavedPostStatus } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();
    const isProcessing = useRef(false);

    const { data: transactions } = useGetTransactionsFromPostAndUser(post.$id, userId);

    useEffect(() => {
        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post.$id);
        setIsSaved(!!savedPostRecord);
    }, [currentUser, post.$id]);

    useEffect(() => {
        const processQueue = async () => {
            if (isProcessing.current || queue.length === 0) return;

            isProcessing.current = true;

            while (queue.length > 0) {
                const item = queue.shift();
                if (item) {
                    const { action, postId, recordId } = item;

                    try {
                        if (action === 'save' && postId) {
                            await savePost({ postId, userId });
                            console.log('Post saved successfully');
                        } else if (action === 'delete' && recordId) {
                            await deleteSavedPost(recordId);
                            console.log('Post successfully deleted');
                        }
                    } catch (error) {
                        console.error(`Error processing ${action} action:`, error);
                    }

                    await new Promise(resolve => setTimeout(resolve, COOLDOWN_TIME));
                }
            }

            isProcessing.current = false;
        };

        processQueue();
    }, [queue, savePost, deleteSavedPost]);

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
        likePost({ postId: post.$id, likesArray: newLikes });
    };

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaved(prevIsSaved => !prevIsSaved);

        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post.$id);

        if (savedPostRecord) {
            console.log('Queueing delete request with ID:', savedPostRecord.$id);
            setQueue(prevQueue => [...prevQueue, { action: 'delete', recordId: savedPostRecord.$id }]);
        } else {
            console.log('Queueing save request for post with ID:', post.$id);
            setQueue(prevQueue => [...prevQueue, { action: 'save', postId: post.$id }]);
        }
    };

    const isMutating = savePostStatus === 'pending' || deleteSavedPostStatus === 'pending';

    const { mutateAsync: getFileDownload } = useGetFileDownload();
    const { mutateAsync: getImageDownload } = useGetFileDownload();

    const handleDownloadFile = async () => {
        if (post.fileId) {
            try {
                const result = await getFileDownload(post.fileId);
                if (result) {
                    const link = document.createElement('a');
                    link.href = result.toString();
                    link.download = 'archivo';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error('Error downloading file:', error);
            }
        }
    };

    const handleDownloadImage = async () => {
        if (post.imageId) {
            try {
                const result = await getImageDownload(post.imageId);
                if (result) {
                    const link = document.createElement('a');
                    link.href = result.toString();
                    link.download = 'imagen';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        }
    };

    const { mutate: createTransaction } = useCreateTransaction(post.$id, user.id);

    const handlePurchaseClick = async () => {
        if (post?.isResource && post.price > 0) {
            try {
                if (!user.id) {
                    throw new Error('Usuario no autenticado');
                }
                console.log(user.id, ' esta comprando post con ID:', post.$id, 'posteado por el usuario con ID:', userId);
                await createTransaction(); // Llama a la función de mutación
                console.log('Compra realizada con éxito');
            } catch (error) {
                console.error('Error al realizar la compra:', error);
            }
        }
    };

    const canPurchase = !transactions || transactions.length === 0;
    const isLocked = post.price > 0 && !transactions?.length; // Determina si el recurso está bloqueado


    const handleDownloadClick = () => {
        if (isLocked) {
            setShowAlert(true);
        } else {
            setDrawerOpen(true);
        }
    };

    const hidePurchaseButton = () => {
        return (post.price === 0 || (transactions && transactions?.length > 0) || post.creator.$id === userId) ? "hidden" : ""; return (post
        )
    };

    return (
        <div className="flex flex-col gap-4 z-20 w-full relative">
            <div className="flex flex-col gap-4 z-20">
                <div className="flex justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-2">
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

                        {(post.fileId || post.imageId) && (
                            <Button
                                type="button"
                                className="cursor-pointer"
                                onClick={handleDownloadClick}
                            >
                                <img
                                    src="/assets/icons/download.svg"
                                    alt="download"
                                    width={20}
                                    height={20}
                                />
                            </Button>
                        )}
                    </div>

                    {/* Modal Trigger */}
                    <ModalTrigger className="btn btn-primary">Open Modal</ModalTrigger>
                    <Modal>
                        <ModalBody>
                            <ModalContent>
                                <h2>Modal Content</h2>
                                <p>This is the modal content area.</p>
                            </ModalContent>
                            <ModalFooter>
                                <Button className="btn btn-secondary" onClick={() => console.log("Secondary action")}>
                                    Secondary Action
                                </Button>
                                <Button className="btn btn-primary" onClick={() => console.log("Primary action")}>
                                    Primary Action
                                </Button>
                            </ModalFooter>
                        </ModalBody>
                    </Modal>

                    {post.isResource && post.price > 0 && post.creator && userId !== post.creator.$id && (post.fileId || post.imageId) && canPurchase && handlePurchase && (
                        <div className="flex">

                            <div className=" mb-10 hidden md:block">
                                <Button
                                    type="button"
                                    className="shad-button_primary w-32 absolute left-1/2 transform -translate-x-1/2"
                                    onClick={() => handlePurchaseClick()}
                                >
                                    Comprar
                                </Button>
                            </div>



                        </div>
                    )}

                    <div className="flex gap-2">

                        {post.isResource && post.price > 0 && post.creator && userId !== post.creator.$id && (post.fileId || post.imageId) && canPurchase && handlePurchase && (
                            <div className="sm:block md:hidden content-center">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline" className={`border-primary-500 text-light-2 rounded-full h-6 w-13 subtle-medium ${hidePurchaseButton()} md:block hidden`}>Comprar por ${post.price}
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                account and remove your data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction>Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>)}

                        <img
                            src={isSaved ? "/assets/icons/save-filled.svg" : "/assets/icons/save.svg"}
                            alt="save"
                            width={20}
                            height={20}
                            className={`cursor-pointer ${isMutating ? "opacity-50" : "opacity-100"}`}
                            onClick={isMutating ? undefined : handleSavePost}
                        />
                    </div>


                </div>
            </div>


            <div className="hidden">
                <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Este recurso está bloqueado. Necesitas comprarlo para acceder a la descarga.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowAlert(false)}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => setDrawerOpen(true)}>Comprar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>


            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="bg-dark-1">
                    <div className="mx-auto max-w-sm">
                        <DrawerHeader>
                            <DrawerTitle>Opciones de Descarga</DrawerTitle>
                            <DrawerDescription>Selecciona una opción para descargar.</DrawerDescription>
                        </DrawerHeader>
                    </div>
                    <div className="flex items-center justify-center gap-4 p-4">
                        <Button onClick={handleDownloadImage} disabled={!post.imageId} className="shad-button_primary w-64" variant="outline">Descargar Foto</Button>
                        <Button onClick={handleDownloadFile} disabled={!post.fileId} className="shad-button_primary w-64" variant="outline">Descargar Archivo</Button>
                    </div>
                    <DrawerFooter>
                        <div className="flex items-center justify-center">
                            <DrawerClose asChild>
                                <Button variant="outline" className="shad-button_dark_4 w-64">Cerrar</Button>
                            </DrawerClose>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default PostStats;
