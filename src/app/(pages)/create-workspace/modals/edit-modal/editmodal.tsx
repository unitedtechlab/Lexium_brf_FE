import { Modal, Input, Button, Form, message } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import { getToken } from '@/utils/auth';

interface EditWorkspaceModalProps {
    open: boolean;
    workspaceId: string;
    initialWorkspaceName: string;
    onOk: (newName: string) => void;
    onCancel: () => void;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({ open, workspaceId, initialWorkspaceName, onOk, onCancel }) => {
    const [newName, setNewName] = useState(initialWorkspaceName);
    const { email } = useEmail();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setNewName(initialWorkspaceName);
    }, [initialWorkspaceName]);

    const handleOk = async () => {
        setIsLoading(true);
        try {
            const token = getToken(); // Get the token
            const response = await axios.put(`${BaseURL}/workspace`, {
                UserEmail: email,
                workSpace: workspaceId,
                Data: newName
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                message.success("Workspace renamed successfully");
                onOk(newName);
            }
        } catch (error) {
            message.error("Failed to rename workspace");
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            title="Rename Workspace"
            centered
            open={open}
            onOk={handleOk}
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
            <Form name="workspace" layout="vertical" id="editmodal-form">
                <Form.Item
                    name="workSpace"
                    label="New Workspace Name"
                    rules={[{ required: true, message: "Please input the new workspace name!" }]}
                >
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new workspace name"
                        id='workspace-name'
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditWorkspaceModal;
