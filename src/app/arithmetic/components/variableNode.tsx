import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Form, Button, Select } from 'antd';
import 'reactflow/dist/style.css';
import styles from '@/app/assets/css/workflow.module.css';
import Image from 'next/image';
import TableImage from '../../assets/images/layout.svg';
import { MdDeleteOutline } from "react-icons/md";

const VariableNode = ({ id, data, type }: NodeProps<any>) => {
    const [fields, setFields] = useState<any[]>([{ type: 'variable', selectedVariable: '' }]);
    const [variables] = useState<string[]>(['name', 'age', 'doctor_name', 'billing_amount', 'gender', 'billing_date']);

    const handleSelectChange = (index: number, value: string) => {
        setFields((prevFields) => {
            const newFields = [...prevFields];
            newFields[index].selectedVariable = value;
            return newFields;
        });

        data[`variable${index + 1}`] = value;
    };

    const addVariableField = () => {
        setFields((prevFields) => [...prevFields, { type: 'variable', selectedVariable: '' }]);
    };

    const handleDelete = (index: number) => {
        setFields((prevFields) => prevFields.filter((_, i) => i !== index));
        delete data[`variable${index + 1}`];
    };

    return (
        <div>
            <div className={styles['nodeBox']} style={{ maxWidth: "370px" }}>
                <Form name="custom-value" layout="vertical">
                    <div className={`flex gap-1 ${styles['node-main']}`}>
                        <div className={`flex gap-1 ${styles['node']}`}>
                            <div className={`flex gap-1 ${styles['nodewrap']}`}>
                                <Image src={TableImage} alt='Table Image' width={32} height={32} />
                                <div className={styles['node-text']}>
                                    <h6>{data.label || "Variable Node"}</h6>
                                    <span>{type || "Node type not found"}</span>
                                </div>
                            </div>
                            <Button onClick={addVariableField}>
                                Add Variable
                            </Button>
                        </div>
                        <div className={`flex gap-1 ${styles.formInput}`}>
                            {fields.map((field, index) => (
                                <Form.Item
                                    key={index}
                                    label={`Field ${index + 1}`}
                                    className={`nodrag ${styles.widthInput} ${styles.fullwidth} customselect`}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select Variable"
                                        value={field.selectedVariable}
                                        onChange={(value) => handleSelectChange(index, value)}
                                        className={`nodrag ${styles.inputField}`}
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option?.children
                                                ? option.children.toString().toLowerCase().includes(input.toLowerCase())
                                                : false
                                        }
                                    >
                                        {variables.map((variable) => (
                                            <Select.Option key={variable} value={variable}>
                                                {variable}
                                            </Select.Option>
                                        ))}
                                    </Select>

                                    {index !== 0 && (
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(index)} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
                                            <MdDeleteOutline />
                                        </button>
                                    )}
                                </Form.Item>
                            ))}
                        </div>
                        <Handle type="source" position={Position.Right} />
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default VariableNode;
