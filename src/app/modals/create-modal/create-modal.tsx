// CreateModal.tsx
import React, { useState } from 'react';
import { Modal, Form, Input, Button } from 'antd';

interface CreateModalProps {
    open: boolean;
    title: string;
    fieldLabel: string;
    onSubmit: (value: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}

const CreateModal: React.FC<CreateModalProps> = ({ open, title, fieldLabel, onSubmit, onCancel, isLoading }) => {
    const [form] = Form.useForm();
    const [isInputValid, setIsInputValid] = useState(true);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (isInputValid) {
                onSubmit(values.field);
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Check if the input contains spaces
        setIsInputValid(!/\s/.test(value));
    };

    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            onCancel={onCancel}
            confirmLoading={isLoading}
            centered
            okText="Create"
            cancelText="Cancel"
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleOk}
                    className="btn"
                    disabled={!isInputValid}
                >
                    Create
                </Button>,
            ]}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="field"
                    label={fieldLabel}
                    rules={[
                        { required: true, message: `Please enter ${fieldLabel}` },
                        { pattern: /^[^\s]*$/, message: `${fieldLabel} cannot contain spaces` }
                    ]}
                >
                    <Input onChange={handleInputChange} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateModal;
