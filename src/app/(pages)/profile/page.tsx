"use client";

import React, { useState } from 'react';
import { useEmail } from '@/app/context/emailContext';
import classes from './profile.module.css';
import { Form, Row, Col, Input, Button } from 'antd';

const Profile: React.FC = () => {
    const { email } = useEmail();
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleChangeNewPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    return (
        <div className={classes.profileWrapper}>
            <h5>Profile</h5>
            <Form
                layout="vertical"
                autoComplete="off"
                scrollToFirstError
                initialValues={{ remember: true }}
                id='profile-form'
            >
                <Row gutter={16}>
                    <Col md={24} sm={24} xs={24}>
                        <Form.Item
                            name="email"
                            label="E-mail"
                            rules={[
                                {
                                    type: "email",
                                    message: "The input is not valid E-mail!",
                                },
                                {
                                    required: true,
                                    message: "Please enter your E-mail!",
                                },
                            ]}
                            initialValue={email}
                        >
                            <Input placeholder="Email ID" disabled id='email' />
                        </Form.Item>
                    </Col>
                    <Col md={12} sm={24} xs={24}>
                        <Form.Item
                            name="password"
                            label="Password"
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
                            initialValue={password}
                        >
                            <Input placeholder="Password" onChange={handleChangePassword} id='password' />
                        </Form.Item>
                    </Col>
                    <Col md={12} sm={24} xs={24}>
                        <Form.Item
                            name="new-password"
                            label="New Password"
                        >
                            <Input placeholder="Enter new password" onChange={handleChangeNewPassword} id='confirm-password' />
                        </Form.Item>
                    </Col>
                    <Col md={24} sm={24} xs={24}>
                        <Form.Item className="mb-1">
                            <Button
                                type="primary"
                                htmlType="submit"
                                className="btn"
                            >
                                Update Profile
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>

        </div>
    );
};

export default Profile;
