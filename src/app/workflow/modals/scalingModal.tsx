import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Form, Row, Col, message, Radio, Input } from 'antd';
import { fetchFolderData } from '@/app/API/api';
import type { RadioChangeEvent } from 'antd';

interface ScalingModalProps {
    isModalVisible: boolean;
    handleOkay: (values: any) => void;
    handleCancel: () => void;
    connectedTable: string | null;
    folders: any[];
    selectedWorkspace: string | null;
    email: string;
    initialValues?: any;
}

const ScalingModal: React.FC<ScalingModalProps> = ({
    isModalVisible,
    handleOkay,
    handleCancel,
    connectedTable,
    folders,
    selectedWorkspace,
    email,
    initialValues,
}) => {
    const [form] = Form.useForm();
    const [columns, setColumns] = useState<{ key: string, name: string }[]>([]);
    const [columnDataTypes, setColumnDataTypes] = useState<{ [key: string]: string }>({});
    const [selectedScalingFunction, setSelectedScalingFunction] = useState<string | null>(null);
    const [selectedColumnName, setSelectedColumnName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setSelectedScalingFunction(null);
        if (connectedTable) {
            handleTableChange(connectedTable);
        }
        if (initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [connectedTable, initialValues]);

    const handleTableChange = async (tableId: string) => {
        setIsLoading(true);

        try {
            const selectedFolder = folders.find(folder => folder.id === tableId);
            if (selectedFolder) {
                const columnsArray = selectedFolder.columns
                    ? Object.entries(selectedFolder.columns).map(([key, name]) => ({ key, name: name as string }))
                    : [];
                setColumns(columnsArray);

                const confirmedDataTypes = await fetchFolderData(email, selectedWorkspace!, tableId);
                setColumnDataTypes(confirmedDataTypes);
            }
        } catch (error) {
            message.error('Failed to fetch columns or data type.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleColumnChange = (value: string) => {
        const column = columns.find(col => col.key === value);
        if (column) {
            const dataType = columnDataTypes[column.name] || null;
            if (dataType === 'number') {
                setSelectedColumnName(column.name);
            } else {
                message.error('Selected column is not a number type.');
            }
        } else {
            console.log("Column not found for key:", value);
        }
    };

    const onOk = () => {
        form.validateFields()
            .then(values => {
                values.column = selectedColumnName;
                handleOkay(values);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const handleScalingFunctionChange = (e: RadioChangeEvent) => {
        setSelectedScalingFunction(e.target.value);
    };

    return (
        <Modal
            title="Scaling Functions"
            open={isModalVisible}
            onOk={onOk}
            centered
            onCancel={handleCancel}
            width={'100%'}
            className='max-width-md'
            footer={[
                <Button key="cancel" onClick={handleCancel} className="btn btn-outline">
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={onOk} className="btn">
                    Save
                </Button>,
            ]}
        >
            <Form
                form={form}
                name="scalingForm"
                layout="vertical"
                initialValues={initialValues}
            >
                <div className="padding-16">
                    <Row gutter={16}>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="column"
                                label="Select Table Column"
                                rules={[{ required: true, message: 'Please select a column' }]}
                            >
                                <Select
                                    placeholder="Select Column"
                                    onChange={handleColumnChange}
                                >
                                    {columns.map(({ key, name }) => (
                                        <Select.Option key={key} value={key} disabled={columnDataTypes[name] !== 'number'}>
                                            {name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col md={24} sm={24}>
                            <Form.Item
                                name="scalingFunction"
                                label="Scaling Function"
                                rules={[{ required: true, message: 'Please select a scaling function' }]}
                            >
                                <Radio.Group onChange={handleScalingFunctionChange}>
                                    <Radio value="Min Max Scaler">Min Max Scaler</Radio>
                                    <Radio value="Standard Scaler">Standard Scaler</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>

                        {selectedScalingFunction === "Min Max Scaler" && (
                            <>
                                <Col md={12} sm={24}>
                                    <Form.Item
                                        name="minValue"
                                        label="Min Value"
                                        rules={[{ required: true, message: 'Please enter a min value' }]}
                                    >
                                        <Input placeholder="Enter Min Value" type='number' />
                                    </Form.Item>
                                </Col>
                                <Col md={12} sm={24}>
                                    <Form.Item
                                        name="maxValue"
                                        label="Max Value"
                                        rules={[{ required: true, message: 'Please enter a max value' }]}
                                    >
                                        <Input placeholder="Enter Max Value" type='number' />
                                    </Form.Item>
                                </Col>
                            </>
                        )}
                    </Row>
                    <p className='note_text'><b>Note:</b> The scaling function will create a new column named column_name_(scaling_function).</p>
                </div>
            </Form>
        </Modal>
    );
};

export default ScalingModal;
