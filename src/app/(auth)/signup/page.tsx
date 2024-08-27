"use client"
import React, { useState } from "react";
import { Col, Row, Divider, Form, Input, Button, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GoogleImg from "@/app/assets/images/google.svg";
import MicrosoftImg from "@/app/assets/images/Microsoft.svg";
import classes from "../auth.module.css";
import Content from "@/app/components/AuthContent/content";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import axios from 'axios';

interface SignUpFormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setEmail } = useEmail();

  const handleSignUp = async (values: SignUpFormValues) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BaseURL}/users/signup`, values, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setLoading(false);
      if (response.status === 200) {
        message.success('Signup successful. Please verify your email.');
        setEmail(values.email);
        router.push('/otp');
      } else {
        message.error(response.data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || 'An error occurred during signup. Please try again.';
        message.error(errorMessage);
      } else {
        message.error('An error occurred. Please try again.');
      }
    }
  };

  const handleGoogleSignUp = () => {
    const googleOAuthURL = `${BaseURL}/auth/google`;
    window.location.href = googleOAuthURL;
  };

  const handleMicrosoftSignUp = () => {
    const microsoftOAuthURL = `${BaseURL}/auth/microsoft`;
    window.location.href = microsoftOAuthURL;
  };

  return (
    <div className={`${classes.loginWrapper} flex`}>
      <div className="container-fluid">
        <Row gutter={16} className={classes.centerform}>
          <Col md={12} sm={24}>
            <Content
              heading="See your data. Clearly."
              description="Unleash the power of your data. Bird Eye simplifies analysis, automates reports, and delivers clear insights to empower informed decisions."
            />
          </Col>
          <Col md={12} sm={24}>
            <div className={classes.loginForm}>
              <div className={classes.formHeading}>
                <span className={classes.head}>Bird eye</span>
                <h5>Get Started Now</h5>
                <p>Sign up for free to access any of our products</p>
              </div>
              <div className={`flex ${classes.googleMicrosoft}`}>
                <Button
                  className={classes.btnGoogle}
                  onClick={handleGoogleSignUp}
                >
                  <Image
                    src={GoogleImg}
                    alt="Google Icon"
                    width="20"
                    height="20"
                    priority
                  />
                  Signup with Google
                </Button>
                <Button
                  className={classes.btnGoogle}
                  onClick={handleMicrosoftSignUp}
                >
                  <Image
                    src={MicrosoftImg}
                    alt="Microsoft Icon"
                    width="20"
                    height="20"
                    priority
                  />
                  Signup with Microsoft
                </Button>
              </div>
              <Divider>OR</Divider>
              <Form
                layout="vertical"
                autoComplete="off"
                scrollToFirstError
                onFinish={handleSignUp}
                form={form}
                id="signup-form"
              >
                <Row gutter={16}>
                  <Col md={12} sm={24} xs={24}>
                    <Form.Item
                      name="first_name"
                      label="First Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your First Name",
                        },
                      ]}
                    >
                      <Input placeholder="First Name" id="first-name" />
                    </Form.Item>
                  </Col>
                  <Col md={12} sm={24} xs={24}>
                    <Form.Item
                      name="last_name"
                      label="Last Name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your Last Name",
                        },
                      ]}
                    >
                      <Input placeholder="Last Name" id="last-name" />
                    </Form.Item>
                  </Col>
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
                    >
                      <Input placeholder="Email ID" id="email" />
                    </Form.Item>
                  </Col>
                  <Col md={12} sm={24} xs={24}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your password!",
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
                      <Input.Password placeholder="Password" id="password" />
                    </Form.Item>
                  </Col>
                  <Col md={12} sm={24} xs={24}>
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      dependencies={["password"]}
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("The passwords do not match!")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Confirm Password" id="confirm-password" />
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
                        Start Free Trial
                      </Button>
                    </Form.Item>
                    <Form.Item className="mb-0">
                      Already have an account?{" "}
                      <Link href="/signin" className={classes.link}>
                        Sign in
                      </Link>
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

export default SignUpPage;
