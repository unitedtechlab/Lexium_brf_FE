import { Modal, Input, Button, Form, message } from "antd";
import { useState } from "react";
import axios from "axios";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from '@/app/context/emailContext';
import { getToken } from '@/utils/auth';

interface CreateFolderModalProps {
    open: boolean;
    workspaceId: string;
    onOk: () => void;
    onCancel: () => void;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ open, workspaceId, onOk, onCancel }) => {
    const [folderName, setFolderName] = useState("");
    const { email } = useEmail();
    const [form] = Form.useForm();

    const handleOk = async () => {
        const requestData = {
            userEmail: email,
            workSpace: workspaceId,
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
                onOk();
                form.resetFields();  // Reset form fields after successful creation
            } else {
                const result = response.data;
                message.error(result.message || "Failed to create folder");
            }
        } catch (error) {
            console.error("Error creating folder:", error);
            message.error("Failed to create folder. Please try again later.");
        }
    };

    const handleCancel = () => {
        onCancel();
        form.resetFields();  // Reset form fields when modal is cancelled
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFolderName(e.target.value);
    };

    return (
        <Modal
            title="Create Folder"
            centered
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleOk} className="btn">
                    Create
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" id="folder-form">
                <Form.Item
                    name="folderName"
                    label="Folder Name"
                    rules={[{ required: true, message: "Please enter a folder name" }]}
                >
                    <Input value={folderName} onChange={handleInputChange} id="folder-name" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateFolderModal;
