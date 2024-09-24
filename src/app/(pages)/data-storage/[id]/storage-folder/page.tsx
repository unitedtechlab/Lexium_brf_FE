'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import dynamic from 'next/dynamic';
import { fetchFolders } from "@/app/API/api";
import Searchbar from "@/app/components/Searchbar/search";
import View from "@/app/components/GridListView/view";
import classes from "@/app/assets/css/pages.module.css";
import { Button, Dropdown, message, Empty } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import folderIcon from "@/app/assets/images/table.png";
import { BiDotsVerticalRounded } from "react-icons/bi";
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { useEmail } from "@/app/context/emailContext";
import Link from "next/link";
import axios from 'axios';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';

const PreviewFolderModal = dynamic(() => import('../modals/folder-preview/folder-preview'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

interface Folder {
    id: string;
    name: string;
    cleanFileSize: string;
    cleanLastUpdated: string;
    cleanDataExist: boolean;
}

const DataStorageFolder = () => {
    const { id } = useParams<{ id: string }>();
    const [searchInput, setSearchInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const { email } = useEmail();
    const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [hasCleanData, setHasCleanData] = useState(false);

    const handlePreviewModal = useCallback((folder: Folder) => {
        setSelectedFolder(folder);
        setIsPreviewModalVisible(true);
    }, []);

    const handlePreviewModalCancel = useCallback(() => {
        setIsPreviewModalVisible(false);
        setSelectedFolder(null);
    }, []);

    const handleDeleteModal = useCallback((folder: Folder) => {
        setSelectedFolder(folder);
        setIsDeleteModalVisible(true);
    }, []);

    const handleDeleteModalCancel = useCallback(() => {
        setIsDeleteModalVisible(false);
        setSelectedFolder(null);
    }, []);

    const deleteFolder = useCallback(async (folderId: string) => {
        if (!email || !id) return;
        const token = getToken();
        setIsLoading(true);
        try {
            await axios.delete(`${BaseURL}/cleaned_folder`, {
                params: {
                    userEmail: email,
                    workSpace: id,
                    folderName: folderId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            return true;
        } catch (error) {
            message.error("Failed to delete folder");
            console.error("Error deleting folder:", error);
            return false;
        } finally {
            setIsLoading(false); // Ensure this is only called once
        }
    }, [email, id]);

    const updateFolderListAfterDelete = useCallback((folderId: string) => {
        setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
    }, []);

    const menuItems = useMemo<MenuProps["items"]>(() => [
        {
            label: "Preview File",
            key: "preview",
            onClick: () => {
                if (selectedFolder) {
                    handlePreviewModal(selectedFolder);
                } else {
                    message.error("No File selected.");
                }
            },
        },
        {
            label: "Delete File",
            key: "delete",
            onClick: () => {
                if (selectedFolder) {
                    handleDeleteModal(selectedFolder);
                } else {
                    message.error("No File selected.");
                }
            },
        },
    ], [selectedFolder, handlePreviewModal, handleDeleteModal]);

    const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (id && email) {
                if (typeof id === "string") {
                    setBreadcrumbs([{ href: `/data-storage`, label: `${id.replace(/-/g, " ")} Workspace` }]);
                    setIsLoading(true);
                    try {
                        // Pass setIsLoading to fetchFolders to handle the loading state
                        const fetchedFolders = await fetchFolders(email, id, setIsLoading);
                        const filteredFolders = fetchedFolders.filter(folder => folder.cleanDataExist);
                        setFolders(filteredFolders);
                        setHasCleanData(filteredFolders.length > 0);
                    } catch (error) {
                        message.error('Failed to fetch folders.');
                        console.error('Failed to fetch folders:', error);
                    } finally {
                        setIsLoading(false); // Ensure this is only called once
                    }
                } else {
                    console.error("Invalid id type:", typeof id);
                    message.error("Invalid id type.");
                }
            }
        };

        fetchData();
    }, [id, email]);

    const filteredFolders = useMemo(() => {
        return folders.filter(folder =>
            folder.name.toLowerCase().includes(searchInput.toLowerCase())
        );
    }, [searchInput, folders]);

    return (
        <div className={`${classes.dashboardWrapper} ${classes.prevalidatebtn}`}>
            <div className={classes.heading}>
                <h1>Clean Data Storage</h1>
            </div>

            {hasCleanData && (
                <Link href="/workflows-list" className={`btn btn-outline ${classes.validateBtn}`}>
                    Move to Workflow & Rules
                </Link>
            )}

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : filteredFolders.length === 0 ? (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No Data Storage folders found." />
                </div>
            ) : (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredFolders.map((folder) => (
                        <div key={folder.id} className={`${classes.workspacebox}`}>
                            <div className={`flex gap-1 alinc ${classes.link}`}>
                                <div className={`${classes.workspaceName} flex gap-1`}>
                                    <Image src={folderIcon} alt="Folder Icon" width={32} height={32} />
                                    <p>
                                        <b>{folder.name}</b>
                                    </p>
                                </div>
                                <div className={`${classes.storage} flex gap-1 alinc`}>
                                    <p className={classes.storageValue}>
                                        {folder.cleanFileSize}
                                        <br />
                                        {folder.cleanLastUpdated}
                                    </p>
                                    <div className={classes.dropdownWorkspace}>
                                        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
                                            <Button
                                                className={classes.btnBlank}
                                                onClick={() => setSelectedFolder(folder)}
                                                data-folder-id={folder.id}
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

            <PreviewFolderModal
                visible={isPreviewModalVisible}
                onCancel={handlePreviewModalCancel}
                workspaceId={id}
                folderName={selectedFolder?.id || ""}
            />

            {selectedFolder && (
                <DeleteModal
                    open={isDeleteModalVisible}
                    entityName="Cleaned File"
                    entityId={selectedFolder.id}
                    onDelete={async (folderId) => {
                        const success = await deleteFolder(folderId);
                        if (success) {
                            message.success('Folder deleted successfully!');
                            updateFolderListAfterDelete(folderId);
                            handleDeleteModalCancel();
                        }
                    }}
                    onOk={() => {
                        updateFolderListAfterDelete(selectedFolder.id);
                        handleDeleteModalCancel();
                    }}
                    onCancel={handleDeleteModalCancel}
                />
            )}
        </div>
    );
};

export default DataStorageFolder;
