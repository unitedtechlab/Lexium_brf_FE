import { Modal, Button, message } from "antd";
import axios from "axios";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import { useState } from "react";
import { getToken } from '@/utils/auth';

interface DeleteFolderModalProps {
    open: boolean;
    folderId: string;
    folderName: string;
    workspaceId: string;
    onCancel: () => void;
    onDeleteSuccess: () => void;
}

const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
    open,
    folderId,
    folderName,
    workspaceId,
    onCancel,
    onDeleteSuccess,
}) => {
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const token = getToken();
            const response = await axios.delete(`${BaseURL}/folder`, {
                params: {
                    userEmail: email,
                    workSpace: workspaceId,
                    folderName: folderId,
                },
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success("Folder deleted successfully");
                onDeleteSuccess();
            } else {
                message.error("Failed to delete folder");
            }
        } catch (error) {
            console.error("Error deleting folder:", error);
            message.error("Failed to delete folder");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Delete Folder"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="delete" type="primary" danger onClick={handleDelete} loading={isLoading} className="btn btn-delete">
                    Delete
                </Button>,
            ]}
        >
            <p>Are you sure you want to delete the folder "{folderName}"?</p>
        </Modal>
    );
};

export default DeleteFolderModal;
