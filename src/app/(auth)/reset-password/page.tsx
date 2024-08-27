"use client";

import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Col, Row, Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import classes from "../auth.module.css";
import Content from "@/app/components/AuthContent/content";
import { BaseURL } from "@/app/constants/index";
import { decodeToken } from '@/utils/auth';

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const token: string | null = searchParams.get('token');
    let decodedToken = null;
    let emailFromToken = '';

    if (token) {
        decodedToken = decodeToken(token);
        emailFromToken = decodedToken?.email || '';
    }

    useEffect(() => {
        if (emailFromToken) {
            form.setFieldsValue({ email: emailFromToken });
        }
    }, [emailFromToken, form]);


    const handleResetPassword = async (values: { new_password: string }) => {
        try {
            if (!token) {
                throw new Error("No token found.");
            }

            setLoading(true);
            const response = await axios.post(`${BaseURL}/users/reset-password`, {
                new_password: values.new_password,
                email: emailFromToken,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                }
            });

            setLoading(false);

            if (response.status === 200) {
                message.success(response.data.message || "Password reset successfully.");
                router.push("/signin");
            } else {
                message.error(response.data.error || "Failed to reset password. Please try again.");
            }
        } catch (error) {
            setLoading(false);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.error || "An error occurred. Please try again.";
                message.error(errorMessage);
            } else {
                message.error("An error occurred. Please try again.");
            }
        }
    };


    return (
        <div className={`${classes.loginWrapper} flex`}>
            <div className="container-fluid">
                <Row gutter={16} className={classes.centerform}>
                    <Col md={12} sm={24}>
                        <Content
                            heading="See your data. Clearly."
                            description="Unleash the power of your data. Bird Eye simplifies analysis, automates reports, and delivers clear insights to empower informed decisions. "
                        />
                    </Col>
                    <Col md={12} sm={24}>
                        <div className={classes.loginForm}>
                            <div className={classes.formHeading}>
                                <span className={classes.head}>Bird eye</span>
                                <h5>Set New Password 🔐</h5>
                                <p>Please enter your new password below.</p>
                            </div>
                            <Form
                                layout="vertical"
                                autoComplete="off"
                                scrollToFirstError
                                form={form}
                                onFinish={handleResetPassword}
                                id="reset-password"
                            >
                                <Row gutter={16}>
                                    <Col md={24} sm={24} xs={24}>
                                        <Form.Item
                                            name="email"
                                            label="E-mail"
                                            initialValue={emailFromToken}
                                        >
                                            <Input placeholder="Email ID" disabled id="email" />
                                        </Form.Item>
                                    </Col>
                                    <Col md={12} sm={24} xs={24}>
                                        <Form.Item
                                            name="new_password"
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
                                            <Input.Password placeholder="New Password" id="new-password" />
                                        </Form.Item>
                                    </Col>
                                    <Col md={12} sm={24} xs={24}>
                                        <Form.Item
                                            name="confirmPassword"
                                            label="Confirm New Password"
                                            dependencies={["new_password"]}
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please confirm your password!",
                                                },
                                                ({ getFieldValue }) => ({
                                                    validator(_, value) {
                                                        if (!value || getFieldValue("new_password") === value) {
                                                            return Promise.resolve();
                                                        }
                                                        return Promise.reject(
                                                            new Error("The passwords do not match!")
                                                        );
                                                    },
                                                }),
                                            ]}
                                        >
                                            <Input.Password placeholder="Confirm New Password" id="confirm-password" />
                                        </Form.Item>
                                    </Col>
                                    <Col md={24} sm={24} xs={24}>
                                        <Form.Item className="mb-1">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                className="btn full-width"
                                                loading={loading}
                                            >
                                                Reset Password
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}
