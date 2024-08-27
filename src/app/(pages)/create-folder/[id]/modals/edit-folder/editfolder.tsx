import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import axios from "axios";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import { getToken } from '@/utils/auth';

interface EditFolderModalProps {
    open: boolean;
    folderId: string;
    workspaceId: string;
    initialFolderName: string;
    onCancel: () => void;
    onEditSuccess: (newName: string) => void;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
    open,
    folderId,
    workspaceId,
    initialFolderName,
    onCancel,
    onEditSuccess,
}) => {
    const [newName, setNewName] = useState(initialFolderName);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setNewName(initialFolderName);
    }, [initialFolderName, open]);

    const handleOk = async () => {
        setIsLoading(true);
        try {
            const token = getToken(); // Get the token
            const response = await axios.put(`${BaseURL}/folder`, {
                userEmail: email,
                workSpace: workspaceId,
                folderName: folderId,
                data: newName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                message.success("Folder renamed successfully");
                onEditSuccess(newName);
            } else {
                message.error("Failed to rename folder");
            }
        } catch (error) {
            console.error("Error renaming folder:", error);
            message.error("Failed to rename folder");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Rename Folder"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="ok" type="primary" onClick={handleOk} className="btn" loading={isLoading}>
                    Rename
                </Button>,
            ]}
        >
            <Form layout="vertical" name="folder" id="edit-folder-form">
                <Form.Item
                    name="folder"
                    label="New Folder Name"
                    initialValue={initialFolderName}
                    rules={[{ required: true, message: "Please input the new Folder name!" }]}
                >
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new Folder name"
                        id="folder-name"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditFolderModal;
