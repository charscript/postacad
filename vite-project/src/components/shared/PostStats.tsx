import { useState, useEffect, useRef } from 'react';
import { useSavePost, useDeleteSavedPost, useGetCurrentUser, useLikePost } from '@/lib/react-query/queriesAndMutations';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite';
import Loader from './loader';
import { Button } from '@/components/ui/button';  // Asegúrate de importar el componente Button
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';  // Asegúrate de importar el Drawer
import { useGetFileDownload } from '@/lib/react-query/queriesAndMutations';  // Importa el hook de descarga

type PostStatsProps = {
    post?: Models.Document;
    userId: string;
    handlePurchase?: () => void;  // Añadir handlePurchase como prop opcional
};
const COOLDOWN_TIME = 1000; // Tiempo en milisegundos para el cooldown

type QueueItem = {
    action: 'save' | 'delete';
    postId?: string;
    recordId?: string;
};

const PostStats = ({ post, userId, handlePurchase }: PostStatsProps) => {
    const likesList = post?.likes.map((user: Models.Document) => user.$id) || [];
    const [likes, setLikes] = useState(likesList);
    const [isSaved, setIsSaved] = useState(false);
    const [queue, setQueue] = useState<QueueItem[]>([]); // Cola de solicitudes
    const [drawerOpen, setDrawerOpen] = useState(false); // Estado del Drawer

    const { mutate: likePost } = useLikePost();
    const { mutate: savePost, status: savePostStatus } = useSavePost();
    const { mutate: deleteSavedPost, status: deleteSavedPostStatus } = useDeleteSavedPost();

    const { data: currentUser } = useGetCurrentUser();
    const isProcessing = useRef(false); // Ref para verificar si está en proceso

    useEffect(() => {
        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);
        setIsSaved(!!savedPostRecord);
    }, [currentUser, post?.$id]);

    useEffect(() => {
        const processQueue = async () => {
            if (isProcessing.current || queue.length === 0) return; // Evita procesar múltiples veces al mismo tiempo

            isProcessing.current = true;

            while (queue.length > 0) {
                const item = queue.shift(); // Extrae el primer elemento de la cola
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
                        // Manejo de errores si es necesario
                    }

                    // Espera el tiempo del cooldown antes de procesar el siguiente
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
        likePost({ postId: post?.$id || '', likesArray: newLikes });
    };

    const handleSavePost = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Actualiza inmediatamente el estado del botón
        setIsSaved(prevIsSaved => !prevIsSaved);

        const savedPostRecord = currentUser?.save.find((record: Models.Document) => record.post.$id === post?.$id);

        // Encola la solicitud para procesarla después del cooldown
        if (savedPostRecord) {
            console.log('Queueing delete request with ID:', savedPostRecord.$id);
            setQueue(prevQueue => [...prevQueue, { action: 'delete', recordId: savedPostRecord.$id }]);
        } else {
            console.log('Queueing save request for post with ID:', post?.$id);
            setQueue(prevQueue => [...prevQueue, { action: 'save', postId: post?.$id || '' }]);
        }
    };

    const isMutating = savePostStatus === 'pending' || deleteSavedPostStatus === 'pending';

    // Hooks para obtener la URL de descarga
    const { mutateAsync: getFileDownload } = useGetFileDownload();
    const { mutateAsync: getImageDownload } = useGetFileDownload();

    const handleDownloadFile = async () => {
        if (post?.fileId) {
            try {
                const result = await getFileDownload(post.fileId);
                if (result) {
                    const link = document.createElement('a');
                    link.href = result.toString();; // Usa la URL directamente
                    link.download = 'archivo'; // Ajusta el nombre del archivo si es necesario
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
        if (post?.imageId) {
            try {
                // Usa mutateAsync para obtener la URL de descarga
                const result = await getImageDownload(post.imageId);
                if (result) {
                    const link = document.createElement('a');
                    link.href = result.toString();; // Usa la URL directamente
                    link.download = 'imagen'; // Ajusta el nombre de la imagen si es necesario
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        }
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

                        {/* Botón de descarga solo si es un recurso o tiene imagen */}
                        {(post?.isResource || post?.imageUrl !== 'https://example.com/default-image.jpg') && (
                            <Button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => setDrawerOpen(true)}
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

                {/* Contenedor para el botón de "Comprar" */}
                {post?.isResource && post.price > 0 && post.creator && userId !== post.creator.$id && handlePurchase && (
                    <Button
                        type="button"
                        className="shad-button_primary w-32 absolute left-1/2 transform -translate-x-1/2"
                        onClick={handlePurchase}
                    >
                        Comprar
                    </Button>
                )}

                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerContent className="bg-dark-1">
                        <div className="mx-auto max-w-sm">
                            <DrawerHeader>
                                <DrawerTitle>Opciones de Descarga</DrawerTitle>
                                <DrawerDescription>Selecciona una opción para descargar.</DrawerDescription>
                            </DrawerHeader>
                        </div>
                        
                        <div className="flex items-center justify-center gap-4 p-4">
                            <Button
                                variant="outline"
                                className="shad-button_primary w-64"
                                onClick={handleDownloadImage}
                            >
                                Descargar Foto
                            </Button>
                            <Button
                                variant="outline"
                                className="shad-button_primary w-64"
                                onClick={handleDownloadFile}
                            >
                                Descargar Archivo
                            </Button>
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
        </div>
    );
};

export default PostStats;
