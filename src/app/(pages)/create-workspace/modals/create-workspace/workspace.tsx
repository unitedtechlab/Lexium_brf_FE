import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { BaseURL } from "@/app/constants/index";
import axios from 'axios';
import { useEmail } from '@/app/context/emailContext';
import { getToken } from '@/utils/auth';

interface WorkspaceModalProps {
    open: boolean;
    onOk: () => void;
    onCancel: () => void;
}

const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ open, onOk, onCancel }) => {
    const [form] = Form.useForm();
    const { email } = useEmail();

    const handleSubmit = async (values: any) => {
        const requestData = {
            UserEmail: email,
            WorkSpace: values.projectName,
        };

        try {
            const token = getToken();
            const response = await axios.post(`${BaseURL}/workspace`, requestData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 200) {
                message.success('Workspace created successfully!');
                onOk();
                form.resetFields();
            } else {
                message.error(response.data.message || 'Failed to create workspace.');
            }
        } catch (error) {
            message.error('Failed to create workspace.');
        }
    };

    return (
        <Modal
            title="Create Workspace"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="submit" type="primary" className="btn" onClick={() => form.submit()}>
                    Create
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="workspace"
                onFinish={handleSubmit}
                layout="vertical"
                id='workspace-form'
            >
                <Form.Item
                    name="projectName"
                    label="Workspace Name"
                    rules={[{ required: true, message: 'Please input the workspace name!' }]}
                >
                    <Input placeholder='Workspace Name' id='workspace-name' />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default WorkspaceModal;
