"use client"
import React, { useState } from 'react';
import { Col, Row, Form, Input, Button, message } from 'antd';
import Content from '@/app/components/AuthContent/content';
import classes from '../auth.module.css';
import { BaseURL } from '@/app/constants/index';
import { useRouter } from 'next/navigation';
import { useEmail } from '@/app/context/emailContext';
import { setToken } from "@/utils/auth";
import axios from 'axios';


interface OTPFormValues {
    otp: string;
}

const OTPPage: React.FC = () => {
    const { email } = useEmail();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [form] = Form.useForm();

    const handleSubmit = async (values: OTPFormValues) => {
        try {
            setLoading(true);
            const response = await axios.post(`${BaseURL}/users/verify-otp`,
                { ...values, email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            setLoading(false);
            if (response.status === 200) {
                message.success(response.data.mesage || 'OTP verified successfully. Redirecting to dashboard...');
                setToken(response.data.token);
                router.push('/dashboard');
            } else {
                message.error(response.data.error || 'OTP verification failed. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.error || 'An error occurred while verifying OTP. Please try again.';
                message.error(errorMessage);
            } else {
                message.error('An error occurred. Please try again.');
            }
            console.error('Error:', error);
        }
    };

    const handleResendOTP = async () => {
        try {
            setLoading(true);
            const response = await axios.post(`${BaseURL}/users/resend-otp`,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            setLoading(false);

            if (response.status === 200) {
                message.success(response.data.mesage || 'OTP resent successfully. Please check your email.');
            } else {
                message.error(response.data.error || 'Failed to resend OTP. Please try again.');
            }
        } catch (error) {
            setLoading(false);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.error || 'An error occurred while resending OTP. Please try again.';
                message.error(errorMessage);
            } else {
                message.error('An error occurred. Please try again.');
            }
            console.error('Error:', error);
        }
    };


    return (
        <div className={`${classes.loginWrapper} flex`}>
            <div className="container-fluid">
                <Row gutter={16} className={classes.centerform}>
                    <Col md={12} sm={24}>
                        <Content
                            heading="Welcome Back"
                            description="Sign in to access your data and continue leveraging the power of Bird Eye's analytics and insights."
                        />
                    </Col>
                    <Col md={12} sm={24}>
                        <div className={classes.loginForm}>
                            <div className={classes.formHeading}>
                                <span className={classes.head}>Bird eye</span>
                                <h5>Enter OTP</h5>
                                <p>Please enter the OTP sent to your email</p>
                            </div>
                            <Form
                                layout="vertical"
                                autoComplete="off"
                                scrollToFirstError
                                onFinish={handleSubmit}
                                form={form}
                                id='otp-form'
                            >
                                <Row gutter={16}>
                                    <Col md={24} sm={24} xs={24}>
                                        <Form.Item
                                            name="otp"
                                            label="OTP"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please enter the OTP',
                                                },
                                            ]}
                                        >
                                            <Input placeholder="Enter OTP" id='otp' />
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
                                                Verify OTP
                                            </Button>
                                        </Form.Item>
                                        <Form.Item className="mb-0">
                                            Didn't receive an OTP?{' '}
                                            <a onClick={handleResendOTP} className={classes.link}>
                                                Resend OTP
                                            </a>
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
};

export default OTPPage;
