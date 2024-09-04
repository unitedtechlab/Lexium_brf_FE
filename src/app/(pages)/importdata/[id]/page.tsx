'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import axios from "axios";
import classes from "@/app/assets/css/pages.module.css";
import { Button, Dropdown, message, Empty, Tooltip } from "antd";
import type { MenuProps } from "antd";
import Image from "next/image";
import fileIcon from "@/app/assets/images/file.svg";
import { BiDotsVerticalRounded } from "react-icons/bi";
import BreadCrumb from "@/app/components/Breadcrumbs/breadcrumb";
import { useEmail } from "@/app/context/emailContext";
import Link from "next/link";
import { FileData } from '@/app/types/interface';
import { fetchFiles, fetchFolders } from '@/app/API/api';
import { BaseURL } from '@/app/constants/index';
import { getToken } from '@/utils/auth';

const EditableModal = dynamic(() => import('@/app/modals/edit-modal/edit-modal'), { ssr: false });
const EstablishmentColumnModal = dynamic(() => import('@/app/modals/establishment-column/establishcolumn'), { ssr: false });
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });
const DeleteModal = dynamic(() => import('@/app/modals/delete-modal/delete-modal'), { ssr: false });
const Searchbar = dynamic(() => import('@/app/components/Searchbar/search'), { ssr: false });
const View = dynamic(() => import('@/app/components/GridListView/view'), { ssr: false });

export default function ImportData() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const workspace = searchParams.get('workspace');
    const folder = searchParams.get('folder');
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");
    const [breadcrumbs, setBreadcrumbs] = useState<{ href: string; label: string }[]>([]);
    const [files, setFiles] = useState<FileData[]>([]);
    const { email } = useEmail();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingFile, setEditingFile] = useState<FileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEstablishmentModalVisible, setIsEstablishmentModalVisible] = useState(false);
    const [isFolderEstablished, setIsFolderEstablished] = useState(false);
    const token = useMemo(() => getToken(), []);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const loadFiles = useCallback(async () => {
        if (email && workspace && folder) {
            setIsLoading(true);
            try {
                const fetchedFiles = await fetchFiles(email, workspace, folder, () => { });
                setFiles(fetchedFiles);
            } catch (error) {
                message.error("Failed to fetch files.");
            } finally {
                setIsLoading(false);
            }
        } else {
            message.error("Email, workspace, and folder are required to fetch files.");
        }
    }, [email, workspace, folder]);

    const loadFolderData = useCallback(async () => {
        if (email && workspace) {
            setIsLoading(true);
            try {
                const fetchedFolders = await fetchFolders(email, workspace, () => { });
                const currentFolder = fetchedFolders.find(f => f.id.toUpperCase() === folder?.toUpperCase());
                if (currentFolder) {
                    setIsFolderEstablished(currentFolder.columnsEstablised);
                } else {
                    message.error("Folder not found.");
                }
            } catch (error) {
                console.error("Error fetching folder data:", error);
                message.error("Failed to fetch folder data.");
            } finally {
                setIsLoading(false);
            }
        }
    }, [email, workspace, folder]);

    useEffect(() => {
        loadFiles();
        loadFolderData();
        if (workspace && folder) {
            setBreadcrumbs([
                { href: `/create-workspace`, label: `${workspace.replace(/-/g, ' ')} Workspace` },
                { href: `/create-folder/${id}`, label: `${folder.replace(/-/g, ' ')} Folder` },
            ]);
        }
    }, [workspace, folder, email, id, loadFiles, loadFolderData]);

    const items = (file: FileData): MenuProps["items"] => {
        const menuItems: MenuProps["items"] = [
            {
                label: "Edit File",
                key: "edit",
                onClick: () => handleEditFile(file),
            },
            {
                label: "Delete File",
                key: "delete",
                onClick: () => handleDeleteFile(file),
            },
            {
                label: "Establishment Column",
                key: "establishment-column",
                onClick: () => {
                    if (isFolderEstablished) {
                        router.push(`/column-establishment?workspace=${workspace}&folder=${folder}&file=${file.name}`);
                    } else {
                        setSelectedFile(file);
                        setIsEstablishmentModalVisible(true);
                    }
                },
                disabled: file.established,
            }
        ];

        if (isFolderEstablished && file.established) {
            menuItems.push({
                label: "Edit Establishment Column",
                key: "edit-establishment-column",
                onClick: () => {
                    router.push(`/column-establishment?workspace=${workspace}&folder=${folder}&file=${file.name}`);
                },
            });
        }
        return menuItems;
    };

    const handleDeleteFile = (file: FileData | null) => {
        setSelectedFile(file);
        setIsDeleteModalVisible(true);
    };

    const handleEditFile = (file: FileData | null) => {
        setEditingFile(file);
        setIsEditModalVisible(true);
    };

    const cancelDeleteFile = () => {
        setSelectedFile(null);
        setIsDeleteModalVisible(false);
    };

    const cancelEditFile = () => {
        setEditingFile(null);
        setIsEditModalVisible(false);
    };

    const onDeleteSuccess = () => {
        cancelDeleteFile();
        loadFiles();
    };

    const deleteFile = async (fileId: string) => {
        if (!email || !workspace || !folder) return;
        setIsLoading(true);
        try {
            await axios.delete(`${BaseURL}/file`, {
                params: {
                    userEmail: email,
                    workSpace: workspace,
                    folderName: folder,
                    fileName: fileId,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            message.success('File deleted successfully!');
            removeFile(fileId);
        } catch (error) {
            message.error('Failed to delete file');
            console.error("Error deleting file:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeFile = (fileId: string) => {
        setFiles(files.filter((file) => file.id !== fileId));
    };

    const updateFileName = async (fileId: string, newName: string) => {
        if (!email || !workspace || !folder) return;
        setIsLoading(true);
        try {
            const requestData = {
                userEmail: email,
                workSpace: workspace.toUpperCase(),
                folderName: folder.toUpperCase(),
                fileName: fileId,
                data: newName,
            };

            const response = await axios.put(`${BaseURL}/file`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                setFiles(files.map(file => file.id === fileId ? { ...file, name: newName } : file));
                message.success('File name updated successfully');
                setIsEditModalVisible(false);
                loadFiles();
            } else {
                console.error('Failed to update file name - status:', response.status, response.data);
                message.error('Failed to update file name.');
            }
        } catch (error) {
            console.error('Error updating file name:', error);
            message.error('Failed to update file name.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEstablishColumns = async (columnsData: { [key: string]: string }) => {
        if (!selectedFile) return;
        setIsLoading(true);
        try {
            await axios.post(`${BaseURL}/establish_file_columns`, {
                userEmail: email,
                workSpace: workspace,
                folderName: folder,
                fileName: selectedFile.name,
                data: columnsData,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            message.success("Columns established successfully.");
            setIsEstablishmentModalVisible(false);

            const updatedFiles = files.map((file) =>
                file.id === selectedFile.id ? { ...file, established: true } : file
            );
            setFiles(updatedFiles);
            setIsFolderEstablished(true);
        } catch (error) {
            console.error("Error establishing columns:", error);
            message.error("Failed to establish columns.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEstablishFolderColumns = async (columnsData: { [key: string]: string }) => {
        if (!workspace || !folder) return;
        setIsLoading(true);
        try {
            await axios.post(`${BaseURL}/establish_folder_columns`, {
                userEmail: email,
                workSpace: workspace,
                folderName: folder,
                data: columnsData,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            setIsEstablishmentModalVisible(false);
            setIsFolderEstablished(true);

            const updatedFiles = files.map((file, index) =>
                index === 0 ? { ...file, established: true } : file
            );
            setFiles(updatedFiles);
            loadFiles();
        } catch (error) {
            console.error("Error establishing folder columns:", error);
            message.error("Failed to establish folder columns.");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    return (
        <div className={`${classes.dashboardWrapper} ${classes.prevalidatebtn}`}>
            <div className={classes.heading}>
                <h1>File Management</h1>
            </div>

            <Tooltip title={!isFolderEstablished ? "Need to establish at least one data source file" : ""}>
                <div className={classes.validateBtn}>
                    <Link href="/data-prevalidation" passHref>
                        <Button
                            className="btn"
                            disabled={!isFolderEstablished}
                        >
                            Move to Pre-validation
                        </Button>
                    </Link>
                </div>
            </Tooltip>

            <div className={`${classes.searchView} flex justify-space-between gap-1`}>
                <BreadCrumb breadcrumbs={breadcrumbs} />
                <div className={`${classes.searchlist} flex gap-1`}>
                    <Searchbar value={searchInput} onChange={handleSearchInputChange} />
                    <div className="flex gap-1">
                        <View />
                        <Link href={`/importdata/${id}/importfile?workspace=${workspace}&folder=${folder}`} passHref>
                            <Button className="btn">Import Data</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Loader />
            ) : filteredFiles.length > 0 ? (
                <div className={`${classes.workspaceCreate} flex gap-2`}>
                    {filteredFiles.map((file, index) => (
                        <Tooltip key={index} title={!file.established ? "Establish columns for this data source" : ""}>
                            <div className={`${classes.workspacebox} ${!file.established ? classes['not-established'] : ''}`}>
                                <div className={`flex gap-1 alinc ${classes.link}`}>
                                    <div className={`${classes.workspaceName} flex gap-1`}>
                                        <Image src={fileIcon} alt="File Icon" width={35} height={35} />
                                        <p>
                                            <b>{file.name.toUpperCase()}</b>
                                        </p>
                                    </div>
                                    <div className={`${classes.storage} flex gap-1 alinc`}>
                                        <p className={classes.storageValue}>
                                            {file.fileSize}
                                            <br />
                                            {file.lastUpdated}
                                        </p>
                                        <div className={classes.dropdownWorkspace}>
                                            <Dropdown menu={{ items: items(file) }} trigger={["click"]}>
                                                <Button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedFile(file);
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
                        </Tooltip>
                    ))}
                </div>
            ) : (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No Files Found" />
                </div>
            )}

            {selectedFile && (
                <DeleteModal
                    open={isDeleteModalVisible}
                    entityName="File"
                    entityId={selectedFile.id}
                    onDelete={() => deleteFile(selectedFile.id)}
                    onOk={onDeleteSuccess}
                    onCancel={cancelDeleteFile}
                />
            )}

            <EditableModal
                open={isEditModalVisible}
                title="Edit File Name"
                initialValue={editingFile?.name || ''}
                fieldLabel="New File Name"
                onSubmit={async (newName: string) => {
                    if (editingFile) {
                        await updateFileName(editingFile.id, newName);
                    }
                }}
                onCancel={cancelEditFile}
                isLoading={isLoading}
            />

            <EstablishmentColumnModal
                isModalOpen={isEstablishmentModalVisible}
                setIsModalOpen={setIsEstablishmentModalVisible}
                workSpace={workspace || ''}
                folderName={folder || ''}
                fileName={selectedFile?.name || ''}
                onSave={(columnsData) => {
                    handleEstablishColumns(columnsData);
                    handleEstablishFolderColumns(columnsData);
                }}
            />
        </div>
    );
}
