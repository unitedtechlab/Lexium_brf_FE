"use client";

import React, { useState } from "react";
import { Col, Row, Divider, Form, Input, Button, message, Checkbox } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import GoogleImg from "@/app/assets/images/google.png";
import MicrosoftImg from "@/app/assets/images/Microsoft.png";
import classes from "../auth.module.css";
import Content from "@/app/components/AuthContent/content";
import { BaseURL } from "@/app/constants/index";
import { useEmail } from "@/app/context/emailContext";
import { setToken } from "@/utils/auth";
import axios from 'axios';

interface SignInFormValues {
  email: string;
  password: string;
  remember?: string;
}

export default function SignIn() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setEmail } = useEmail();

  const handleSignIn = async (values: SignInFormValues) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BaseURL}/users/login`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setLoading(false);
      if (response.status === 200) {
        const { token, message: successMessage } = response.data.data;
        message.success(successMessage || "Signin successful.");
        setToken(token);
        setEmail(values.email);
        router.push("/dashboard");
      } else {
        message.error(response.data.error || "Signin failed. Please try again.");
      }
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data.error || "Invalid email or password";
        message.error(errorMessage);
      } else {
        message.error("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${BaseURL}/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    window.location.href = `${BaseURL}/auth/microsoft`;
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
                <h5>Welcome Back 👋</h5>
                <p>Enter your credentials to access your account</p>
              </div>
              <div className={`flex ${classes.googleMicrosoft}`}>
                <Button
                  className={classes.btnGoogle}
                  onClick={handleGoogleSignIn}
                >
                  <Image
                    src={GoogleImg}
                    alt="Google Icon"
                    width="20"
                    height="20"
                    priority
                  />
                  Login with Google
                </Button>
                <Button
                  className={classes.btnGoogle}
                  onClick={handleMicrosoftSignIn}
                >
                  <Image
                    src={MicrosoftImg}
                    alt="Microsoft Icon"
                    width="20"
                    height="20"
                    priority
                  />
                  Login with Microsoft
                </Button>
              </div>
              <Divider>OR</Divider>
              <Form
                layout="vertical"
                autoComplete="off"
                scrollToFirstError
                onFinish={handleSignIn}
                form={form}
                initialValues={{ remember: true }}
                id="signin-form"
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
                    >
                      <Input placeholder="Email ID" id="email" />
                    </Form.Item>
                  </Col>
                  <Col md={24} sm={24} xs={24}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your password!",
                        },
                      ]}
                    >
                      <Input.Password placeholder="Password" id="password" />
                    </Form.Item>
                  </Col>
                  <Col md={24} sm={24} xs={24}>
                    <div className="flex forgot-pass">
                      <Link href="/forgot-password">Forget your password</Link>
                    </div>
                    <Form.Item
                      name="remember"
                      valuePropName="checked"
                      className="custom-checkbox"
                    >
                      <Checkbox id="remember">Remember me</Checkbox>
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
                        Sign In
                      </Button>
                    </Form.Item>
                    <Form.Item className="mb-0">
                      Don't have an account?{" "}
                      <Link href="/signup" className={classes.link}>
                        Sign up
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
}
