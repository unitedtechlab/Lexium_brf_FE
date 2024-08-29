'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import axios from "axios";
import Searchbar from "@/app/components/Searchbar/search";
import View from "@/app/components/GridListView/view";
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

const DeleteFileModal = dynamic(() => import('./modals/delete-file/deletefile'));
const EditFileModal = dynamic(() => import('./modals/edit-file/editfile'));
const EstablishmentColumnModal = dynamic(() => import('@/app/modals/establishment-column/establishcolumn'));
const Loader = dynamic(() => import('@/app/loading'), { ssr: false });

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
    const [isLoading, setIsLoading] = useState(false);
    const [isEstablishmentModalVisible, setIsEstablishmentModalVisible] = useState(false);
    const [isFolderEstablished, setIsFolderEstablished] = useState(false);
    const token = useMemo(() => getToken(), []);

    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const loadFiles = async () => {
        if (email && workspace && folder) {
            try {
                const fetchedFiles = await fetchFiles(email, workspace, folder, setIsLoading);
                setFiles(fetchedFiles);
            } catch (error) {
                message.error("Failed to fetch files.");
            }
        } else {
            message.error("Email, workspace, and folder are required to fetch files.");
        }
    };

    const loadFolderData = async () => {
        if (email && workspace) {
            try {
                const fetchedFolders = await fetchFolders(email, workspace, setIsLoading);
                const currentFolder = fetchedFolders.find(f => f.id.toUpperCase() === folder?.toUpperCase());
                if (currentFolder) {
                    setIsFolderEstablished(currentFolder.columnsEstablised);
                } else {
                    message.error("Folder not found.");
                }
            } catch (error) {
                console.error("Error fetching folder data:", error);
                message.error("Failed to fetch folder data.");
            }
        }
    };

    useEffect(() => {
        loadFiles();
        loadFolderData();
        if (workspace && folder) {
            setBreadcrumbs([
                { href: `/create-workspace`, label: `${workspace.replace(/-/g, ' ')} Workspace` },
                { href: `/create-folder/${id}`, label: `${folder.replace(/-/g, ' ')} Folder` },
            ]);
        }
    }, [workspace, folder, email, id]);

    const items = (file: FileData, index: number): MenuProps["items"] => {
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

    const updateFileName = (fileId: string, newName: string) => {
        const updatedFiles = files.map((file) =>
            file.id === fileId ? { ...file, name: newName } : file
        );
        setFiles(updatedFiles);
    };

    const handleEstablishColumns = async (columnsData: { [key: string]: string }) => {
        if (!selectedFile) return;

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
        }
    };

    const handleEstablishFolderColumns = async (columnsData: { [key: string]: string }) => {
        if (!workspace || !folder) return;

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

            {filteredFiles.length > 0 ? (
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
                                            <Dropdown menu={{ items: items(file, index) }} trigger={["click"]}>
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
            ) : isLoading ? (
                <Loader />
            ) : (
                <div className={classes.noFoldersMessage}>
                    <Empty description="No Files Found" />
                </div>
            )}

            <DeleteFileModal
                fileId={selectedFile?.id || ''}
                workspaceId={typeof id === 'string' ? id : ''}
                folderName={folder || ''}
                open={isDeleteModalVisible}
                onCancel={cancelDeleteFile}
                onDeleteSuccess={onDeleteSuccess}
            />

            <EditFileModal
                visible={isEditModalVisible}
                workspace={workspace || ''}
                folderName={folder || ''}
                fileName={editingFile?.name || ''}
                onCancel={cancelEditFile}
                onOk={(newName: string) => {
                    setIsEditModalVisible(false);
                    updateFileName(selectedFile?.id || '', newName);
                    setSelectedFile(null);
                    loadFiles();
                }}
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
