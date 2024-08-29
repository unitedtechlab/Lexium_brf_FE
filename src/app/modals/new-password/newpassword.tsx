import React, { useState } from "react";
import axios from 'axios';
import { Modal, Form, Input, Button, message } from 'antd';
import { BaseURL } from "@/app/constants/index";
import { useSearchParams } from "next/navigation";

interface PasswordModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ open, onCancel, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (values: { password: string, confirmPassword: string }) => {
        try {
            setLoading(true);
            const response = await axios.post(`${BaseURL}/users/reset-password`, {
                new_password: values.password,
                email: email,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            setLoading(false);

            if (response.status === 200) {
                message.success(response.data.message || "Password reset successfully.");
                onSuccess();
            } else {
                message.error(response.data.message || "Failed to reset password. Please try again.");
            }
        } catch (error) {
            setLoading(false);
            message.error("An error occurred. Please try again.");
        }
    };

    return (
        <Modal
            title="Set New Password"
            centered
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()} className="btn">
                    Submit
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="passwordModal"
                onFinish={handleSubmit}
                layout="vertical"
                id="new-password-form"
            >
                <Form.Item
                    name="password"
                    label="New Password"
                    rules={[
                        {
                            required: true,
                            message: "Please enter your new password!",
                        },
                        {
                            min: 8,
                            message: "Password must be at least 8 characters long!",
                        },
                        {
                            pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                            message: "It must contain letters, numbers, and symbols!",
                        },
                    ]}
                >
                    <Input.Password placeholder="Enter new password" id="new-password" />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Confirm New Password"
                    dependencies={["password"]}
                    rules={[
                        {
                            required: true,
                            message: "Please confirm your new password!",
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("The passwords do not match!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirm new password" id="confirm-new-password" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PasswordModal;
