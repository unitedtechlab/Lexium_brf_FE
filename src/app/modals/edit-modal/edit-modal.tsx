import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, message } from 'antd';

interface EditableModalProps {
    open: boolean;
    title: string;
    initialValue: string;
    fieldLabel: string;
    onSubmit: (newValue: string) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const EditableModal: React.FC<EditableModalProps> = ({
    open,
    title,
    initialValue,
    fieldLabel,
    onSubmit,
    onCancel,
    isLoading = false
}) => {
    const [value, setValue] = useState(initialValue);
    const [internalLoading, setInternalLoading] = useState(false);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
        setValue(initialValue);
        validateInput(initialValue);
    }, [initialValue]);

    const validateInput = (inputValue: string) => {
        if (inputValue.trim() === '' || inputValue.includes(' ')) {
            setIsValid(false);
        } else {
            setIsValid(true);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValue(newValue);
        validateInput(newValue);
    };

    const handleOk = async () => {
        setInternalLoading(true);
        try {
            await onSubmit(value);
            setInternalLoading(false);
            onCancel();
        } catch (error) {
            setInternalLoading(false);
            message.error(`Failed to update ${title.toLowerCase()}.`);
        }
    };

    return (
        <Modal
            title={title}
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button
                    key="ok"
                    type="primary"
                    onClick={handleOk}
                    className="btn"
                    loading={internalLoading || isLoading}
                    disabled={!isValid}
                >
                    Save
                </Button>,
            ]}
        >
            <Form
                name="editable"
                layout="vertical"
                onFinish={handleOk}
            >
                <Form.Item
                    name="name"
                    label={fieldLabel}
                    rules={[
                        {
                            required: true,
                            message: `Please input the ${fieldLabel.toLowerCase()}!`
                        },
                        {
                            validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject(new Error(`The ${fieldLabel.toLowerCase()} cannot be empty!`));
                                }
                                if (value.includes(' ')) {
                                    return Promise.reject(new Error(`The ${fieldLabel.toLowerCase()} cannot contain spaces!`));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input
                        value={value}
                        onChange={handleInputChange}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditableModal;
