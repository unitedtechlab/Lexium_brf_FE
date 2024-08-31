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
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';

const CreateModal = dynamic(() => import('@/app/modals/create-modal/create-modal'));
const EditableModal = dynamic(() => import('@/app/modals/edit-modal/edit-modal'));
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'));

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

    const handleCreateFolder = async (folderName: string) => {
        if (!email || !id) return;
        const requestData = {
            userEmail: email,
            workSpace: id,
            folderName: folderName,
        };

        try {
            const token = getToken();
            const response = await axios.post(`${BaseURL}/folder`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success("Folder created successfully");
                closeCreateModal();
            } else {
                const result = response.data;
                message.error(result.message || "Failed to create folder");
            }
        } catch (error) {
            console.error("Error creating folder:", error);
            message.error("Failed to create folder. Please try again later.");
        }
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

    const updateFolderName = (folderId: string, newName: string) => {
        const updatedFolders = folders.map((folder) =>
            folder.id === folderId ? { ...folder, name: newName } : folder
        );
        setFolders(updatedFolders);

        setSelectedFolder((prevFolder) =>
            prevFolder && prevFolder.id === folderId ? { ...prevFolder, name: newName } : prevFolder
        );
    };

    const removeFolder = (folderId: string) => {
        setFolders(folders.filter((folder) => folder.id !== folderId));
    };

    const deleteFolder = async (folderId: string) => {
        if (!email || !id) return;
        const token = getToken();
        try {
            await axios.delete(`${BaseURL}/folder`, {
                params: {
                    userEmail: email,
                    workSpace: id,
                    folderName: encodeURIComponent(folderId),
                },
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
            });
            message.success('Folder deleted successfully!');
            removeFolder(folderId);
        } catch (error) {
            message.error("Failed to delete folder");
            console.error("Error deleting folder:", error);
        }
    };

    const editFolderName = async (newName: string) => {
        if (!email || !selectedFolder || !id) return;
        const token = getToken();
        try {
            const currentFolderName = selectedFolder.name;
            const response = await axios.put(`${BaseURL}/folder`, {
                userEmail: email,
                workSpace: id,
                folderName: encodeURIComponent(currentFolderName),
                data: newName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                updateFolderName(selectedFolder.id, newName);
                message.success("Folder renamed successfully");
                setIsEditModalVisible(false);
                loadFolders();
            } else {
                throw new Error("API response not OK");
            }
        } catch (error) {
            console.error("Error renaming folder:", error);
            message.error("Failed to rename folder");
        }
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
                console.error("Error fetching folders:", error);
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
                const decodedId = decodeURIComponent(id);
                setBreadcrumbs([
                    { href: `/create-workspace`, label: `${decodedId.replace(/-/g, ' ')} Workspace` }
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
            <CreateModal
                open={isCreateModalVisible}
                title="Create New Folder"
                fieldLabel="Folder Name"
                onSubmit={handleCreateFolder}
                onCancel={closeCreateModal}
                isLoading={isLoading}
            />
            {selectedFolder && (
                <DeleteModal
                    open={isDeleteModalVisible}
                    entityName="Folder"
                    entityId={selectedFolder.id}
                    onDelete={() => deleteFolder(selectedFolder.id)}
                    onOk={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedFolder(null);
                    }}
                    onCancel={() => setIsDeleteModalVisible(false)}
                />
            )}
            {selectedFolder && (
                <EditableModal
                    open={isEditModalVisible}
                    title="Rename Folder"
                    initialValue={selectedFolder.name}
                    fieldLabel="Folder Name"
                    onSubmit={editFolderName}
                    onCancel={() => setIsEditModalVisible(false)}
                />
            )}
            {isLoading ? (
                <Loader />
            ) : filteredFolders.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No folders found" />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredFolders.map((folder) => (
                        <div key={folder.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <Link href={`/importdata/${id}?workspace=${encodeURIComponent(id)}&folder=${folder.id}`} passHref>
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
