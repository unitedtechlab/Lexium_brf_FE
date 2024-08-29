'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import Searchbar from "@/app/components/Searchbar/search";
import View from "@/app/components/GridListView/view";
import classes from "@/app/assets/css/pages.module.css";
import { Button, Dropdown, message, Empty } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import folderIcon from "@/app/assets/images/Folder.svg";
import { BiDotsVerticalRounded } from "react-icons/bi";
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { useEmail } from "@/app/context/emailContext";
import Link from "next/link";
import Loader from '@/app/loading';
import { fetchFolders } from '@/app/API/api';
import { FolderData as Folder } from '@/app/types/interface';

const CreateFolderModal = dynamic(() => import('./modals/create-folder/folder'));
const DeleteFolderModal = dynamic(() => import('./modals/delete-folder/deletefolder'));
const EditFolderModal = dynamic(() => import('./modals/edit-folder/editfolder'));

const CreateFolderPage = () => {
    const { id } = useParams<{ id: string }>();
    const [searchInput, setSearchInput] = useState("");
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [shouldShowPreValidation, setShouldShowPreValidation] = useState(false);
    const { email } = useEmail();

    const items: MenuProps["items"] = [
        {
            label: "Edit",
            key: "edit",
            onClick: () => handleEditFolder(selectedFolder),
        },
        {
            label: "Delete",
            key: "delete",
            onClick: () => handleDeleteFolder(selectedFolder),
        },
    ];

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const openCreateModal = () => {
        setIsCreateModalVisible(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalVisible(false);
        loadFolders();
    };

    const handleDeleteFolder = (folder: Folder | null) => {
        if (folder) {
            setSelectedFolder(folder);
            setIsDeleteModalVisible(true);
        }
    };

    const handleEditFolder = (folder: Folder | null) => {
        if (folder) {
            setSelectedFolder(folder);
            setIsEditModalVisible(true);
        }
    };

    const cancelEditFolder = () => {
        setSelectedFolder(null);
        setIsEditModalVisible(false);
    };

    const updateFolderName = (folderId: string, newName: string) => {
        const updatedFolders = folders.map((folder) =>
            folder.id === folderId ? { ...folder, name: newName } : folder
        );
        setFolders(updatedFolders);
    };

    const removeFolder = (folderId: string) => {
        setFolders(folders.filter((folder) => folder.id !== folderId));
    };

    const loadFolders = async () => {
        if (email && id) {
            try {
                setIsLoading(true);
                const fetchedFolders = await fetchFolders(email, id, setIsLoading);
                setFolders(fetchedFolders);
                let hasFiles = fetchedFolders.some(folder => folder.fileSize !== 'Unknown' && parseInt(folder.fileSize) > 0);
                setShouldShowPreValidation(fetchedFolders.length > 1 && hasFiles);
            } catch (error) {
                console.error("Failed to fetch folders:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.error("Email and workspace ID are required to fetch folders.");
        }
    };

    useEffect(() => {
        if (id) {
            if (typeof id === 'string') {
                setBreadcrumbs([
                    { href: `/create-workspace`, label: `${id.replace(/-/g, ' ')} Workspace` }
                ]);
                loadFolders();
            } else {
                console.error("Invalid id type:", typeof id);
                message.error("Invalid id type.");
            }
        }
    }, [id, email]);

    const filteredFolders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <div className={`${classes.dashboardWrapper} ${classes.prevalidatebtn}`}>
            <div className={classes.heading}>
                <h1>Folder Management</h1>
            </div>

            {shouldShowPreValidation && (
                <Link href="/data-prevalidation" className={`btn btn-outline ${classes.validateBtn}`}>Move to Pre-validation</Link>
            )}

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                        <Button className="btn" onClick={openCreateModal}>
                            Create Folder
                        </Button>
                    </div>
                </div>
            </div>
            <CreateFolderModal
                open={isCreateModalVisible}
                workspaceId={typeof id === 'string' ? id : ""}
                onOk={closeCreateModal}
                onCancel={() => setIsCreateModalVisible(false)}
            />
            <DeleteFolderModal
                folderId={selectedFolder?.id || ''}
                folderName={selectedFolder?.name || ''}
                workspaceId={typeof id === 'string' ? id : ''}
                open={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onDeleteSuccess={() => {
                    setIsDeleteModalVisible(false);
                    removeFolder(selectedFolder?.id || '');
                    setSelectedFolder(null);
                }}
            />
            <EditFolderModal
                open={isEditModalVisible}
                folderId={selectedFolder?.id || ""}
                workspaceId={typeof id === "string" ? id : ""}
                initialFolderName={selectedFolder?.name || ''}
                onCancel={cancelEditFolder}
                onEditSuccess={(newName: string) => {
                    setIsEditModalVisible(false);
                    updateFolderName(selectedFolder?.id || "", newName);
                    setSelectedFolder(null);
                    loadFolders();
                }}
            />
            {isLoading ? (
                <Loader />
            ) : filteredFolders.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No folders found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredFolders.map((folder) => (
                        <div key={folder.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/importdata/${id}?workspace=${id}&folder=${folder.id}`} passHref>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={folderIcon} alt="Folder Icon" width={32} height={32} />
                                        <p>
                                            <b>{folder.name.toUpperCase()}</b>
                                        </p>
                                    </div>
                                </Link>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        {folder.fileSize}
                                        <br />
                                        {folder.lastUpdated}
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown menu={{ items }} trigger={["click"]}>
                                            <Button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedFolder(folder);
                                                }}
                                                className={classes.btnBlank}
                                            >
                                                <BiDotsVerticalRounded />
                                            </Button>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CreateFolderPage;
