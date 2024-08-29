"use client";

import React, { useState } from "react";
import { Col, Row, Form, Input, Button, message } from "antd";
import Content from "@/app/components/AuthContent/content";
import classes from "../auth.module.css";
import axios from "axios";
import { BaseURL } from "@/app/constants/index";
import Link from "next/link";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRequestPasswordReset = async (values: { email: string }) => {
    try {
      setLoading(true);
      const response = await axios.post(`${BaseURL}/users/forgot-password`, {
        email: values.email,
      });

      setLoading(false);
      if (response.status === 200 && response.data.success) {
        message.success("Password reset link sent to your email.");
      } else {
        message.error(response.data.error || "Failed to send password reset link. Please try again.");
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
              description="Unleash the power of your data. Bird Eye simplifies analysis, automates reports, and delivers clear insights to empower informed decisions."
            />
          </Col>
          <Col md={12} sm={24}>
            <div className={classes.loginForm}>
              <div className={classes.formHeading}>
                <span className={classes.head}>Bird eye</span>
                <h5>Reset Password 🔐</h5>
                <p>
                  To verify your identity, we’ll send a verification code to
                  the following email
                </p>
              </div>
              <Form
                layout="vertical"
                autoComplete="off"
                scrollToFirstError
                form={form}
                onFinish={handleRequestPasswordReset}
                id="forgot-password"
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
                    <Form.Item className="mb-1">
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="btn full-width"
                        loading={loading}
                      >
                        Next
                      </Button>
                    </Form.Item>
                    <Form.Item className="mb-0">
                      Remember Password?{" "}
                      <Link href="/signin" className={classes.link}>
                        Sign In
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
